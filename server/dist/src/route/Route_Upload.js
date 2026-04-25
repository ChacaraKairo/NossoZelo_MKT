"use strict";
// server/src/src/route/Route_Upload.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const Controller_Upload_1 = require("../controller/Controller_Upload");
const UploadRouter = (0, express_1.Router)();
// A configuração que estava no seu middleware agora vive aqui,
// mas otimizada para o nosso novo fluxo.
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB para aguentar todos os docs juntos
    fileFilter: (req, file, cb) => {
        const allowed = [
            'image/jpeg',
            'image/png',
            'image/webp',
            'application/pdf',
        ];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Formato não suportado. Use JPG, PNG, WebP ou PDF.'));
        }
    },
});
// Mapeamento dos campos que o Multer deve "caçar" no FormData
const camposCadastro = [
    { name: 'foto', maxCount: 1 },
    { name: 'identidade', maxCount: 1 },
    { name: 'certificado', maxCount: 1 },
    { name: 'antecedentes', maxCount: 1 },
];
// Rota integrada
UploadRouter.post('/completar-cadastro', upload.fields(camposCadastro), Controller_Upload_1.UploadController.fazerUpload);
exports.default = UploadRouter;
