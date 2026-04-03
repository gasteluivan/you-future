import { useEffect, useMemo, useRef, useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { gsap } from 'gsap';
import { analyticsPromise, functions } from './lib/firebase';
import { professionCatalog } from './content';

const copy = {
  es: {
    brand: 'Your Future Studio',
    name: 'Nombre',
    namePlaceholder: 'Tu nombre',
    profession: 'Profesion',
    professionWrite: 'Escribe tu profesion',
    professionWritePlaceholder: 'Ejemplo: Disenador de videojuegos',
    mode: 'Modo',
    currentMode: 'Profesional actual',
    futureMode: 'Version futura',
    continue: 'Continuar',
    back: 'Volver',
    useCamera: 'Usar camara',
    uploadImage: 'Subir imagen',
    uploadAnother: 'Subir otra imagen',
    takePhoto: 'Tomar foto',
    retake: 'Tomar otra',
    seeResult: 'Ver resultado',
    download: 'Descargar',
    retry: 'Generar de nuevo',
    facebook: 'Facebook',
    instagram: 'Instagram',
    x: 'X / Twitter',
    original: 'Original',
    resultCurrent: 'Actual profesional',
    resultFuture: 'Version futura',
    profileCard: 'Perfil',
    photoCard: 'Foto',
    resultCard: 'Resultado',
    loading: 'Generando...',
    analyzing: 'Analizando rostro...',
    faceOk: 'Rostro listo para generar.',
    faceNotFound:
      'No detecte claramente un rostro. Usa una foto frontal, cercana y con buena luz.',
    faceMulti:
      'Detecte varias caras. Usare la principal, pero conviene una foto con una sola persona.',
    faceFar:
      'Tu rostro se ve algo lejos. Si puedes, usa una foto mas cercana.',
    faceOffCenter:
      'Tu rostro esta algo fuera del centro. Recentrarlo puede mejorar la similitud.',
    faceUnsupported:
      'Tu navegador no permite analisis facial automatico. La foto se procesara igual.',
    shareNative: 'Se abrio el panel nativo para compartir.',
    shareInstagram:
      'Instagram no permite publicacion directa generica desde este navegador. Descargue la imagen para que la subas desde tu galeria.',
    shareFacebook:
      'Se abrio el cuadro de compartir de Facebook. Si quieres publicar la imagen exacta, usa tambien Descargar.',
    shareX:
      'Se abrio la ventana de X. Si quieres publicar la imagen exacta, usa tambien Descargar.',
    errors: {
      nameRequired: 'Escribe tu nombre.',
      professionRequired: 'Elige una profesion.',
      photoRequired: 'Toma o sube una foto.',
      cameraUnsupported: 'Este navegador no puede acceder a la camara.',
      invalidImage: 'El archivo debe ser una imagen valida.',
      imageReadFailed: 'No se pudo leer la imagen seleccionada.',
      generic: 'No se pudo completar el proceso. Intentalo otra vez.',
    },
  },
  en: {
    brand: 'Your Future Studio',
    name: 'Name',
    namePlaceholder: 'Your name',
    profession: 'Profession',
    professionWrite: 'Write your profession',
    professionWritePlaceholder: 'Example: Video game designer',
    mode: 'Mode',
    currentMode: 'Current professional',
    futureMode: 'Future version',
    continue: 'Continue',
    back: 'Back',
    useCamera: 'Use camera',
    uploadImage: 'Upload image',
    uploadAnother: 'Upload another image',
    takePhoto: 'Take photo',
    retake: 'Retake',
    seeResult: 'See result',
    download: 'Download',
    retry: 'Generate again',
    facebook: 'Facebook',
    instagram: 'Instagram',
    x: 'X / Twitter',
    original: 'Original',
    resultCurrent: 'Current professional',
    resultFuture: 'Future version',
    profileCard: 'Profile',
    photoCard: 'Photo',
    resultCard: 'Result',
    loading: 'Generating...',
    analyzing: 'Analyzing face...',
    faceOk: 'Face ready for generation.',
    faceNotFound:
      'I could not clearly detect a face. Use a close, front-facing, well-lit photo.',
    faceMulti:
      'I detected multiple faces. I will use the main one, but a single-person photo works better.',
    faceFar: 'Your face looks a bit far away. If possible, use a closer photo.',
    faceOffCenter:
      'Your face is a bit off-center. Centering it can improve likeness.',
    faceUnsupported:
      'Your browser does not support automatic face analysis. The photo will still be processed.',
    shareNative: 'The native share panel was opened.',
    shareInstagram:
      'Instagram does not support generic direct posting from this browser. I downloaded the image so you can upload it from your gallery.',
    shareFacebook:
      'The Facebook share dialog was opened. If you want to publish the exact image, also use Download.',
    shareX:
      'The X composer was opened. If you want to publish the exact image, also use Download.',
    errors: {
      nameRequired: 'Enter your name.',
      professionRequired: 'Choose a profession.',
      photoRequired: 'Take or upload a photo.',
      cameraUnsupported: 'This browser cannot access the camera.',
      invalidImage: 'The selected file must be a valid image.',
      imageReadFailed: 'The selected image could not be read.',
      generic: 'The process could not be completed. Please try again.',
    },
  },
};

function dataUrlToFile(dataUrl, filename) {
  const [header, body] = dataUrl.split(',');
  const mimeType = header.match(/data:(.*?);base64/)?.[1] || 'image/png';
  const binary = atob(body);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return new File([bytes], filename, { type: mimeType });
}

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function getFriendlyError(error, language) {
  const generic =
    language === 'es'
      ? 'No se pudo completar el proceso. Intentalo otra vez.'
      : 'The process could not be completed. Please try again.';

  if (!error) {
    return generic;
  }

  return error.message || generic;
}

function getCameraErrorMessage(language, originalMessage) {
  const base =
    language === 'es'
      ? 'No se pudo usar la camara. Revisa permisos e intentalo otra vez.'
      : 'The camera could not be used. Check permissions and try again.';

  return originalMessage ? `${base} (${originalMessage})` : base;
}

function imageFileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('invalid-image'));
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const image = new Image();

      image.onload = () => {
        const maxEdge = 1400;
        const scale = Math.min(1, maxEdge / Math.max(image.width, image.height));
        const width = Math.round(image.width * scale);
        const height = Math.round(image.height * scale);
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        if (!context) {
          reject(new Error('image-read-failed'));
          return;
        }

        canvas.width = width;
        canvas.height = height;
        context.drawImage(image, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.92));
      };

      image.onerror = () => reject(new Error('image-read-failed'));
      image.src = String(reader.result);
    };

    reader.onerror = () => reject(new Error('image-read-failed'));
    reader.readAsDataURL(file);
  });
}

