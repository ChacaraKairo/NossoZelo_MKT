// src/components/cadastro/StepEndereco.tsx
import React, { useState } from 'react';
import { useCadastroPrestadorStore } from '@/store/useCadastroPrestadorStore';
import Style from '@/styles/Wizard.module.css';

const StepEndereco = () => {
  const { endereco, updateEndereco, erros } =
    useCadastroPrestadorStore();
  const [erroCep, setErroCep] = useState<string | null>(
    null,
  );
  const [buscandoCep, setBuscandoCep] = useState(false);

  const mascaraCep = (valor: string) => {
    return valor
      .replace(/\D/g, '')
      .replace(/^(\d{5})(\d)/, '$1-$2')
      .slice(0, 9);
  };

  const handleBuscaCep = async () => {
    const cepLimpo = endereco.cep.replace(/\D/g, '');
    if (cepLimpo.length !== 8) return;

    setBuscandoCep(true);
    setErroCep(null);

    try {
      const response = await fetch(
        `https://viacep.com.br/ws/${cepLimpo}/json/`,
      );
      const dados = await response.json();

      if (!dados.erro) {
        updateEndereco({
          rua: dados.logradouro || '',
          bairro: dados.bairro || '',
          cidade: dados.localidade || '',
          uf: dados.uf || '',
        });
      } else {
        setErroCep('CEP não encontrado.');
      }
    } catch (err) {
      setErroCep('Erro na busca do CEP.');
    } finally {
      setBuscandoCep(false);
    }
  };

  return (
    <div className={Style.stepForm}>
      <h3>Endereço e Logística</h3>
      <p>
        Onde você mora e até onde aceita se deslocar para
        atender?
      </p>

      {/* LINHA 1: CEP E RUA */}
      <div className={Style.inputRow}>
        <div className={Style.inputGroup}>
          <label>CEP</label>
          <input
            type="text"
            placeholder="00000-000"
            value={endereco.cep}
            onChange={(e) =>
              updateEndereco({
                cep: mascaraCep(e.target.value),
              })
            }
            onBlur={handleBuscaCep}
          />
          {buscandoCep && (
            <span
              style={{
                fontSize: '12px',
                color: '#0cc0df',
                display: 'block',
              }}
            >
              Buscando...
            </span>
          )}
          {(erroCep || erros.cep) && (
            <span className={Style.errorText}>
              {erroCep || erros.cep}
            </span>
          )}
        </div>
        <div
          className={Style.inputGroup}
          style={{ flex: 2 }}
        >
          {' '}
          {/* Mantemos o flex aqui apenas para Desktop, o CSS mobile vai sobrescrever */}
          <label>Rua / Logradouro</label>
          <input
            type="text"
            value={endereco.rua}
            onChange={(e) =>
              updateEndereco({ rua: e.target.value })
            }
          />
          {erros.rua && (
            <span className={Style.errorText}>
              {erros.rua}
            </span>
          )}
        </div>
      </div>

      {/* LINHA 2: NÚMERO E BAIRRO */}
      <div className={Style.inputRow}>
        <div className={Style.inputGroup}>
          <label>Número</label>
          <input
            type="text"
            value={endereco.numero}
            onChange={(e) =>
              updateEndereco({ numero: e.target.value })
            }
          />
          {erros.numero && (
            <span className={Style.errorText}>
              {erros.numero}
            </span>
          )}
        </div>
        <div
          className={Style.inputGroup}
          style={{ flex: 2 }}
        >
          <label>Bairro</label>
          <input
            type="text"
            value={endereco.bairro}
            onChange={(e) =>
              updateEndereco({ bairro: e.target.value })
            }
          />
          {erros.bairro && (
            <span className={Style.errorText}>
              {erros.bairro}
            </span>
          )}
        </div>
      </div>

      {/* LINHA 3: CIDADE E UF */}
      <div className={Style.inputRow}>
        <div
          className={Style.inputGroup}
          style={{ flex: 2 }}
        >
          <label>Cidade</label>
          <input
            type="text"
            value={endereco.cidade}
            onChange={(e) =>
              updateEndereco({ cidade: e.target.value })
            }
          />
          {erros.cidade && (
            <span className={Style.errorText}>
              {erros.cidade}
            </span>
          )}
        </div>
        <div className={Style.inputGroup}>
          <label>Estado (UF)</label>
          <input
            type="text"
            maxLength={2}
            value={endereco.uf}
            onChange={(e) =>
              updateEndereco({
                uf: e.target.value.toUpperCase(),
              })
            }
          />
          {erros.uf && (
            <span className={Style.errorText}>
              {erros.uf}
            </span>
          )}
        </div>
      </div>

      {/* RAIO DE ATUAÇÃO */}
      <div
        className={Style.inputGroup}
        style={{ marginTop: '15px' }}
      >
        <label>
          Raio de Atuação:{' '}
          <strong>Até {endereco.raioAtuacao} km</strong>
        </label>
        <p
          style={{
            fontSize: '12px',
            color: '#607d8b',
            margin: '0 0 10px 0',
          }}
        >
          Distância máxima que você aceita viajar para um
          atendimento.
        </p>
        <input
          type="range"
          min="1"
          max="50"
          value={endereco.raioAtuacao}
          onChange={(e) =>
            updateEndereco({
              raioAtuacao: Number(e.target.value),
            })
          }
          className={Style.rangeInput}
        />
      </div>
    </div>
  );
};

export default StepEndereco;
