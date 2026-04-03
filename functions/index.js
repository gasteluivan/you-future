import { initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { randomUUID } from 'node:crypto';
import { GoogleGenAI } from '@google/genai';
import * as logger from 'firebase-functions/logger';
import { defineSecret } from 'firebase-functions/params';
import { HttpsError, onCall } from 'firebase-functions/v2/https';

initializeApp({
  storageBucket: 'your-future-gni.firebasestorage.app',
});

const db = getFirestore();
const bucket = getStorage().bucket();
const GEMINI_API_KEY = defineSecret('GEMINI_API_KEY');
const MODEL_NAME = 'gemini-2.5-flash-image';

const presetPrompts = {
  doctor:
    'Dress the person in a clean modern doctor outfit with a professional white coat, subtle stethoscope cues and a refined hospital or clinic environment.',
  teacher:
    'Dress the person like a thoughtful teacher with polished approachable clothing inside a bright classroom or learning space.',
  engineer:
    'Dress the person as an engineer with practical smart attire inside a modern design, industrial or technology environment.',
  chef:
    'Dress the person as a chef with an elegant culinary jacket in a premium kitchen setting.',
  firefighter:
    'Dress the person as a firefighter with realistic rescue gear, no flames touching the face, and a controlled emergency-response environment.',
  pilot:
    'Dress the person as an airline pilot with a professional aviation uniform inside a cockpit or airport setting.',
  scientist:
    'Dress the person as a scientist with refined lab attire and a contemporary research environment.',
  artist:
    'Dress the person as an artist with expressive creative clothing inside a visually rich studio.',
  architect:
    'Dress the person as an architect with elegant professional attire, plans and a design studio atmosphere.',
  'heavy-equipment-operator':
    'Dress the person as a heavy equipment operator with a hard hat, reflective safety vest and machinery-focused industrial environment.',
};

function parseImageDataUrl(imageDataUrl) {
  const matches = imageDataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);

  if (!matches) {
    throw new HttpsError('invalid-argument', 'The provided image is not a valid data URL.');
  }

  const mimeType = matches[1];
  const base64Data = matches[2];
  const extension = mimeType.includes('png') ? 'png' : 'jpg';
  const buffer = Buffer.from(base64Data, 'base64');

  if (buffer.length > 7 * 1024 * 1024) {
    throw new HttpsError('invalid-argument', 'The captured image is too large.');
  }

  return { mimeType, base64Data, buffer, extension };
}

function getProfessionLabel(profession) {
  if (!profession) {
    return 'Unknown profession';
  }

  if (profession.kind === 'preset') {
    return profession.labelEn || profession.label || profession.labelEs || 'Unknown profession';
  }

  return profession.label || 'Unknown profession';
}

function buildProfessionInstruction(profession) {
  const professionLabel = getProfessionLabel(profession);
  const presetPrompt = profession?.id ? presetPrompts[profession.id] : '';

  return profession?.kind === 'custom'
    ? `Dress the person exactly as this profession description suggests: "${profession.label}". Use realistic clothing, tools and setting for that role.`
    : presetPrompt || `Dress the person as a ${professionLabel} with realistic wardrobe and environment cues.`;
}

function buildFuturePrompt({ profession }) {
  const professionInstruction = buildProfessionInstruction(profession);

  return [
    'Edit the uploaded selfie into a single premium portrait of the same person.',
    'Priority order: first preserve identity and facial likeness, second apply believable age progression, third apply profession styling and background.',
    'If the person looks young, age them into a believable adult version around 10 to 20 years older.',
    'The adult result must be instantly recognizable as the same person, not a different face.',
    'Preserve eye shape, eye spacing, eyelids, eyebrows, nose bridge, nose tip, lips, smile lines, chin, jawline, cheeks, ears, hairline, skin tone and natural facial proportions.',
    'Keep the same ethnicity, same facial identity, same overall expression family, same head angle and same body proportions.',
    'Only mature the face naturally with adult features such as subtle structure definition and realistic age progression. Do not over-age the person.',
    'Do not beautify, replace, stylize or reinterpret the face. Do not change the identity to match the profession.',
    professionInstruction,
    'If there is any conflict between profession styling and facial similarity, keep the face and identity as the highest priority.',
    'Keep the output photorealistic and cinematic, with polished lighting, natural skin texture and tasteful depth of field.',
    'Do not add extra people, text, watermark, duplicated faces, collage layouts, exaggerated fantasy styling or distorted anatomy.',
  ].join(' ');
}

function buildPresentPrompt({ profession }) {
  const professionInstruction = buildProfessionInstruction(profession);

  return [
    'Edit the uploaded selfie into a single premium portrait of the same person.',
    'Priority order: first preserve identity and facial likeness, second preserve the current apparent age exactly as in the original photo, third apply profession styling, pose and background.',
    'Do not make the person older, younger, middle-aged or more mature. Keep the same apparent age range from the original photo.',
    'The result must be instantly recognizable as the same person, not a different face.',
    'Preserve eye shape, eye spacing, eyelids, eyebrows, nose bridge, nose tip, lips, smile lines, chin, jawline, cheeks, ears, hairline, skin tone and natural facial proportions.',
    'Keep the same ethnicity, same facial identity, same overall expression family, same head angle and same body proportions.',
    'Do not beautify, replace, stylize or reinterpret the face. Do not change the identity to match the profession.',
    professionInstruction,
    'Add a cinematic pose that fits the profession while keeping the face consistent and recognizable.',
    'Keep skin textures, pores, eyelashes, hair strands, fabric textures, lighting and all visible details extremely realistic.',
    'If there is any conflict between profession styling and facial similarity, keep the face and identity as the highest priority.',
    'Keep the output photorealistic and cinematic, with ultra-real skin detail, realistic textures and natural lighting.',
    'Do not add extra people, text, watermark, duplicated faces, collage layouts, exaggerated fantasy styling or distorted anatomy.',
  ].join(' ');
}

