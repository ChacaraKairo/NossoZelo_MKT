# Controlador - visao geral

O `controlador/` e o painel administrativo separado do NossoZelo. Ele usa Next.js App Router, Prisma e cookies HttpOnly para administrar usuarios, prestadores, planos, assinaturas, pendencias, e-mails e logs.

## Responsabilidade

O controlador existe para tarefas internas:

- acompanhar dashboard e indicadores;
- listar e revisar usuarios;
- liberar ou bloquear prestadores;
- revisar assinaturas e reprocessar eventos;
- criar, editar, ativar e desativar planos;
- listar pendencias operacionais;
- confirmar e-mails manualmente quando necessario;
- executar sincronizacao administrativa de assinaturas;
- receber webhook Asaas auxiliar.

Ele nao deve substituir a API publica do `server/`. O controlador acessa o mesmo banco e deve ser tratado como superficie critica.

## Estrutura

- `src/app/(admin)/`: paginas protegidas do painel.
- `src/app/login/`: tela publica de login administrativo.
- `src/app/api/`: APIs do painel.
- `src/lib/auth.ts`: autenticacao, sessao e guards.
- `src/lib/sessionToken.ts`: criacao e validacao de JWT administrativo.
- `src/lib/security.ts`: headers, CSRF/origem e utilitarios do proxy.
- `src/proxy.ts`: barreira central antes de paginas e APIs.
- `src/lib/queries.ts`: consultas agregadas e listagens.
- `src/lib/asaasWebhook.ts`: processamento de webhook Asaas no controlador.
- `src/lib/assinaturaMonitor.ts`: reconciliacao operacional de assinaturas.
- `src/lib/adminLog.ts`: registro de acoes administrativas.

## Fluxo de sessao

1. Admin faz `POST /api/auth/login`.
2. O payload e validado por Zod.
3. O login e limitado por IP+identificador.
4. `autenticarAdmin` procura usuario por e-mail ou CPF.
5. A senha e comparada com bcrypt.
6. O tipo do usuario precisa ser `admin`.
7. Um JWT administrativo e assinado com `JWT_ADMIN_SECRET`.
8. O cookie `controlador_session` e gravado como HttpOnly, SameSite Strict e Secure em producao.
9. `src/proxy.ts` valida o cookie antes de liberar rotas administrativas.
10. APIs tambem chamam `exigirAdminApi` para confirmar a sessao no banco.

## Fluxo de seguranca por requisicao

1. Assets estaticos passam sem consulta de sessao.
2. Mutacoes administrativas validam `Origin`/`Referer`.
3. Rotas publicas permitidas: login e webhook Asaas.
4. Rota `/login` redireciona para `/dashboard` se a sessao ja existir.
5. APIs sem sessao retornam `401` JSON.
6. Paginas sem sessao redirecionam para `/login`.
7. Todas as respostas do proxy recebem headers defensivos.

## Dados sensiveis

O painel pode acessar dados sensiveis de usuarios e assinaturas. Listagens administrativas mascaram e-mail, CPF e telefone quando possivel. Telas de detalhe podem exibir mais contexto operacional; por isso o acesso ao controlador deve ficar restrito a administradores autorizados.

## Testes

Os testes do controlador cobrem:

- APIs de planos;
- webhook Asaas;
- regras de seguranca do proxy/helper.

Comando:

```bash
cd controlador
npm test
```
