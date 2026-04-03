export const professionCatalog = [
  {
    id: 'doctor',
    label: { es: 'Doctor', en: 'Doctor' },
    helper: {
      es: 'Bata clínica, hospital moderno y mirada profesional.',
      en: 'Clinical coat, modern hospital and confident presence.',
    },
  },
  {
    id: 'teacher',
    label: { es: 'Profesora o profesor', en: 'Teacher' },
    helper: {
      es: 'Ropa formal cercana y un aula luminosa.',
      en: 'Warm formal wear inside a bright classroom.',
    },
  },
  {
    id: 'engineer',
    label: { es: 'Ingeniera o ingeniero', en: 'Engineer' },
    helper: {
      es: 'Vestimenta técnica y un entorno de innovación.',
      en: 'Technical outfit inside an innovation-driven setting.',
    },
  },
  {
    id: 'chef',
    label: { es: 'Chef', en: 'Chef' },
    helper: {
      es: 'Chaqueta de cocina y ambiente gastronómico premium.',
      en: 'Chef jacket and an elevated culinary backdrop.',
    },
  },
  {
    id: 'firefighter',
    label: { es: 'Bombera o bombero', en: 'Firefighter' },
    helper: {
      es: 'Uniforme de rescate y presencia heroica.',
      en: 'Rescue uniform with a heroic cinematic attitude.',
    },
  },
  {
    id: 'pilot',
    label: { es: 'Pilota o piloto', en: 'Pilot' },
    helper: {
      es: 'Uniforme de aviación y cabina elegante.',
      en: 'Aviation uniform with a polished cockpit setting.',
    },
  },
  {
    id: 'scientist',
    label: { es: 'Científica o científico', en: 'Scientist' },
    helper: {
      es: 'Laboratorio contemporáneo y estética precisa.',
      en: 'Contemporary lab with precise visual cues.',
    },
  },
  {
    id: 'artist',
    label: { es: 'Artista', en: 'Artist' },
    helper: {
      es: 'Vestuario creativo y estudio con personalidad.',
      en: 'Creative styling in a personality-filled studio.',
    },
  },
  {
    id: 'architect',
    label: { es: 'Arquitecta o arquitecto', en: 'Architect' },
    helper: {
      es: 'Look sofisticado y planos en un estudio luminoso.',
      en: 'Sophisticated attire with plans in a bright studio.',
    },
  },
  {
    id: 'heavy-equipment-operator',
    label: {
      es: 'Operador de maquinaria pesada',
      en: 'Heavy equipment operator',
    },
    helper: {
      es: 'Casco, chaleco reflectante y maquinaria industrial.',
      en: 'Hard hat, safety vest and industrial machinery context.',
    },
  },
];

