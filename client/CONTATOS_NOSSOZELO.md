# Contatos Oficiais - NossoZelo

Este documento centraliza os contatos da empresa NossoZelo para uso em componentes como footer, telas de suporte, contato e mensagens institucionais.

## Fonte Usada Pelo Frontend

Os componentes devem importar os dados de:

`client/src/config/contatosNossoZelo.ts`

Evite repetir e-mail, telefone ou links de redes sociais diretamente dentro dos componentes.

## Contatos Atuais

| Canal | Valor |
| --- | --- |
| Empresa | NossoZelo |
| E-mail de atendimento | atendimento@nossozelomkt.com.br |
| Telefone de atendimento | Pendente de confirmacao |
| WhatsApp | Pendente de confirmacao |
| LinkedIn | Configurar via `NEXT_PUBLIC_NOSSOZELO_LINKEDIN_URL` |
| Instagram | Configurar via `NEXT_PUBLIC_NOSSOZELO_INSTAGRAM_URL` |
| Facebook | Configurar via `NEXT_PUBLIC_NOSSOZELO_FACEBOOK_URL` |

## Variaveis de Ambiente Opcionais

Adicione no `client/.env` quando os links oficiais forem confirmados:

```env
NEXT_PUBLIC_NOSSOZELO_LINKEDIN_URL="https://..."
NEXT_PUBLIC_NOSSOZELO_INSTAGRAM_URL="https://..."
NEXT_PUBLIC_NOSSOZELO_FACEBOOK_URL="https://..."
```

## Regra de Uso

- E-mail deve usar `mailto:`.
- Telefone deve usar `tel:`.
- WhatsApp deve usar `https://wa.me/`.
- Redes sociais sem URL oficial nao devem aparecer como links falsos.
- Nao usar `href="#"` para contato ou rede social.
