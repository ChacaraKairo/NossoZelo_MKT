import React from 'react';
import Input from './Input';
import GenderSelector from './GenderSelector';
import TooltipAviso from './TooltipAviso';
import BotaoCadastrar from './BotaoCadastrar';
import SelectTipoUsuario from './SelectTipoUsuario';
import CamposExtras from './CamposExtras';
import useCadastroForm from '../../hooks/useCadastroForm';
import style from '../../styles/components/geral/CadastroForm.module.css';

export default function CadastroForm() {
  const {
    form,
    extra,
    handleChange,
    handleExtraChange,
    handleSubmit,
  } = useCadastroForm();

  return (
    <form
      className={style.formContainer}
      onSubmit={handleSubmit}
    >
      <h2 className={style.title}>Criar nova conta</h2>

      <div className={style.avisoContainer}>
        <TooltipAviso />
      </div>

      <div className={style.inputRow}>
        <Input
          type="text"
          placeholder="Nome"
          name="nome"
          required
          value={form.nome}
          onChange={handleChange}
        />
        <Input
          type="text"
          placeholder="Sobrenome"
          name="sobrenome"
          required
          value={form.sobrenome}
          onChange={handleChange}
        />
      </div>

      <Input
        type="date"
        placeholder="Data de nascimento"
        name="data_nascimento"
        required
        value={form.data_nascimento}
        onChange={handleChange}
      />

      <GenderSelector
        value={form.sexo || 'outro'}
        onChange={handleChange}
      />

      <Input
        type="text"
        placeholder="CPF"
        name="cpf"
        required
        value={form.cpf}
        onChange={handleChange}
      />
      <Input
        type="email"
        placeholder="E-mail"
        name="email"
        required
        value={form.email}
        onChange={handleChange}
      />
      <Input
        type="password"
        placeholder="Senha"
        name="senha"
        required
        value={form.senha}
        onChange={handleChange}
      />
      <Input
        type="password"
        placeholder="Confirme a senha"
        name="confirmarSenha"
        required
        value={form.confirmarSenha}
        onChange={handleChange}
      />

      {/* Campos adicionais */}
      <Input
        type="text"
        placeholder="Telefone"
        name="telefone"
        value={form.telefone}
        onChange={handleChange}
      />
      <Input
        type="text"
        placeholder="Endereço"
        name="endereco"
        value={form.endereco}
        onChange={handleChange}
      />
      <Input
        type="text"
        placeholder="Cidade"
        name="cidade"
        value={form.cidade}
        onChange={handleChange}
      />
      <Input
        type="text"
        placeholder="Estado"
        name="estado"
        value={form.estado}
        onChange={handleChange}
      />
      <Input
        type="text"
        placeholder="País"
        name="pais"
        value={form.pais}
        onChange={handleChange}
      />
      <Input
        type="url"
        placeholder="URL da foto de perfil"
        name="url_foto_perfil"
        value={form.url_foto_perfil}
        onChange={handleChange}
      />

      {/* Novo componente para escolher o tipo */}
      <SelectTipoUsuario
        value={form.tipo}
        onChange={handleChange}
      />

      {/* Campos adicionais com base no tipo */}
      <CamposExtras
        tipo={form.tipo}
        extra={extra}
        onChange={handleExtraChange}
      />

      <p className={style.termosTexto}>
        Ao prosseguir com o cadastro, o usuário declara ter
        lido e aceito os{' '}
        <a href="#" className={style.link}>
          termos de uso
        </a>{' '}
        e a{' '}
        <a href="#" className={style.link}>
          política de privacidade
        </a>
        .
      </p>

      <BotaoCadastrar />

      <p className={style.textoFinal}>
        Já possui uma conta?
      </p>
    </form>
  );
}
