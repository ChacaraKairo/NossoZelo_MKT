export type RedeSocialNossoZelo = {
  nome: 'LinkedIn' | 'Instagram' | 'Facebook';
  url: string;
};

export const contatosNossoZelo = {
  empresa: 'NossoZelo',
  slogan: 'Assim como voce, cuidamos bem de quem amamos!',
  descricao:
    'Sua plataforma de confianca para servicos de cuidado.',
  emailAtendimento: '',
  telefoneAtendimento: '',
  whatsappAtendimento: '',
  redesSociais: [
    {
      nome: 'LinkedIn',
      url:
        process.env.NEXT_PUBLIC_NOSSOZELO_LINKEDIN_URL ||
        '',
    },
    {
      nome: 'Instagram',
      url:
        process.env.NEXT_PUBLIC_NOSSOZELO_INSTAGRAM_URL ||
        '',
    },
    {
      nome: 'Facebook',
      url:
        process.env.NEXT_PUBLIC_NOSSOZELO_FACEBOOK_URL ||
        '',
    },
  ] satisfies RedeSocialNossoZelo[],
} as const;

export function criarLinkEmail(email: string) {
  return `mailto:${email}`;
}

export function criarLinkTelefone(telefone: string) {
  return `tel:${telefone.replace(/\D/g, '')}`;
}

export function criarLinkWhatsApp(telefone: string) {
  return `https://wa.me/${telefone.replace(/\D/g, '')}`;
}

export function obterRedesSociaisAtivas() {
  return contatosNossoZelo.redesSociais.filter(
    (rede) => rede.url.trim().length > 0,
  );
}
