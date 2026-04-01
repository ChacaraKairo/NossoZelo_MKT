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

      <div className={Style.inputRow}>
        <div className={Style.inputGroup}>
          <label>Anos de Experiência</label>
          <input
            type="number"
            min="0"
            value={profissional.experiencia}
            onChange={(e) =>
              updateProfissional({
                experiencia: Number(e.target.value),
              })
            }
          />
        </div>

        <div className={Style.inputGroup}>
          <label>Valor Hora (R$)</label>
          <input
            type="number"
            min="30"
            step="5"
            value={profissional.valorHora}
            onChange={(e) =>
              updateProfissional({
                valorHora: Number(e.target.value),
              })
            }
          />
        </div>
      </div>

      <div className={Style.inputGroup}>
        <label>Biografia (Apresentação)</label>
        <textarea
          maxLength={500}
          placeholder="Fale um pouco sobre você e seu método de cuidado..."
          value={profissional.bio}
          onChange={(e) =>
            updateProfissional({ bio: e.target.value })
          }
        />
        <span className={Style.charCount}>
          {profissional.bio.length} / 500
        </span>
        {erros.bio && (
          <span className={Style.errorText}>
            {erros.bio}
          </span>
        )}
      </div>
    </div>
  );
};

export default StepProfissional;