export const copy = {
  es: {
    languageLabel: 'Idioma',
    heroEyebrow: 'Retrato inteligente',
    heroTitle: 'Mírate de grande con la profesión que imaginas',
    heroText:
      'Escribe tu nombre, elige una profesión o escríbela libremente, activa la cámara y genera una versión realista-cinemática de tu futuro.',
    heroNote:
      'El backend guarda tu selfie original y el resultado en Firebase. La interfaz está pensada para ser tan clara que un niño pueda seguirla sin perderse.',
    featureList: [
      {
        title: 'Paso 1',
        description: 'Coloca tu nombre y escoge una profesión desde la lista o con tu propio texto.',
      },
      {
        title: 'Paso 2',
        description: 'Permite la cámara, encuadra tu rostro y captura una selfie limpia y centrada.',
      },
      {
        title: 'Paso 3',
        description: 'La IA crea tu retrato adulto con vestuario y ambiente profesional.',
      },
    ],
    stepTitles: {
      profile: 'Tu perfil',
      camera: 'Tu foto',
      result: 'Tu retrato',
    },
    labels: {
      name: 'Nombre',
      professionList: 'Elige de la lista',
      customProfession: 'O escribe tu profesión',
      professionHint: 'Si escribes una profesión, esa tendrá prioridad sobre la lista.',
      status: 'Estado',
      bilingual: 'Español / English',
      recordInfo: 'Registro en Firebase',
    },
    placeholders: {
      name: 'Ejemplo: Lucía',
      customProfession: 'Ejemplo: Diseñador de videojuegos',
    },
    camera: {
      title: 'Captura guiada',
      helper: 'Busca buena luz, mantén tu cara al centro y mira de frente.',
      emptyTitle: 'Aún no hay foto',
      emptyText:
        'Activa la cámara para ver una guía visual. Cuando te guste el encuadre, presiona el botón grande.',
      liveTitle: 'Cámara encendida',
      liveText: 'Tu rostro debe quedar dentro del marco. Sonríe si quieres.',
      capturedTitle: 'Foto lista',
      capturedText: 'Puedes usarla o tomar otra antes de generar el retrato.',
    },
    render: {
      title: 'Generación realista-cinemática',
      helper:
        'La IA conserva tu identidad y transforma edad, ropa, iluminación y entorno según la profesión elegida.',
      summary:
        'Primero se guarda tu selfie, luego se genera la imagen futura y finalmente se registra el resultado.',
    },
    buttons: {
      startCamera: 'Activar cámara',
      capture: 'Tomar foto',
      retake: 'Tomar otra',
      generate: 'Crear mi retrato futuro',
      generating: 'Creando retrato...',
    },
    status: {
      idle: 'Completa tu nombre y profesión, luego abre la cámara.',
      cameraStarting: 'Solicitando permiso para usar la cámara...',
      cameraReady: 'La cámara está lista. Toma tu foto cuando te veas bien.',
      cameraBlocked: 'No se pudo usar la cámara. Revisa permisos e inténtalo otra vez.',
      captured: 'La selfie quedó lista para procesarse.',
      processing: 'Procesando la imagen y guardando archivos en Firebase...',
      complete: 'Retrato creado y guardado correctamente.',
      error: 'Hubo un problema durante la generación.',
    },
    errors: {
      nameRequired: 'Escribe tu nombre antes de continuar.',
      professionRequired: 'Elige o escribe una profesión.',
      photoRequired: 'Toma una foto antes de generar el retrato.',
      cameraUnsupported: 'Este navegador no permite acceder a la cámara.',
      generic: 'No se pudo completar el proceso. Inténtalo de nuevo.',
    },
    result: {
      title: 'Tu resultado',
      subtitle: 'Comparación del antes y después',
      original: 'Foto original',
      generated: 'Versión futura',
      summaryTitle: 'Registro guardado',
      summaryText:
        'Los archivos quedan en Firebase Storage y el documento descriptivo queda en Firestore.',
      fields: {
        name: 'Nombre',
        profession: 'Profesión',
        savedAt: 'Fecha',
        id: 'ID',
        originalPath: 'Ruta original',
        generatedPath: 'Ruta generada',
      },
    },
    footer:
      'Este proyecto usa Firebase Hosting, Functions, Firestore y Storage. Gemini se ejecuta solo en backend para no exponer la API key.',
  },
  en: {
    languageLabel: 'Language',
    heroEyebrow: 'Smart portrait',
    heroTitle: 'See your grown-up self in the profession you imagine',
    heroText:
      'Enter your name, choose a profession or write your own, turn on the camera and generate a realistic cinematic version of your future.',
    heroNote:
      'The backend stores both the original selfie and the generated result in Firebase. The flow is intentionally simple so even a child can follow it.',
    featureList: [
      {
        title: 'Step 1',
        description: 'Type your name and pick a profession from the list or enter your own custom role.',
      },
      {
        title: 'Step 2',
        description: 'Allow camera access, center your face and capture a clean selfie.',
      },
      {
        title: 'Step 3',
        description: 'AI creates an adult portrait with profession-specific wardrobe and setting.',
      },
    ],
    stepTitles: {
      profile: 'Your profile',
      camera: 'Your photo',
      result: 'Your portrait',
    },
    labels: {
      name: 'Name',
      professionList: 'Choose from the list',
      customProfession: 'Or write your profession',
      professionHint: 'If you type a profession, it will override the selected preset.',
      status: 'Status',
      bilingual: 'Español / English',
      recordInfo: 'Firebase record',
    },
    placeholders: {
      name: 'Example: Sofia',
      customProfession: 'Example: Video game designer',
    },
    camera: {
      title: 'Guided capture',
      helper: 'Look for good lighting, keep your face centered and look forward.',
      emptyTitle: 'No photo yet',
      emptyText:
        'Turn on the camera to see the visual guide. When the framing looks right, press the large capture button.',
      liveTitle: 'Camera is on',
      liveText: 'Keep your face inside the frame. A smile is welcome.',
      capturedTitle: 'Photo ready',
      capturedText: 'You can keep it or retake it before generating the portrait.',
    },
    render: {
      title: 'Realistic cinematic generation',
      helper:
        'AI keeps your identity while transforming age, clothing, lighting and environment to match the selected profession.',
      summary:
        'Your selfie is stored first, then the future image is generated and finally the completed record is saved.',
    },
    buttons: {
      startCamera: 'Turn on camera',
      capture: 'Take photo',
      retake: 'Retake',
      generate: 'Create my future portrait',
      generating: 'Creating portrait...',
    },
    status: {
      idle: 'Complete your name and profession, then open the camera.',
      cameraStarting: 'Requesting permission to use the camera...',
      cameraReady: 'Camera is ready. Capture your photo when it looks good.',
      cameraBlocked: 'The camera could not be used. Review permissions and try again.',
      captured: 'The selfie is ready to be processed.',
      processing: 'Processing the image and saving files in Firebase...',
      complete: 'Portrait created and stored successfully.',
      error: 'There was a problem during generation.',
    },
    errors: {
      nameRequired: 'Enter your name before continuing.',
      professionRequired: 'Choose or type a profession.',
      photoRequired: 'Take a photo before generating the portrait.',
      cameraUnsupported: 'This browser cannot access the camera.',
      generic: 'The process could not be completed. Please try again.',
    },
    result: {
      title: 'Your result',
      subtitle: 'Before and after comparison',
      original: 'Original photo',
      generated: 'Future version',
      summaryTitle: 'Saved record',
      summaryText:
        'Files are stored in Firebase Storage and the descriptive document is stored in Firestore.',
      fields: {
        name: 'Name',
        profession: 'Profession',
        savedAt: 'Date',
        id: 'ID',
        originalPath: 'Original path',
        generatedPath: 'Generated path',
      },
    },
    footer:
      'This project uses Firebase Hosting, Functions, Firestore and Storage. Gemini runs only in the backend so the API key never reaches the browser.',
  },
};
