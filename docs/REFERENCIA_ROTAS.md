# Referencia de rotas

Inventario gerado a partir de arquivos `route.ts` do Next.js e arquivos de rotas Express do backend.

## controlador/src/app/api/assinaturas/[id]/alterar-status/route.ts

- Linha 79: `export async function POST(request: Request, context: Params) {`
- Linha 83: `export async function PATCH(request: Request, context: Params) {`

## controlador/src/app/api/assinaturas/[id]/reprocessar/route.ts

- Linha 138: `export async function POST(_request: Request, { params }: Params) {`

## controlador/src/app/api/assinaturas/[id]/route.ts

- Linha 10: `export async function GET(_request: Request, { params }: Params) {`

## controlador/src/app/api/assinaturas/route.ts

- Linha 9: `export async function GET(request: NextRequest) {`

## controlador/src/app/api/assinaturas/sincronizar/route.ts

- Linha 13: `export async function POST() {`
- Linha 30: `export async function GET(request: Request) {`

## controlador/src/app/api/auth/login/route.ts

- Linha 78: `export async function POST(request: Request) {`

## controlador/src/app/api/auth/logout/route.ts

- Linha 4: `export async function POST() {`

## controlador/src/app/api/auth/me/route.ts

- Linha 4: `export async function GET() {`

## controlador/src/app/api/dashboard/resumo/route.ts

- Linha 6: `export async function GET() {`

## controlador/src/app/api/email/confirmar-manual/route.ts

- Linha 10: `export async function POST(request: Request) {`

## controlador/src/app/api/email/pendentes/route.ts

- Linha 6: `export async function GET() {`

## controlador/src/app/api/email/reenviar/route.ts

- Linha 11: `export async function POST(request: Request) {`

## controlador/src/app/api/logs/route.ts

- Linha 6: `export async function GET() {`

## controlador/src/app/api/pendencias/route.ts

- Linha 17: `export async function GET() {`

## controlador/src/app/api/planos/[id]/ativar/route.ts

- Linha 9: `export async function PATCH(_request: Request, { params }: Params) {`

## controlador/src/app/api/planos/[id]/desativar/route.ts

- Linha 9: `export async function PATCH(_request: Request, { params }: Params) {`

## controlador/src/app/api/planos/[id]/route.ts

- Linha 10: `export async function GET(_request: Request, { params }: Params) {`
- Linha 28: `export async function PUT(request: Request, { params }: Params) {`

## controlador/src/app/api/planos/route.ts

- Linha 10: `export async function GET(request: NextRequest) {`
- Linha 36: `export async function POST(request: Request) {`

## controlador/src/app/api/prestadores/[id]/assinatura/status/route.ts

- Linha 15: `export async function POST(request: Request, { params }: Params) {`

## controlador/src/app/api/prestadores/[id]/bloquear/route.ts

- Linha 10: `export async function POST(_request: Request, { params }: Params) {`

## controlador/src/app/api/prestadores/[id]/liberar/route.ts

- Linha 11: `export async function POST(_request: Request, { params }: Params) {`

## controlador/src/app/api/prestadores/[id]/route.ts

- Linha 9: `export async function GET(_request: NextRequest, { params }: Params) {`

## controlador/src/app/api/prestadores/route.ts

- Linha 7: `export async function GET(request: NextRequest) {`

## controlador/src/app/api/usuarios/[id]/bloquear/route.ts

- Linha 11: `export async function POST(request: Request, { params }: Params) {`

## controlador/src/app/api/usuarios/[id]/confirmar-email/route.ts

- Linha 9: `export async function POST(_request: Request, { params }: Params) {`

## controlador/src/app/api/usuarios/[id]/liberar/route.ts

- Linha 12: `export async function POST(request: Request, { params }: Params) {`

## controlador/src/app/api/usuarios/[id]/route.ts

- Linha 8: `export async function GET(_request: NextRequest, { params }: Params) {`

## controlador/src/app/api/usuarios/[id]/status-cadastro/route.ts

- Linha 21: `export async function POST(request: Request, { params }: Params) {`

## controlador/src/app/api/usuarios/route.ts

- Linha 25: `export async function GET(request: NextRequest) {`
- Linha 45: `export async function POST(request: NextRequest) {`

## controlador/src/app/api/webhooks/asaas/route.ts

- Linha 12: `export async function POST(request: NextRequest) {`

## server/src/src/route/Route_Agendamento.ts

- Linha 22: `AgendamentoRouter.post(`
- Linha 31: `AgendamentoRouter.patch(`
- Linha 37: `AgendamentoRouter.patch(`
- Linha 45: `AgendamentoRouter.patch(`
- Linha 54: `AgendamentoRouter.patch(`
- Linha 61: `AgendamentoRouter.post(`
- Linha 69: `AgendamentoRouter.get(`
- Linha 76: `AgendamentoRouter.get(`

## server/src/src/route/Route_Assinatura.ts

- Linha 14: `AssinaturaRouter.post(`
- Linha 20: `AssinaturaRouter.get(`
- Linha 26: `AssinaturaRouter.get(`
- Linha 32: `AssinaturaRouter.get(`
- Linha 38: `AssinaturaRouter.post(`
- Linha 46: `AssinaturaRouter.post(`
- Linha 54: `AssinaturaRouter.post(`
- Linha 61: `AssinaturaRouter.post(`

