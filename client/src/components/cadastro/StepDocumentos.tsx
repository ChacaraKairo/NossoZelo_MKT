// src/components/cadastro/StepDocumentos.tsx
import React from 'react';
import { useCadastroPrestadorStore } from '@/store/useCadastroPrestadorStore';
import { FaUpload, FaCheckCircle } from 'react-icons/fa';
import Style from '@/styles/Wizard.module.css';

const StepDocumentos = () => {
  const { documentos, updateDocumentos, erros } =
    useCadastroPrestadorStore();

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    tipoDoc: keyof typeof documentos,
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      if (file.size > 5 * 1024 * 1024) {
        alert('O arquivo deve ter no máximo 5MB.');
        return;
      }

      updateDocumentos({ [tipoDoc]: file });
    }
  };

  const UploadButton = ({
    label,
    descricao,
    tipoDoc,
    accept,
  }: {
    label: string;
    descricao: string;
    tipoDoc: keyof typeof documentos;
    accept: string;
  }) => {
    const file = documentos[tipoDoc];

    return (
      <div className={Style.uploadBox}>
        <div className={Style.uploadInfo}>
          <h4>{label}</h4>
          <p>{descricao}</p>
          {erros[tipoDoc] && (
            <span className={Style.errorText}>
              {erros[tipoDoc]}
            </span>
          )}
        </div>

        <label
          className={`${Style.uploadLabel} ${
            file ? Style.uploadSuccess : ''
          }`}
        >
          <input
            type="file"
            accept={accept}
            onChange={(e) => handleFileChange(e, tipoDoc)}
            style={{ display: 'none' }}
          />
          {file ? (
            <>
              <FaCheckCircle />
              {/* 🔥 Ajuste Sênior: Limita o nome do arquivo para não quebrar o layout no Mobile */}
              <span style={{ marginLeft: '5px' }}>
                {file.name.length > 15
                  ? `${file.name.substring(0, 12)}...`
                  : file.name}
              </span>
            </>
          ) : (
            <>
              <FaUpload /> Anexar
            </>
          )}
        </label>
      </div>
    );
  };

  return (
    <div className={Style.stepForm}>
      <h3>Upload de Documentos</h3>
      <p>
        Envie os documentos obrigatórios para validação do
        seu perfil.
      </p>

      <UploadButton
        label="Foto de Perfil"
        descricao="JPG/PNG. Rosto claro, fundo neutro."
        tipoDoc="foto"
        accept="image/png, image/jpeg"
      />

      <UploadButton
        label="Doc. Identidade"
        descricao="PDF/JPG. CNH ou RG (Frente e Verso)."
        tipoDoc="identidade"
        accept="image/jpeg, image/png, application/pdf"
      />

      <UploadButton
        label="Certificado de Curso"
        descricao="PDF. Obrigatório para Cuidadores e Técnicos."
        tipoDoc="certificado"
        accept="application/pdf"
      />

      <UploadButton
        label="Antecedentes Criminais"
        descricao="PDF. Documento emitido há menos de 90 dias."
        tipoDoc="antecedentes"
        accept="application/pdf"
      />
    </div>
  );
};

export default StepDocumentos;
