// src/components/cadastro/StepPessoais.tsx
import React from 'react';
import { useCadastroPrestadorStore } from '@/store/useCadastroPrestadorStore';
import Style from '@/styles/Wizard.module.css';

import Input from '@/components/inputs/Input';
import InputDate from '@/components/inputs/InputDate';
import { mascaraCpf, mascaraTelefone } from '@/utils/masks';

const StepPessoais = () => {
  const { dadosPessoais, updateDadosPessoais, erros } =
    useCadastroPrestadorStore();

  return (
    <div className={Style.stepForm}>
      <h3>Dados Pessoais</h3>
      <p>
        Vamos começar com as suas informações básicas de
        identificação.
      </p>

      {/* LINHA 1: NOME E SOBRENOME */}
      <div className={Style.inputRow}>
        <div className={Style.inputGroup}>
          <label>Nome</label>
          <Input
            value={dadosPessoais.nome}
            onChange={(e) =>
              updateDadosPessoais({ nome: e.target.value })
            }
            placeholder="O seu primeiro nome"
          />
          {erros.nome && (
            <span className={Style.errorText}>
              {erros.nome}
            </span>
          )}
        </div>
        <div className={Style.inputGroup}>
          <label>Sobrenome</label>
          <Input
            value={dadosPessoais.sobrenome}
            onChange={(e) =>
              updateDadosPessoais({
                sobrenome: e.target.value,
              })
            }
            placeholder="O seu sobrenome"
          />
          {erros.sobrenome && (
            <span className={Style.errorText}>
              {erros.sobrenome}
            </span>
          )}
        </div>
      </div>

      {/* LINHA 2: CPF E TELEFONE */}
      <div className={Style.inputRow}>
        <div className={Style.inputGroup}>
          <label>CPF</label>
          <Input
            value={dadosPessoais.cpf}
            onChange={(e) =>
              updateDadosPessoais({
                cpf: mascaraCpf(e.target.value),
              })
            }
            placeholder="000.000.000-00"
          />
          {erros.cpf && (
            <span className={Style.errorText}>
              {erros.cpf}
            </span>
          )}
        </div>
        <div className={Style.inputGroup}>
          <label>Telefone / WhatsApp</label>
          <Input
            value={dadosPessoais.telefone}
            onChange={(e) =>
              updateDadosPessoais({
                telefone: mascaraTelefone(e.target.value),
              })
            }
            placeholder="(00) 00000-0000"
            type="tel"
          />
          {erros.telefone && (
            <span className={Style.errorText}>
              {erros.telefone}
            </span>
          )}
        </div>
      </div>

      {/* LINHA 3: NASCIMENTO E GÊNERO */}
      <div className={Style.inputRow}>
        <div className={Style.inputGroup}>
          <label>Data de Nascimento</label>
          <InputDate
            selectedDate={
              dadosPessoais.dataNascimento
                ? new Date(dadosPessoais.dataNascimento)
                : null
            }
            onChange={(date: Date | null) => {
              updateDadosPessoais({
                dataNascimento: date
                  ? date.toISOString()
                  : null,
              });
            }}
            placeholderText="DD/MM/AAAA"
          />
          {erros.dataNascimento && (
            <span className={Style.errorText}>
              {erros.dataNascimento}
            </span>
          )}
        </div>

        <div className={Style.inputGroup}>
          <label>Gênero</label>
          <div className={Style.genderOptions}>
            {['Feminino', 'Masculino', 'Outro'].map(
              (opcao) => (
                <button
                  key={opcao}
                  type="button"
                  className={`${Style.genderOption} ${
                    dadosPessoais.sexo ===
                    opcao.toLowerCase()
                      ? Style.genderOptionActive
                      : ''
                  }`}
                  onClick={() =>
                    updateDadosPessoais({
                      sexo: opcao.toLowerCase(),
                    })
                  }
                >
                  {opcao}
                </button>
              ),
            )}
          </div>
          {erros.sexo && (
            <span className={Style.errorText}>
              {erros.sexo}
            </span>
          )}
        </div>
      </div>

      {/* LINHA 4: E-MAIL E SENHA */}
      <div className={Style.inputRow}>
        <div className={Style.inputGroup}>
          <label>E-mail</label>
          <Input
            value={dadosPessoais.email}
            onChange={(e) =>
              updateDadosPessoais({ email: e.target.value })
            }
            placeholder="seu@email.com"
            type="email"
          />
          {erros.email && (
            <span className={Style.errorText}>
              {erros.email}
            </span>
          )}
        </div>
        <div className={Style.inputGroup}>
          <label>Senha</label>
          <Input
            value={dadosPessoais.senha}
            onChange={(e) =>
              updateDadosPessoais({ senha: e.target.value })
            }
            placeholder="Senha forte"
            type="password"
          />
          {erros.senha && (
            <span className={Style.errorText}>
              {erros.senha}
            </span>
          )}
        </div>
      </div>

      <div className={Style.inputRow}>
        <div className={Style.inputGroup}>
          <label>Confirmar senha</label>
          <Input
            value={dadosPessoais.confirmarSenha}
            onChange={(e) =>
              updateDadosPessoais({
                confirmarSenha: e.target.value,
              })
            }
            placeholder="Digite a senha novamente"
            type="password"
          />
          {erros.confirmarSenha && (
            <span className={Style.errorText}>
              {erros.confirmarSenha}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default StepPessoais;

