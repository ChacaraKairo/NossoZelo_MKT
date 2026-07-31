// src/components/cadastro/StepProfissional.tsx
import React from 'react';
import {
  CATEGORIAS_PRESTADOR,
  FORMULARIO_PRESTADOR,
  ehTipoPrestador,
} from '@/constants/prestadores';
import { useCadastroPrestadorStore } from '@/store/useCadastroPrestadorStore';
import Style from '@/styles/Wizard.module.css';

const StepProfissional = () => {
  const { profissional, updateProfissional, erros } =
    useCadastroPrestadorStore();
  const formulario = ehTipoPrestador(profissional.categoria)
    ? FORMULARIO_PRESTADOR[profissional.categoria]
    : null;

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
              registro: '',
              placa: '',
            })
          }
        >
          <option value="">Selecione...</option>
          {CATEGORIAS_PRESTADOR.map((categoria) => (
            <option key={categoria.value} value={categoria.value}>
              {categoria.label}
            </option>
          ))}
        </select>
        {erros.categoria && (
          <span className={Style.errorText}>
            {erros.categoria}
          </span>
        )}
      </div>

      {formulario && (
        <>
          <h4>{formulario.titulo}</h4>
          <p>{formulario.descricao}</p>
        </>
      )}

      {profissional.categoria === 'enfermeiro' && (
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

      {profissional.categoria === 'motorista_assistencial' && (
        <div className={Style.inputGroup}>
          <label>Placa do veículo</label>
          <input
            type="text"
            placeholder="Ex: ABC1234 ou ABC1D23"
            value={profissional.placa}
            onChange={(e) =>
              updateProfissional({
                placa: e.target.value.toUpperCase(),
              })
            }
          />
          {erros.placa && (
            <span className={Style.errorText}>
              {erros.placa}
            </span>
          )}
        </div>
      )}

      {/* EXPERIÊNCIA E VALOR HORA - Ajustado para empilhar no mobile */}
      <div className={Style.inputRow}>
        <div
          className={Style.inputGroup}
        >
          <label>
            {formulario?.experienciaLabel || 'Anos de Experiência'}
          </label>
          <input
            type="number"
            min="0"
            max="80"
            placeholder={formulario?.experienciaPlaceholder}
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
        >
          <label>{formulario?.valorHoraLabel || 'Valor Hora (R$)'}</label>
          <input
            type="number"
            min="10"
            max="1000"
            step="5"
            placeholder={formulario?.valorHoraPlaceholder}
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

        <div
          className={Style.inputGroup}
        >
          <label>
            {formulario?.valorDiariaLabel || 'Valor Diaria (R$)'}
          </label>
          <input
            type="number"
            min="30"
            max="10000"
            step="10"
            placeholder={formulario?.valorDiariaPlaceholder}
            value={profissional.valorDiaria}
            onChange={(e) =>
              updateProfissional({
                valorDiaria: Number(e.target.value),
              })
            }
          />
          {erros.valorDiaria && (
            <span className={Style.errorText}>
              {erros.valorDiaria}
            </span>
          )}
        </div>
      </div>

      <div className={Style.inputGroup}>
        <label>
          {formulario?.disponibilidadeLabel || 'Disponibilidade'}
        </label>
        <input
          type="text"
          placeholder={
            formulario?.disponibilidadePlaceholder ||
            'Ex: segunda a sexta, manha e tarde'
          }
          value={profissional.disponibilidade}
          onChange={(e) =>
            updateProfissional({
              disponibilidade: e.target.value,
            })
          }
        />
        {erros.disponibilidade && (
          <span className={Style.errorText}>
            {erros.disponibilidade}
          </span>
        )}
      </div>

      <div className={Style.inputGroup}>
        <label>
          {formulario?.especialidadesLabel || 'Especialidades'}
        </label>
        <textarea
          maxLength={500}
          placeholder={
            formulario?.especialidadesPlaceholder ||
            'Ex: idosos, mobilidade reduzida, pos-operatorio'
          }
          value={profissional.especialidades}
          onChange={(e) =>
            updateProfissional({
              especialidades: e.target.value,
            })
          }
          className={Style.textareaSmall}
        />
        {erros.especialidades && (
          <span className={Style.errorText}>
            {erros.especialidades}
          </span>
        )}
      </div>

      <div className={Style.inputGroup}>
        <label>{formulario?.bioLabel || 'Biografia (Apresentação)'}</label>
        <textarea
          maxLength={500}
          placeholder={
            formulario?.bioPlaceholder ||
            'Fale um pouco sobre você e seu método de cuidado...'
          }
          value={profissional.bio}
          onChange={(e) =>
            updateProfissional({ bio: e.target.value })
          }
          className={Style.textareaLarge}
        />
        <div className={Style.bioFooter}>
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