function loadImageElement(dataUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('image-load-failed'));
    image.src = dataUrl;
  });
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getFaceCropBox(imageWidth, imageHeight, faceBox) {
  const targetAspect = 4 / 5;
  const cropHeight = Math.max(faceBox.height * 3.2, faceBox.width * 2.8);
  const cropWidth = Math.max(cropHeight * targetAspect, faceBox.width * 2.5);
  let x = faceBox.x + faceBox.width / 2 - cropWidth / 2;
  let y = faceBox.y + faceBox.height / 2 - cropHeight * 0.4;
  let width = cropWidth;
  let height = cropHeight;

  if (width > imageWidth) {
    width = imageWidth;
    height = width / targetAspect;
  }

  if (height > imageHeight) {
    height = imageHeight;
    width = height * targetAspect;
  }

  x = clamp(x, 0, imageWidth - width);
  y = clamp(y, 0, imageHeight - height);

  return { x, y, width, height };
}

function cropImageToPortrait(image, cropBox) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) {
    return image.src;
  }

  canvas.width = 1024;
  canvas.height = 1280;
  context.drawImage(
    image,
    cropBox.x,
    cropBox.y,
    cropBox.width,
    cropBox.height,
    0,
    0,
    canvas.width,
    canvas.height,
  );

  return canvas.toDataURL('image/jpeg', 0.92);
}