function extractResponseParts(response) {
  const parts = response?.candidates?.[0]?.content?.parts;

  if (Array.isArray(parts) && parts.length > 0) {
    return parts;
  }

  throw new HttpsError('internal', 'Gemini did not return any content.');
}

function buildDownloadUrl(bucketName, filePath, token) {
  return `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(filePath)}?alt=media&token=${token}`;
}

export const generateFuturePortrait = onCall(
  {
    region: 'us-central1',
    memory: '1GiB',
    timeoutSeconds: 540,
    cors: true,
    invoker: 'public',
    secrets: [GEMINI_API_KEY],
  },
  async (request) => {
    const { data } = request;
    const name = data?.name?.trim();
    const language = data?.language === 'en' ? 'en' : 'es';
    const profession = data?.profession;
    const generationMode = data?.generationMode === 'present' ? 'present' : 'future';
    const imageDataUrl = data?.imageDataUrl;

    if (!name || name.length < 2) {
      throw new HttpsError('invalid-argument', 'A valid name is required.');
    }

    if (!profession?.label && !profession?.labelEn && !profession?.labelEs) {
      throw new HttpsError('invalid-argument', 'A profession is required.');
    }

    if (!imageDataUrl || typeof imageDataUrl !== 'string') {
      throw new HttpsError('invalid-argument', 'A captured image is required.');
    }

    const createdAtIso = new Date().toISOString();
    const docRef = db.collection('futurePortraits').doc();
    const image = parseImageDataUrl(imageDataUrl);
    const originalPath = `future-portraits/${docRef.id}/original.${image.extension}`;
    const professionLabel = getProfessionLabel(profession);

    await docRef.set({
      name,
      language,
      profession,
      professionLabel,
      generationMode,
      model: MODEL_NAME,
      status: 'processing',
      shareUrl: null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      storage: {
        originalPath,
        generatedPath: null,
      },
    });

    try {
      await bucket.file(originalPath).save(image.buffer, {
        resumable: false,
        metadata: {
          contentType: image.mimeType,
          cacheControl: 'private, max-age=0, no-transform',
        },
      });

      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY.value() });
      const prompt =
        generationMode === 'present'
          ? buildPresentPrompt({ profession, language, name })
          : buildFuturePrompt({ profession, language, name });
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: [
          {
            role: 'user',
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: image.mimeType,
                  data: image.base64Data,
                },
              },
            ],
          },
        ],
        config: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
      });

      const parts = extractResponseParts(response);
      const imagePart = parts.find((part) => part.inlineData?.data);
      const textPart = parts.find((part) => part.text)?.text || '';

      if (!imagePart?.inlineData?.data) {
        throw new HttpsError('internal', 'Gemini did not return an image.');
      }

      const generatedMimeType = imagePart.inlineData.mimeType || 'image/png';
      const generatedBuffer = Buffer.from(imagePart.inlineData.data, 'base64');
      const generatedExtension = generatedMimeType.includes('png') ? 'png' : 'jpg';
      const generatedPath = `future-portraits/${docRef.id}/future.${generatedExtension}`;
      const downloadToken = randomUUID();

      await bucket.file(generatedPath).save(generatedBuffer, {
        resumable: false,
        metadata: {
          contentType: generatedMimeType,
          cacheControl: 'private, max-age=0, no-transform',
          metadata: {
            firebaseStorageDownloadTokens: downloadToken,
          },
        },
      });

      const generatedShareUrl = buildDownloadUrl(bucket.name, generatedPath, downloadToken);

      await docRef.update({
        status: 'completed',
        promptSummary: textPart,
        shareUrl: generatedShareUrl,
        completedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        storage: {
          originalPath,
          generatedPath,
        },
      });

      return {
        generatedImageDataUrl: `data:${generatedMimeType};base64,${imagePart.inlineData.data}`,
        record: {
          id: docRef.id,
          name,
          language,
          professionLabel,
          generationMode,
          createdAt: createdAtIso,
          shareUrl: generatedShareUrl,
          storage: {
            originalPath,
            generatedPath,
          },
          promptSummary: textPart,
        },
      };
    } catch (error) {
      logger.error('Future portrait generation failed', error);

      await docRef.update({
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        updatedAt: FieldValue.serverTimestamp(),
      });

      if (error instanceof HttpsError) {
        throw error;
      }

      throw new HttpsError(
        'internal',
        language === 'es'
          ? 'No se pudo generar el retrato con Gemini.'
          : 'Gemini could not generate the portrait.',
      );
    }
  },
);
