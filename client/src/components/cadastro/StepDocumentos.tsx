// src/components/cadastro/StepDocumentos.tsx
import React from 'react';
import { useCadastroPrestadorStore } from '@/store/useCadastroPrestadorStore';
import { FaUpload, FaCheckCircle } from 'react-icons/fa';
import Style from '@/styles/Wizard.module.css';

const StepDocumentos = () => {
  const { documentos, profissional, updateDocumentos, erros } =
    useCadastroPrestadorStore();
  const categorias =
    profissional.categorias.length > 0
      ? profissional.categorias
      : profissional.categoria
        ? [profissional.categoria]
        : [];
  const incluiMotorista = categorias.includes('motorista_assistencial');
  const exigeIdentidade = categorias.some(
    (categoria) => categoria !== 'motorista_assistencial',
  );
  const exigeCertificado =
    categorias.includes('cuidador') || categorias.includes('enfermeiro');

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    tipoDoc: keyof typeof documentos,
    tamanhoMaxMb: number,
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      if (file.size > tamanhoMaxMb * 1024 * 1024) {
        alert(`O arquivo deve ter no máximo ${tamanhoMaxMb}MB.`);
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
    tamanhoMaxMb,
  }: {
    label: string;
    descricao: string;
    tipoDoc: keyof typeof documentos;
    accept: string;
    tamanhoMaxMb: number;
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
            onChange={(e) =>
              handleFileChange(e, tipoDoc, tamanhoMaxMb)
            }
            className={Style.hiddenFileInput}
          />
          {file ? (
            <>
              <FaCheckCircle />
              {/* 🔥 Ajuste Sênior: Limita o nome do arquivo para não quebrar o layout no Mobile */}
              <span className={Style.fileName}>
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
        tamanhoMaxMb={5}
      />

      {incluiMotorista && (
        <UploadButton
          label="CNH"
          descricao="PDF/JPG/PNG. Carteira Nacional de Habilitação válida."
          tipoDoc="cnh"
          accept="image/jpeg, image/png, application/pdf"
          tamanhoMaxMb={10}
        />
      )}

      {exigeIdentidade && (
        <UploadButton
          label="Documento de identidade"
          descricao="PDF/JPG/PNG. RG ou documento oficial com foto."
          tipoDoc="identidade"
          accept="image/jpeg, image/png, application/pdf"
          tamanhoMaxMb={10}
        />
      )}

      {exigeCertificado && (
        <UploadButton
          label="Certificado de curso"
          descricao="PDF. Obrigatório para cuidadores e enfermeiros."
          tipoDoc="certificado"
          accept="application/pdf"
          tamanhoMaxMb={10}
        />
      )}

      <UploadButton
        label="Antecedentes Criminais"
        descricao="PDF. Documento emitido há menos de 90 dias."
        tipoDoc="antecedentes"
        accept="application/pdf"
        tamanhoMaxMb={10}
      />
    </div>
  );
};

export default StepDocumentos;