## server/src/src/route/Route_Avaliacao.ts

- Linha 7: `router.post(`
- Linha 13: `router.get(`
- Linha 19: `router.get(`
- Linha 25: `router.get(`
- Linha 31: `router.get(`
- Linha 36: `router.get(`

## server/src/src/route/Route_ConfirmacaoEmail.ts

- Linha 13: `ConfirmacaoEmailRouter.get(`
- Linha 19: `ConfirmacaoEmailRouter.post(`
- Linha 25: `ConfirmacaoEmailRouter.post(`
- Linha 32: `ConfirmacaoEmailRouter.get(`

## server/src/src/route/Route_Crud.ts

- Linha 8: `CrudRouter.use((req, res, next) => {`
- Linha 21: `CrudRouter.use(authMiddleware, permitirTipos(['admin']));`
- Linha 23: `CrudRouter.get('/entities', CrudController.listarEntidades);`
- Linha 24: `CrudRouter.get('/:entity', CrudController.listarTodos);`
- Linha 25: `CrudRouter.get('/:entity/:id', CrudController.buscarPorId);`
- Linha 26: `CrudRouter.get('/:entity/:field/:value', CrudController.buscarPorCampo);`
- Linha 27: `CrudRouter.post('/:entity', CrudController.criarRegistro);`
- Linha 28: `CrudRouter.post('/:entity/many', CrudController.criarMultiplos);`
- Linha 29: `CrudRouter.put('/:entity/:id', CrudController.atualizarRegistro);`
- Linha 30: `CrudRouter.delete('/:entity/:id', CrudController.deletarRegistro);`

## server/src/src/route/Route_Localizacao.ts

- Linha 16: `LocalizacaoRouter.get(`
- Linha 24: `LocalizacaoRouter.get(`
- Linha 32: `LocalizacaoRouter.get(`
- Linha 39: `LocalizacaoRouter.get(`
- Linha 46: `LocalizacaoRouter.get(`
- Linha 53: `LocalizacaoRouter.get(`

## server/src/src/route/Route_Login.ts

- Linha 41: `LoginRouter.post('/login', loginRateLimit, validarEntrada(loginSchema), AuthController.login);`
- Linha 42: `LoginRouter.get('/me', authMiddleware, AuthController.me as any);`
- Linha 43: `LoginRouter.post('/logout', AuthController.logout);`
- Linha 44: `LoginRouter.get(`
- Linha 58: `LoginRouter.get(`
- Linha 72: `LoginRouter.post(`
- Linha 76: `LoginRouter.get(`
- Linha 80: `LoginRouter.post(`
- Linha 86: `LoginRouter.get(`
- Linha 92: `LoginRouter.post(`

## server/src/src/route/Route_Onboarding.ts

- Linha 7: `OnboardingRouter.get(`

## server/src/src/route/Route_Perfil.ts

- Linha 17: `router.get(`
- Linha 23: `router.get(`
- Linha 31: `router.get(`
- Linha 39: `router.get(`
- Linha 48: `router.patch(`
- Linha 54: `router.patch(`

## server/src/src/route/Route_Servico.ts

- Linha 9: `ServicoRouter.get(`
- Linha 16: `ServicoRouter.post(`
- Linha 23: `ServicoRouter.patch(`
- Linha 30: `ServicoRouter.delete(`

## server/src/src/route/Route_Upload.ts

- Linha 49: `UploadRouter.post(`

## server/src/src/route/Route_User.ts

- Linha 18: `UserRouter.post('/usuario', cadastroRateLimit, validarUsuario, UserController.criarUsuario);`
- Linha 19: `UserRouter.get('/usuario/:id', exigirAutenticacao, permitirDonoOuAdmin('id'), UserController.buscarUsuarioCompleto);`
- Linha 20: `UserRouter.put('/usuario/:id', exigirAutenticacao, permitirDonoOuAdmin('id'), UserController.atualizarUsuario);`
- Linha 21: `UserRouter.put('/usuario/:id/senha', exigirAutenticacao, permitirDonoOuAdmin('id'), UserController.atualizarSenha);`
- Linha 22: `UserRouter.delete('/usuario/:id', exigirAutenticacao, permitirDonoOuAdmin('id'), UserController.deletarUsuario);`

## server/src/src/route/index.ts

- Linha 25: `router.use('/create-users', UserRouter);`
- Linha 26: `router.use('/crud', CrudRouter);`
- Linha 27: `router.use('/login', LoginRouter);`
- Linha 28: `router.use('/geolocalizacao', LocalizacaoRouter);`
- Linha 29: `router.use('/agendamentos', AgendamentoRouter);`
- Linha 30: `router.use('/upload', UploadRouter);`
- Linha 31: `router.use('/perfil', PerfilRouter);`
- Linha 32: `router.use('/avaliacoes', AvaliacaoRouter);`
- Linha 33: `router.use('/servicos', ServicoRouter);`
- Linha 34: `router.use('/assinaturas', AssinaturaRouter);`
- Linha 35: `router.use('/email', ConfirmacaoEmailRouter);`
- Linha 36: `router.use('/onboarding', OnboardingRouter);`

