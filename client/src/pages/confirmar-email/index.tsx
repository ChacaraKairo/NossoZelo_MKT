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
  const [linkPagamento, setLinkPagamento] = useState<string | null>(null);
  const [pixCopiaCola, setPixCopiaCola] = useState<string | null>(null);
  const [avisoPagamento, setAvisoPagamento] = useState<string | null>(null);

  useEffect(() => {
    const token =
      typeof router.query.token === 'string' ? router.query.token : '';
    if (!router.isReady) return;

    if (router.query.enviado === '1') {
      setEstado('sucesso');
      setMensagem(
        'Cadastro recebido. Enviamos um link para confirmar seu e-mail. Depois da confirmacao, o pagamento do registro sera gerado automaticamente.',
      );
      return;
    }

    if (!token) {
      setEstado('erro');
      setMensagem('Token de confirmacao ausente.');
      return;
    }

    emailConfirmacaoService
      .confirmarEmail(token, 'pix')
      .then((resposta) => {
        setEstado('sucesso');
        setMensagem(resposta.message || 'E-mail confirmado com sucesso.');
        const gateway = resposta.pagamento_cadastro?.gateway_resultado;
        setLinkPagamento(gateway?.invoiceUrl || gateway?.bankSlipUrl || null);
        setPixCopiaCola(gateway?.pixQrCode?.payload || null);
        setAvisoPagamento(resposta.aviso_pagamento || null);
      })
      .catch((error) => {
        setEstado('erro');
        setMensagem(extrairMensagemErro(error));
      });
  }, [router.isReady, router.query.enviado, router.query.token]);

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
                  ? 'E-mail confirmado'
                  : 'Nao foi possivel confirmar'}
              </h1>
              <p className={styles.emptyText}>{mensagem}</p>
              {avisoPagamento && (
                <p className={styles.emptyText}>{avisoPagamento}</p>
              )}
              {linkPagamento && (
                <div className={styles.emailActions}>
                  <a
                    href={linkPagamento}
                    className={styles.emailAction}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Pagar registro
                  </a>
                </div>
              )}
              {pixCopiaCola && (
                <div className={styles.paymentBox}>
                  <strong>Pix copia e cola</strong>
                  <textarea readOnly value={pixCopiaCola} />
                </div>
              )}
              <div className={styles.emailActions}>
                <Link href="/login-user" className={styles.emailAction}>
                  Ir para login
                </Link>
                <Link href="/perfil" className={styles.emailActionSecondary}>
                  Ir para perfil
                </Link>
              </div>
            </>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
