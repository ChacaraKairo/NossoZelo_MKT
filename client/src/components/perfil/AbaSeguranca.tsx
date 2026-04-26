import { FormEvent, useState } from 'react';
import { segurancaService } from '@/service/segurancaService';
import logger from '@/utils/logger';
import { extrairMensagemErro } from '@/utils/tratarErroApi';
import styles from '@/styles/components/perfil/PerfilOperacional.module.css';

const CONTEXTO = 'AbaSeguranca';

function senhaForte(senha: string) {
  return (
    senha.length >= 8 &&
    senha.length <= 72 &&
    /[a-z]/.test(senha) &&
    /[A-Z]/.test(senha) &&
    /\d/.test(senha) &&
    /[^A-Za-z0-9]/.test(senha)
  );
}

export default function AbaSeguranca() {
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  const alterarSenha = async (event: FormEvent) => {
    event.preventDefault();
    logger.info(CONTEXTO, 'Iniciando alteração de senha pelo perfil');
    setErro(null);
    setSucesso(null);

    if (!senhaAtual) {
      setErro('Informe sua senha atual.');
      return;
    }

    if (!senhaForte(novaSenha)) {
      setErro(
        'A nova senha deve ter 8 a 72 caracteres, com letra maiúscula, minúscula, número e caractere especial.',
      );
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setErro('A confirmação da nova senha não confere.');
      return;
    }

    try {
      setSalvando(true);
      const resposta = await segurancaService.alterarSenha({
        senhaAtual,
        novaSenha,
      });
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmarSenha('');
      setSucesso(resposta.message || 'Senha atualizada com sucesso.');
    } catch (error) {
      setErro(extrairMensagemErro(error));
    } finally {
      setSalvando(false);
    }
  };

  return (
    <section className={styles.section}>
      <header className={styles.header}>
        <div>
          <h2 className={styles.title}>Segurança</h2>
          <p className={styles.subtitle}>
            Atualize sua senha com validação da senha atual e sessão
            autenticada.
          </p>
        </div>
      </header>

      <ul className={styles.securityList}>
        <li>Use uma senha única, que não seja usada em outros serviços.</li>
        <li>
          A plataforma nunca salva sua senha em texto puro no frontend.
        </li>
        <li>
          Tokens e credenciais sensíveis devem permanecer somente no backend.
        </li>
      </ul>

      {erro && <div className={styles.error}>{erro}</div>}
      {sucesso && <div className={styles.success}>{sucesso}</div>}

      <form className={styles.form} onSubmit={alterarSenha}>
        <label className={styles.field}>
          <span className={styles.label}>Senha atual</span>
          <input
            className={styles.input}
            type="password"
            value={senhaAtual}
            onChange={(event) => setSenhaAtual(event.target.value)}
            disabled={salvando}
          />
        </label>

        <div className={styles.formGrid}>
          <label className={styles.field}>
            <span className={styles.label}>Nova senha</span>
            <input
              className={styles.input}
              type="password"
              value={novaSenha}
              onChange={(event) => setNovaSenha(event.target.value)}
              disabled={salvando}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Confirmar nova senha</span>
            <input
              className={styles.input}
              type="password"
              value={confirmarSenha}
              onChange={(event) =>
                setConfirmarSenha(event.target.value)
              }
              disabled={salvando}
            />
          </label>
        </div>

        <div className={styles.actions}>
          <button
            type="submit"
            className={styles.primaryButton}
            disabled={salvando}
          >
            {salvando ? 'Atualizando...' : 'Atualizar senha'}
          </button>
        </div>
      </form>
    </section>
  );
}