async function preparePhotoForPortrait(dataUrl, language) {
  const t = copy[language];
  const image = await loadImageElement(dataUrl);

  if (typeof window === 'undefined' || typeof window.FaceDetector !== 'function') {
    return { dataUrl, note: t.faceUnsupported, tone: 'info' };
  }

  try {
    const detector = new window.FaceDetector({ fastMode: true, maxDetectedFaces: 3 });
    const faces = await detector.detect(image);

    if (!faces.length) {
      return { dataUrl, note: t.faceNotFound, tone: 'warning' };
    }

    const sortedFaces = [...faces].sort(
      (firstFace, secondFace) =>
        secondFace.boundingBox.width * secondFace.boundingBox.height -
        firstFace.boundingBox.width * firstFace.boundingBox.height,
    );
    const mainFace = sortedFaces[0].boundingBox;
    const cropBox = getFaceCropBox(image.width, image.height, mainFace);
    const preparedDataUrl = cropImageToPortrait(image, cropBox);
    const notes = [];
    let tone = 'success';
    const faceAreaRatio = (mainFace.width * mainFace.height) / (image.width * image.height);
    const faceCenterX = mainFace.x + mainFace.width / 2;
    const faceCenterY = mainFace.y + mainFace.height / 2;
    const offsetX = Math.abs(faceCenterX - image.width / 2) / (image.width / 2);
    const offsetY = Math.abs(faceCenterY - image.height / 2) / (image.height / 2);

    if (sortedFaces.length > 1) {
      notes.push(t.faceMulti);
      tone = 'warning';
    }

    if (faceAreaRatio < 0.08) {
      notes.push(t.faceFar);
      tone = 'warning';
    }

    if (offsetX > 0.4 || offsetY > 0.38) {
      notes.push(t.faceOffCenter);
      tone = 'warning';
    }

    if (!notes.length) {
      notes.push(t.faceOk);
    }

    return {
      dataUrl: preparedDataUrl,
      note: notes.join(' '),
      tone,
    };
  } catch {
    return { dataUrl, note: t.faceUnsupported, tone: 'info' };
  }
}

