import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import HeaderMain from '@/components/header/HeaderMain';
import Footer from '@/components/footer/Footer';
import Carregando from '@/components/common/Carregando';
import { emailConfirmacaoService } from '@/service/emailConfirmacaoService';
import { extrairMensagemErro } from '@/utils/tratarErroApi';
import styles from '@/styles/Perfil.module.css';

type Estado = 'confirmando' | 'sucesso' | 'erro';

export default function ConfirmarEmailPage() {
  const router = useRouter();
  const [estado, setEstado] = useState<Estado>('confirmando');
  const [mensagem, setMensagem] = useState('Confirmando seu e-mail...');
  const [podeReenviar, setPodeReenviar] = useState(false);
  const [reenviando, setReenviando] = useState(false);

  useEffect(() => {
    const codigo =
      typeof router.query.token === 'string' ? router.query.token : '';
    if (!router.isReady) return;

    if (router.query.enviado === '1') {
      setEstado('sucesso');
      setPodeReenviar(false);
      setMensagem(
        'Cadastro recebido. Enviamos um link para confirmar seu e-mail. Depois da confirmacao, sua conta sera liberada para uso.',
      );
      return;
    }

    if (!codigo) {
      emailConfirmacaoService
        .obterStatus()
        .then((status) => {
          if (status.email_confirmado) {
            setEstado('sucesso');
            setPodeReenviar(false);
            setMensagem('E-mail ja confirmado. Sua conta esta liberada.');
            return;
          }

          setEstado('erro');
          setPodeReenviar(true);
          setMensagem(
            `Confirme o link enviado para ${status.email}. Enquanto o e-mail nao for confirmado, sua conta permanece limitada.`,
          );
        })
        .catch(() => {
          setEstado('erro');
          setPodeReenviar(false);
          setMensagem(
            'Nao encontramos o link de confirmacao. Peca um novo envio ou tente novamente pelo e-mail recebido.',
          );
        });
      return;
    }

    emailConfirmacaoService
      .confirmarEmail(codigo)
      .then((resposta) => {
        setEstado('sucesso');
        setPodeReenviar(false);
        setMensagem(
          resposta.proximo_passo ||
            resposta.message ||
            'E-mail confirmado com sucesso.',
        );
      })
      .catch((error) => {
        setEstado('erro');
        setPodeReenviar(true);
        setMensagem(extrairMensagemErro(error));
      });
  }, [router.isReady, router.query.enviado, router.query.token]);

  async function reenviarConfirmacao() {
    try {
      setReenviando(true);
      const resposta = await emailConfirmacaoService.reenviarConfirmacao();
      setEstado('sucesso');
      setPodeReenviar(false);
      setMensagem(resposta.message || 'Enviamos um novo e-mail de confirmacao.');
    } catch (error) {
      setEstado('erro');
      setMensagem(extrairMensagemErro(error));
    } finally {
      setReenviando(false);
    }
  }

  return (
    <div className={styles.container}>
      <HeaderMain />
      <main className={styles.mainContent}>
        <section className={styles.card}>
          {estado === 'confirmando' ? (
            <Carregando mensagem={mensagem} />
          ) : (
            <>
              <h1 className={styles.emptyTitle}>
                {estado === 'sucesso'
                  ? 'Confirmacao de e-mail'
                  : 'Confirme seu e-mail'}
              </h1>
              <p className={styles.emptyText}>{mensagem}</p>
              <div className={styles.emailActions}>
                {podeReenviar && (
                  <button
                    type="button"
                    className={styles.emailAction}
                    onClick={reenviarConfirmacao}
                    disabled={reenviando}
                  >
                    {reenviando ? 'Reenviando...' : 'Reenviar e-mail'}
                  </button>
                )}
                <Link href="/login-user" className={styles.emailAction}>
                  Ir para login
                </Link>
                {estado === 'sucesso' && !podeReenviar && (
                  <Link href="/perfil" className={styles.emailActionSecondary}>
                    Ir para perfil
                  </Link>
                )}
              </div>
            </>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
