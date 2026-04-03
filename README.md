# Your Future Studio

Aplicación web bilingüe para:

- Capturar una selfie desde la cámara.
- Elegir una profesión desde una lista o escribirla manualmente.
- Generar una versión adulta del usuario con vestuario y contexto profesional.
- Guardar la imagen original y la generada en Firebase Storage.
- Registrar nombre, profesión, estado y rutas del proceso en Firestore.

## Stack

- React + Vite
- GSAP
- Firebase Hosting
- Firebase Functions
- Firestore
- Firebase Storage
- Gemini `gemini-2.5-flash-image`

## Flujo técnico

1. El frontend captura la selfie y la envía a una Cloud Function callable.
2. La Function guarda la imagen original en Storage.
3. La Function llama a Gemini para generar el retrato adulto-profesional.
4. La Function guarda el resultado en Storage.
5. La Function registra el documento en Firestore y devuelve la imagen generada al frontend.

## Variables y secretos

La clave de Gemini no debe ir en el cliente. Se configura como secret de Firebase:

```powershell
npx firebase functions:secrets:set GEMINI_API_KEY
```

## Instalación

```powershell
npm install
npm --prefix functions install
```

## Desarrollo

```powershell
npm run dev
```

## Build

```powershell
npm run build
```

## Despliegue

1. Inicia sesión en Firebase CLI cuando te lo pida la consola.
2. Configura el secret de Gemini.
3. Despliega:

```powershell
npx firebase deploy
```