function App() {
  const [language, setLanguage] = useState('es');
  const [currentStep, setCurrentStep] = useState(1);
  const [name, setName] = useState('');
  const [professionId, setProfessionId] = useState('doctor');
  const [customProfession, setCustomProfession] = useState('');
  const [generationMode, setGenerationMode] = useState('future');
  const [capturedPhoto, setCapturedPhoto] = useState('');
  const [generatedPhoto, setGeneratedPhoto] = useState('');
  const [record, setRecord] = useState(null);
  const [error, setError] = useState('');
  const [shareFeedback, setShareFeedback] = useState('');
  const [photoFeedback, setPhotoFeedback] = useState('');
  const [photoFeedbackTone, setPhotoFeedbackTone] = useState('info');
  const [cameraState, setCameraState] = useState('idle');
  const [isPreparingPhoto, setIsPreparingPhoto] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const rootRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  const t = copy[language];
  const professionOptions = useMemo(
    () =>
      professionCatalog.map((profession) => ({
        id: profession.id,
        label: profession.label[language],
        labelEs: profession.label.es,
        labelEn: profession.label.en,
      })),
    [language],
  );
  const selectedProfession = useMemo(
    () => professionOptions.find((option) => option.id === professionId) || professionOptions[0],
    [professionId, professionOptions],
  );
  const normalizedCustomProfession = customProfession.trim();
  const profession = useMemo(() => {
    if (normalizedCustomProfession) {
      return {
        kind: 'custom',
        id: slugify(normalizedCustomProfession) || 'custom-profession',
        label: normalizedCustomProfession,
        labelEs: normalizedCustomProfession,
        labelEn: normalizedCustomProfession,
      };
    }

    if (!selectedProfession) {
      return null;
    }

    return {
      kind: 'preset',
      id: selectedProfession.id,
      label: selectedProfession.label,
      labelEs: selectedProfession.labelEs,
      labelEn: selectedProfession.labelEn,
    };
  }, [normalizedCustomProfession, selectedProfession]);

  useEffect(() => {
    analyticsPromise.catch(() => null);
  }, []);

  useEffect(() => {
    const context = gsap.context(() => {
      gsap.fromTo(
        '.screen-card',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' },
      );
    }, rootRef);

    return () => context.revert();
  }, [currentStep]);

  useEffect(
    () => () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    },
    [],
  );

  function resetResultState() {
    setGeneratedPhoto('');
    setRecord(null);
    setShareFeedback('');
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  async function acceptPreparedPhoto(dataUrl) {
    setIsPreparingPhoto(true);
    setPhotoFeedback('');
    setError('');

    try {
      const preparedPhoto = await preparePhotoForPortrait(dataUrl, language);

      setCapturedPhoto(preparedPhoto.dataUrl);
      setPhotoFeedback(preparedPhoto.note);
      setPhotoFeedbackTone(preparedPhoto.tone);
      setCameraState('captured');
      resetResultState();
      stopCamera();
    } finally {
      setIsPreparingPhoto(false);
    }
  }

  async function startCamera() {
    setError('');
    setPhotoFeedback('');
    resetResultState();

    if (!navigator.mediaDevices?.getUserMedia) {
      setError(t.errors.cameraUnsupported);
      return;
    }

    stopCamera();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 1280 },
        },
        audio: false,
      });

      streamRef.current = stream;
      setCameraState('live');

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (cameraError) {
      setError(getCameraErrorMessage(language, cameraError?.message));
    }
  }

  async function capturePhoto() {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    const sourceWidth = video.videoWidth || 1080;
    const sourceHeight = video.videoHeight || 1080;
    const maxEdge = 1400;
    const scale = Math.min(1, maxEdge / Math.max(sourceWidth, sourceHeight));
    const width = Math.round(sourceWidth * scale);
    const height = Math.round(sourceHeight * scale);
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) {
      setError(t.errors.generic);
      return;
    }

    canvas.width = width;
    canvas.height = height;
    context.translate(width, 0);
    context.scale(-1, 1);
    context.drawImage(video, 0, 0, width, height);

    await acceptPreparedPhoto(canvas.toDataURL('image/jpeg', 0.92));
  }

  async function handleFileSelect(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      stopCamera();
      const imageDataUrl = await imageFileToDataUrl(file);
      await acceptPreparedPhoto(imageDataUrl);
    } catch (fileError) {
      setError(
        fileError.message === 'invalid-image' ? t.errors.invalidImage : t.errors.imageReadFailed,
      );
    } finally {
      event.target.value = '';
    }
  }

  function goToPhoto() {
    if (!name.trim()) {
      setError(t.errors.nameRequired);
      return;
    }

    if (!profession) {
      setError(t.errors.professionRequired);
      return;
    }

    setError('');
    setCurrentStep(2);
  }

  async function handleGenerate() {
    if (!capturedPhoto) {
      setError(t.errors.photoRequired);
      setCurrentStep(2);
      return;
    }

    setIsGenerating(true);
    setError('');
    setShareFeedback('');
    resetResultState();

    try {
      const generatePortrait = httpsCallable(functions, 'generateFuturePortrait');
      const response = await generatePortrait({
        name: name.trim(),
        language,
        generationMode,
        profession,
        imageDataUrl: capturedPhoto,
      });

      setGeneratedPhoto(response.data.generatedImageDataUrl);
      setRecord(response.data.record);
    } catch (requestError) {
      setError(getFriendlyError(requestError, language));
    } finally {
      setIsGenerating(false);
    }
  }

  function goToResult() {
    if (!capturedPhoto) {
      setError(t.errors.photoRequired);
      return;
    }

    setError('');
    setCurrentStep(3);

    if (!generatedPhoto && !isGenerating) {
      handleGenerate();
    }
  }

  function downloadGeneratedImage() {
    if (!generatedPhoto) {
      return;
    }

    const link = document.createElement('a');
    const fileBase = slugify(name || 'portrait') || 'portrait';

    link.href = generatedPhoto;
    link.download = `${fileBase}-${generationMode}.png`;
    link.click();
  }

  async function shareToNetwork(network) {
    if (!generatedPhoto) {
      return;
    }

    try {
      const resultLabel =
        generationMode === 'future' ? t.resultFuture : t.resultCurrent;
      const shareText =
        language === 'es'
          ? `Mira mi retrato ${resultLabel.toLowerCase()} como ${profession.label}. Soy ${name}.`
          : `Look at my ${resultLabel.toLowerCase()} portrait as ${profession.label}. I am ${name}.`;
      const shareUrl = record?.shareUrl || window.location.origin;
      const file = dataUrlToFile(
        generatedPhoto,
        `${slugify(name || 'portrait') || 'portrait'}.png`,
      );

      setShareFeedback('');

      const canNativeShareFile =
        typeof navigator !== 'undefined' &&
        typeof navigator.share === 'function' &&
        typeof navigator.canShare === 'function' &&
        navigator.canShare({ files: [file] });

      if (network === 'instagram') {
        if (canNativeShareFile) {
          await navigator.share({ title: t.brand, text: shareText, files: [file] });
          setShareFeedback(t.shareNative);
          return;
        }

        downloadGeneratedImage();
        setShareFeedback(t.shareInstagram);
        return;
      }

      if (canNativeShareFile && window.innerWidth <= 900) {
        await navigator.share({ title: t.brand, text: shareText, files: [file] });
        setShareFeedback(t.shareNative);
        return;
      }

      const urls = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
        x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      };

      if (urls[network]) {
        window.open(urls[network], '_blank', 'noopener,noreferrer,width=760,height=720');
        setShareFeedback(network === 'facebook' ? t.shareFacebook : t.shareX);
      }
    } catch (shareError) {
      setShareFeedback(getFriendlyError(shareError, language));
    }
  }

  return (
    <div className="app-shell" ref={rootRef}>
      <div className="orb orb-left" />
      <div className="orb orb-right" />

      <header className="topbar">
        <span className="brand">{t.brand}</span>
        <div className="lang-toggle" aria-label="language">
          <button
            type="button"
            className={language === 'es' ? 'is-active' : ''}
            onClick={() => setLanguage('es')}
          >
            ES
          </button>
          <button
            type="button"
            className={language === 'en' ? 'is-active' : ''}
            onClick={() => setLanguage('en')}
          >
            EN
          </button>
        </div>
      </header>

      <main className="screen-wrap">
        {currentStep === 1 && (
          <section className="screen-card">
            <span className="card-tag">{t.profileCard}</span>
            <div className="field-grid">
              <label className="field">
                <span>{t.name}</span>
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder={t.namePlaceholder}
                  maxLength={70}
                />
              </label>

              <label className="field">
                <span>{t.profession}</span>
                <select
                  value={professionId}
                  onChange={(event) => setProfessionId(event.target.value)}
                >
                  {professionOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>{t.professionWrite}</span>
                <input
                  type="text"
                  value={customProfession}
                  onChange={(event) => setCustomProfession(event.target.value)}
                  placeholder={t.professionWritePlaceholder}
                  maxLength={90}
                />
              </label>

              <div className="field">
                <span>{t.mode}</span>
                <div className="mode-switch">
                  <button
                    type="button"
                    className={generationMode === 'present' ? 'is-active' : ''}
                    onClick={() => setGenerationMode('present')}
                  >
                    {t.currentMode}
                  </button>
                  <button
                    type="button"
                    className={generationMode === 'future' ? 'is-active' : ''}
                    onClick={() => setGenerationMode('future')}
                  >
                    {t.futureMode}
                  </button>
                </div>
              </div>
            </div>

            {error && <div className="message error">{error}</div>}

            <div className="actions">
              <button type="button" className="primary-btn" onClick={goToPhoto}>
                {t.continue}
              </button>
            </div>
          </section>
        )}

        {currentStep === 2 && (
          <section className="screen-card">
            <span className="card-tag">{t.photoCard}</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden-input"
              onChange={handleFileSelect}
            />

            <div className="capture-grid">
              <button
                type="button"
                className="capture-tile"
                onClick={startCamera}
                disabled={isPreparingPhoto}
              >
                {t.useCamera}
              </button>
              <button
                type="button"
                className="capture-tile"
                onClick={openFilePicker}
                disabled={isPreparingPhoto}
              >
                {t.uploadImage}
              </button>
            </div>

            <div className="camera-box">
              {!capturedPhoto && (
                <video
                  ref={videoRef}
                  className={cameraState === 'live' ? 'camera-live' : 'camera-live is-hidden'}
                  playsInline
                  muted
                />
              )}

              {capturedPhoto ? (
                <img src={capturedPhoto} alt="captured" className="camera-photo" />
              ) : (
                <div className={`camera-placeholder ${cameraState === 'live' ? 'is-live' : ''}`}>
                  <div className="camera-guide" />
                </div>
              )}
            </div>

            <div className="actions">
              <button type="button" className="ghost-btn" onClick={() => {
                stopCamera();
                setCurrentStep(1);
              }} disabled={isPreparingPhoto}>
                {t.back}
              </button>

              {!capturedPhoto && (
                <>
                  <button type="button" className="secondary-btn" onClick={startCamera} disabled={isPreparingPhoto}>
                    {t.useCamera}
                  </button>
                  <button type="button" className="secondary-btn" onClick={openFilePicker} disabled={isPreparingPhoto}>
                    {t.uploadImage}
                  </button>
                </>
              )}

              {cameraState === 'live' && (
                <button type="button" className="primary-btn" onClick={capturePhoto} disabled={isPreparingPhoto}>
                  {t.takePhoto}
                </button>
              )}

              {capturedPhoto && (
                <>
                  <button type="button" className="secondary-btn" onClick={startCamera} disabled={isPreparingPhoto}>
                    {t.retake}
                  </button>
                  <button type="button" className="secondary-btn" onClick={openFilePicker} disabled={isPreparingPhoto}>
                    {t.uploadAnother}
                  </button>
                  <button type="button" className="primary-btn" onClick={goToResult} disabled={isPreparingPhoto}>
                    {t.seeResult}
                  </button>
                </>
              )}
            </div>

            {isPreparingPhoto && <div className="message info">{t.analyzing}</div>}
            {photoFeedback && !isPreparingPhoto && (
              <div className={`message ${photoFeedbackTone}`}>{photoFeedback}</div>
            )}
            {error && <div className="message error">{error}</div>}
          </section>
        )}

        {currentStep === 3 && (
          <section className="screen-card">
            <span className="card-tag">{t.resultCard}</span>

            {isGenerating ? (
              <div className="loading-box">
                <div className="loader" />
                <strong>{t.loading}</strong>
              </div>
            ) : (
              <>
                <div className="result-grid">
                  <article className="result-card">
                    <span>{t.original}</span>
                    {capturedPhoto ? <img src={capturedPhoto} alt={t.original} /> : <div className="result-fallback" />}
                  </article>

                  <article className="result-card highlight">
                    <span>{generationMode === 'future' ? t.resultFuture : t.resultCurrent}</span>
                    {generatedPhoto ? (
                      <img src={generatedPhoto} alt="result" />
                    ) : (
                      <div className="result-fallback">
                        <strong>{t.loading}</strong>
                      </div>
                    )}
                  </article>
                </div>

                <div className="actions result-actions">
                  <button type="button" className="ghost-btn" onClick={() => setCurrentStep(2)}>
                    {t.back}
                  </button>
                  <button type="button" className="secondary-btn" onClick={handleGenerate} disabled={!capturedPhoto}>
                    {t.retry}
                  </button>
                  <button type="button" className="primary-btn" onClick={downloadGeneratedImage} disabled={!generatedPhoto}>
                    {t.download}
                  </button>
                  <button type="button" className="social-btn" onClick={() => shareToNetwork('facebook')} disabled={!generatedPhoto}>
                    {t.facebook}
                  </button>
                  <button type="button" className="social-btn" onClick={() => shareToNetwork('instagram')} disabled={!generatedPhoto}>
                    {t.instagram}
                  </button>
                  <button type="button" className="social-btn" onClick={() => shareToNetwork('x')} disabled={!generatedPhoto}>
                    {t.x}
                  </button>
                </div>

                {shareFeedback && <div className="message info">{shareFeedback}</div>}
                {error && <div className="message error">{error}</div>}
              </>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
