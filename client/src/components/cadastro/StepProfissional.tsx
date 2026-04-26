// src/components/cadastro/StepProfissional.tsx
import React from 'react';
import { useCadastroPrestadorStore } from '@/store/useCadastroPrestadorStore';
import Style from '@/styles/Wizard.module.css';

const StepProfissional = () => {
  const { profissional, updateProfissional, erros } =
    useCadastroPrestadorStore();

  return (
    <div className={Style.stepForm}>
      <h3>Dados Profissionais</h3>
      <p>
        Nos conte sobre sua experiência e especialidades.
      </p>

      {/* CATEGORIA */}
      <div className={Style.inputGroup}>
        <label>Categoria</label>
        <select
          value={profissional.categoria}
          onChange={(e) =>
            updateProfissional({
              categoria: e.target.value,
            })
          }
        >
          <option value="">Selecione...</option>
          <option value="cuidador">Cuidador</option>
          <option value="enfermeiro">Enfermeiro</option>
          <option value="acompanhante">Acompanhante</option>
        </select>
        {erros.categoria && (
          <span className={Style.errorText}>
            {erros.categoria}
          </span>
        )}
      </div>

      {/* REGISTRO (COREN) - Condicional */}
      {(profissional.categoria === 'enfermeiro' ||
        profissional.categoria === 'tec_enfermagem') && (
        <div className={Style.inputGroup}>
          <label>Registro Profissional (COREN)</label>
          <input
            type="text"
            placeholder="Ex: COREN-SP 123456"
            value={profissional.registro}
            onChange={(e) =>
              updateProfissional({
                registro: e.target.value,
              })
            }
          />
          {erros.registro && (
            <span className={Style.errorText}>
              {erros.registro}
            </span>
          )}
        </div>
      )}

      {/* EXPERIÊNCIA E VALOR HORA - Ajustado para empilhar no mobile */}
      <div className={Style.inputRow}>
        <div
          className={Style.inputGroup}
          style={{ flex: 1 }}
        >
          <label>Anos de Experiência</label>
          <input
            type="number"
            min="0"
            max="80"
            value={profissional.experiencia}
            onChange={(e) =>
              updateProfissional({
                experiencia: Number(e.target.value),
              })
            }
          />
          {erros.experiencia && (
            <span className={Style.errorText}>
              {erros.experiencia}
            </span>
          )}
        </div>

        <div
          className={Style.inputGroup}
          style={{ flex: 1 }}
        >
          <label>Valor Hora (R$)</label>
          <input
            type="number"
            min="10"
            max="1000"
            step="5"
            value={profissional.valorHora}
            onChange={(e) =>
              updateProfissional({
                valorHora: Number(e.target.value),
              })
            }
          />
          {erros.valorHora && (
            <span className={Style.errorText}>
              {erros.valorHora}
            </span>
          )}
        </div>
      </div>

      {/* BIOGRAFIA */}
      <div className={Style.inputGroup}>
        <label>Biografia (Apresentação)</label>
        <textarea
          maxLength={500}
          placeholder="Fale um pouco sobre você e seu método de cuidado..."
          value={profissional.bio}
          onChange={(e) =>
            updateProfissional({ bio: e.target.value })
          }
          style={{ minHeight: '120px' }} // Garante uma área de toque melhor no mobile
        />
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '4px',
          }}
        >
          {erros.bio ? (
            <span className={Style.errorText}>
              {erros.bio}
            </span>
          ) : (
            <div />
          )}{' '}
          {/* Espaçador para manter o contador à direita */}
          <span className={Style.charCount}>
            {profissional.bio.length} / 500
          </span>
        </div>
      </div>
    </div>
  );
};

export default StepProfissional;
