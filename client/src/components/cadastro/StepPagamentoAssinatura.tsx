import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { emailConfirmacaoService } from '@/service/emailConfirmacaoService';
import { extrairMensagemErro } from '@/utils/tratarErroApi';
import Style from '@/styles/Wizard.module.css';

type Estado = 'aguardando_email' | 'confirmando' | 'confirmado' | 'erro';

export default function StepPagamentoAssinatura() {
  const router = useRouter();
  const [estado, setEstado] = useState<Estado>('aguardando_email');
  const [mensagem, setMensagem] = useState(
    'Apos confirmar seu e-mail, entre na sua conta e continue a ativacao em /onboarding/prestador.',
  );

  useEffect(() => {
    if (!router.isReady) return;

    const token =
      typeof router.query.confirmar_email === 'string'
        ? router.query.confirmar_email
        : '';

    if (!token) {
      setEstado('aguardando_email');
      setMensagem(
        'Enviamos um link para o e-mail informado. Apos confirmar seu e-mail, entre na sua conta e continue a ativacao em /onboarding/prestador.',
      );
      return;
    }

    setEstado('confirmando');
    setMensagem('Confirmando seu e-mail...');

    emailConfirmacaoService
      .confirmarEmail(token)
      .then((resposta) => {
        setEstado('confirmado');
        setMensagem(
          resposta.proximo_passo ||
            'E-mail confirmado. Entre na sua conta e continue a ativacao em /onboarding/prestador.',
        );
      })
      .catch((error) => {
        setEstado('erro');
        setMensagem(extrairMensagemErro(error));
      });
  }, [router.isReady, router.query.confirmar_email]);

  return (
    <div className={Style.paymentStep}>
      <div
        className={
          estado === 'erro'
            ? Style.validationBanner
            : estado === 'confirmado'
              ? Style.successBanner
              : Style.infoBanner
        }
      >
        <h3>
          {estado === 'confirmado'
            ? 'E-mail confirmado'
            : estado === 'confirmando'
              ? 'Confirmando e-mail'
              : estado === 'erro'
                ? 'Nao foi possivel confirmar'
                : 'Confirme seu e-mail'}
        </h3>
        <p>{mensagem}</p>
      </div>

      <p className={Style.fieldHelpText}>
        O pagamento nao e feito nesta tela. A cobranca sera gerada no Asaas pelo
        onboarding do perfil profissional, sem coleta de cartao no NossoZelo.
      </p>
    </div>
  );
}
