import multer from 'multer';

// 🔥 O Segredo da Nuvem: Usamos a memória RAM, não o Disco (HD)
const storage = multer.memoryStorage();

export const uploadAvatarMiddleware = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Limite de Segurança: 5MB
  },
  fileFilter: (req, file, cb) => {
    // Permite apenas imagens para a foto de perfil
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          'Apenas imagens (JPG, PNG, WEBP) são permitidas.',
        ),
      );
    }
  },
});
