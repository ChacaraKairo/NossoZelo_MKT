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
  const categoriasSelecionadas =
    profissional.categorias.length > 0
      ? profissional.categorias
      : profissional.categoria
        ? [profissional.categoria]
        : [];
  const categoriaPrincipal = categoriasSelecionadas[0] || '';
  const formulario = ehTipoPrestador(categoriaPrincipal)
    ? FORMULARIO_PRESTADOR[categoriaPrincipal]
    : null;
  const temEnfermeiro = categoriasSelecionadas.includes('enfermeiro');
  const temMotorista = categoriasSelecionadas.includes(
    'motorista_assistencial',
  );

  const alternarCategoria = (categoria: string) => {
    const jaSelecionada = categoriasSelecionadas.includes(categoria);
    const novasCategorias = jaSelecionada
      ? categoriasSelecionadas.filter((item) => item !== categoria)
      : categoriasSelecionadas.length < 2
        ? [...categoriasSelecionadas, categoria]
        : categoriasSelecionadas;

    updateProfissional({
      categorias: novasCategorias,
      categoria: novasCategorias[0] || '',
      registro: novasCategorias.includes('enfermeiro')
        ? profissional.registro
        : '',
      placa: novasCategorias.includes('motorista_assistencial')
        ? profissional.placa
        : '',
    });
  };

  return (
    <div className={Style.stepForm}>
      <h3>Dados Profissionais</h3>
      <p>
        Nos conte sobre sua experiência e especialidades.
      </p>

      <div className={Style.inputGroup}>
        <label>Categorias profissionais</label>
        <div className={Style.checkboxGrid}>
          {CATEGORIAS_PRESTADOR.map((categoria) => (
            <label key={categoria.value} className={Style.checkboxOption}>
              <input
                type="checkbox"
                checked={categoriasSelecionadas.includes(categoria.value)}
                disabled={
                  !categoriasSelecionadas.includes(categoria.value) &&
                  categoriasSelecionadas.length >= 2
                }
                onChange={() => alternarCategoria(categoria.value)}
              />
              <span>{categoria.label}</span>
            </label>
          ))}
        </div>
        <small>Escolha até 2 categorias. A primeira será a principal.</small>
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

      {temEnfermeiro && (
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

      {temMotorista && (
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
