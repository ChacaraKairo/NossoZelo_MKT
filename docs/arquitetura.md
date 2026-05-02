# Arquitetura NossoZelo

O NossoZelo e um marketplace para conectar clientes a cuidadores, enfermeiros e acompanhantes.

## Componentes

- `client`: Next.js publico para cadastro, login, busca, perfil e onboarding do prestador.
- `server`: Express/TypeScript com Prisma/MySQL, autenticacao, assinaturas Asaas, upload e regras de dominio.
- `controlador`: painel Next.js administrativo separado.
- `MySQL`: banco relacional principal.
- `Asaas`: gateway de cobranca da assinatura do prestador. Assinatura local so fica ativa apos webhook de pagamento confirmado.
- `AWS S3`: armazenamento de fotos publicas e documentos privados.

## Autenticacao

O backend emite JWT em cookie HttpOnly `nossozelo_session`. O frontend usa `credentials: include` e consulta `/nossozelo/login/me` para obter usuario autenticado.

Bearer Authorization ainda e aceito temporariamente para compatibilidade de scripts e testes, mas nao deve ser usado pelo frontend web.

## Assinatura

Prestadores passam por onboarding: e-mail confirmado, perfil profissional completo, escolha de plano, cobranca Asaas e confirmacao via webhook. Prestador inadimplente permanece logado, mas nao aparece na busca nem recebe pedidos.

## Upload

Upload de cadastro usa token temporario com `purpose=cadastro_upload`. Documentos privados retornam chave interna, nao URL publica. Arquivos sao validados por MIME declarado, extensao e magic bytes.
