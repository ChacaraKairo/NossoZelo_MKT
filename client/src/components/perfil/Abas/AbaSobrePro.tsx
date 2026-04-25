// client/src/components/perfil/Abas/AbaSobrePro.tsx

import React from 'react';
import {
  FaUser,
  FaIdCard,
  FaMapMarkerAlt,
  FaPen,
  FaCheck,
  FaTimes,
  FaBriefcase,
} from 'react-icons/fa';
import { usePerfilEditor } from '../script/usePerfilEditor';
import styles from '../styles/AbaSobrePro.module.css';
import { PerfilCompleto } from '../types/types';

interface AbaSobreProProps {
  perfil: PerfilCompleto;
  setPerfil: React.Dispatch<
    React.SetStateAction<PerfilCompleto | null>
  >;
}

const AbaSobrePro: React.FC<AbaSobreProProps> = ({
  perfil,
  setPerfil,
}) => {
  const {
    editandoId,
    tempData,
    iniciarEdicao,
    cancelarEdicao,
    salvarEdicao,
    handleInputChange,
  } = usePerfilEditor(perfil, setPerfil);

  if (!perfil) return null;

  const isPrestador = perfil.tipo !== 'cliente';

  return (
    <div className={styles.abaContainer}>
      {/* SEÇÃO: APRESENTAÇÃO / BIO */}
      <section>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>
            <FaUser className="text-blue-500" /> Biografia
          </h3>
          {editandoId !== 'bio' && (
            <FaPen
              className="text-slate-300 cursor-pointer hover:text-blue-500"
              onClick={() => iniciarEdicao('bio')}
            />
          )}
        </div>

        {editandoId === 'bio' ? (
          <div className="space-y-2">
            <textarea
              className={`${styles.inputEdit} min-h-[100px]`}
              value={tempData.bio || ''}
              onChange={(e) =>
                handleInputChange('bio', e.target.value)
              }
            />
            <div className={styles.saveActions}>
              <button
                className={styles.btnSave}
                onClick={() => salvarEdicao('bio')}
              >
                Salvar
              </button>
              <button
                className="text-xs text-slate-400"
                onClick={cancelarEdicao}
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div
            className={styles.bioBox}
            onClick={() => iniciarEdicao('bio')}
          >
            {perfil.bio ||
              'Clique para adicionar uma biografia...'}
          </div>
        )}
      </section>

      {/* SEÇÃO: DADOS DE CONTATO E PROFISSIONAIS */}
      <section>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>
            <FaIdCard className="text-blue-500" /> Dados de
            Contato e Profissionais
          </h3>
        </div>

        <div className={styles.dataGrid}>
          {/* CAMPO ESTÁTICO: E-MAIL */}
          <div className={styles.fieldWrapper}>
            <span className={styles.label}>
              E-mail (Não editável)
            </span>
            <span className={styles.value}>
              {perfil.email}
            </span>
          </div>

          {/* CAMPO EDITÁVEL: TELEFONE */}
          <div className={styles.fieldWrapper}>
            <span className={styles.label}>
              Telefone / WhatsApp
            </span>
            {editandoId === 'telefone' ? (
              <div className="flex gap-2">
                <input
                  className={styles.inputEdit}
                  value={tempData.telefone || ''}
                  onChange={(e) =>
                    handleInputChange(
                      'telefone',
                      e.target.value,
                    )
                  }
                  onKeyDown={(e) =>
                    e.key === 'Enter' &&
                    salvarEdicao('telefone')
                  }
                  autoFocus
                />
                <button
                  onClick={() => salvarEdicao('telefone')}
                  className="text-green-500"
                >
                  <FaCheck />
                </button>
                <button
                  onClick={cancelarEdicao}
                  className="text-red-400"
                >
                  <FaTimes />
                </button>
              </div>
            ) : (
              <div
                className="flex justify-between items-center group cursor-pointer"
                onClick={() => iniciarEdicao('telefone')}
              >
                <span className={styles.value}>
                  {perfil.telefone || 'Não cadastrado'}
                </span>
                <FaPen className={styles.editIcon} />
              </div>
            )}
          </div>

          {/* RENDERIZAÇÃO CONDICIONAL: CAMPOS DE PRESTADOR */}
          {isPrestador && (
            <>
              {perfil.tipo === 'enfermeiro' && (
                <div className={styles.fieldWrapper}>
                  <span className={styles.label}>
                    Registro COREN
                  </span>
                  <span className={styles.value}>
                    {perfil.coren || 'Não informado'}
                  </span>
                </div>
              )}

              <div className={styles.fieldWrapper}>
                <span className={styles.label}>
                  Anos de Experiência
                </span>
                <span className={styles.value}>
                  {perfil.anos_experiencia
                    ? `${perfil.anos_experiencia} anos`
                    : 'Não informado'}
                </span>
              </div>
            </>
          )}
        </div>
      </section>

      {/* SEÇÃO: LOCALIZAÇÃO */}
      <section>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>
            <FaMapMarkerAlt className="text-blue-500" />{' '}
            Localização
          </h3>
          <FaPen
            className="text-slate-300 text-xs cursor-pointer"
            title="Editar endereço"
          />
        </div>
        <div className={styles.dataGrid}>
          {/* Renderização do endereço conforme perfil */}
          <div className={styles.fieldWrapper}>
            <span className={styles.label}>
              Cidade e Estado
            </span>
            <span className={styles.value}>
              {perfil.cidade
                ? `${perfil.cidade} - ${perfil.estado}`
                : 'Endereço não cadastrado'}
            </span>
          </div>
          <div className={styles.fieldWrapper}>
            <span className={styles.label}>Endereço</span>
            <span className={styles.value}>
              {perfil.endereco || 'Não informado'}
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AbaSobrePro;
