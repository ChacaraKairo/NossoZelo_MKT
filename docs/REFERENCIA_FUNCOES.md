# Referencia de funcoes e handlers

Arquivo gerado para a branch documentada. Ele lista funcoes, metodos, componentes e handlers detectados por varredura estatica simples em `server/src`, `client/src` e `controlador/src`.

Esta referencia nao substitui leitura do codigo, mas serve como mapa completo para auditoria e onboarding.

Total detectado: 634.

## client

### client/src/components/btn/BtnCadastrar.tsx

- Linha 4: `BtnCadastrar` (const function) - `const BtnCadastrar = () => {`
### client/src/components/btn/BtnLogin.tsx

- Linha 5: `LoginButton` (const function) - `const LoginButton = () => {`
### client/src/components/cadastro/StepDocumentos.tsx

- Linha 7: `StepDocumentos` (const function) - `const StepDocumentos = () => {`
### client/src/components/cadastro/StepEndereco.tsx

- Linha 6: `StepEndereco` (const function) - `const StepEndereco = () => {`
### client/src/components/cadastro/StepPessoais.tsx

- Linha 10: `StepPessoais` (const function) - `const StepPessoais = () => {`
### client/src/components/cadastro/StepProfissional.tsx

- Linha 6: `StepProfissional` (const function) - `const StepProfissional = () => {`
### client/src/components/footer/Footer.tsx

- Linha 34: `Footer` (const function) - `const Footer = () => {`
### client/src/components/header/UserDropdown.tsx

- Linha 17: `UserDropdown` (const function) - `const UserDropdown = () => {`
### client/src/components/inicialpage/CardGrid.tsx

- Linha 5: `CardGrid` (const function) - `const CardGrid = () => {`
### client/src/components/inicialpage/Escrita.tsx

- Linha 2: `Escrita` (const function) - `const Escrita = () => {`
### client/src/components/logos/LogoLink.tsx

- Linha 4: `Logo` (const function) - `const Logo = () => {`
### client/src/components/logos/LogoNoLink.tsx

- Linha 2: `Logo` (const function) - `const Logo = () => {`
### client/src/components/logos/OnlyLogo.tsx

- Linha 2: `Logo` (const function) - `const Logo = () => {`
### client/src/components/main-page/filter/Filtro.tsx

- Linha 14: `Filtro` (const function) - `const Filtro = () => {`
### client/src/components/main-page/prestadores-grid/PrestadoresGrid.tsx

- Linha 20: `PrestadoresGrid` (const function) - `const PrestadoresGrid = () => {`
### client/src/components/main-page/prestadores-grid/ResultadosHeader.tsx

- Linha 11: `montarFiltros` (function) - `function montarFiltros({`
### client/src/components/main-page/prestadores-grid/card/UserCard.tsx

- Linha 15: `formatarPreco` (function) - `function formatarPreco(valor?: number) {`
### client/src/components/perfil/AbaAgendaPro.tsx

- Linha 14: `formatarData` (function) - `function formatarData(valor: string | Date) {`
- Linha 25: `formatarHora` (function) - `function formatarHora(valor?: string | Date | null) {`
- Linha 38: `formatarValor` (function) - `function formatarValor(valor?: number | string | null) {`
- Linha 48: `obterObservacao` (function) - `function obterObservacao(item: AgendaPerfil) {`
- Linha 52: `horarioCompleto` (function) - `function horarioCompleto(item: AgendaPerfil) {`
### client/src/components/perfil/AbaAvaliacoesPro.tsx

- Linha 13: `obterAvaliacoes` (function) - `function obterAvaliacoes(perfil: PerfilUsuario) {`
- Linha 21: `formatarData` (function) - `function formatarData(valor?: string | Date | null) {`
- Linha 30: `renderEstrelas` (function) - `function renderEstrelas(nota: number | null) {`
- Linha 42: `obterCliente` (function) - `function obterCliente(avaliacao: AvaliacaoPerfil) {`
### client/src/components/perfil/AbaFinanceiroPro.tsx

- Linha 37: `formatarData` (function) - `function formatarData(valor?: string | Date | null) {`
- Linha 51: `formatarValor` (function) - `function formatarValor(valor?: number | string | null) {`
- Linha 61: `classeStatus` (function) - `function classeStatus(status: string) {`
- Linha 79: `rotuloStatusAssinatura` (function) - `function rotuloStatusAssinatura(status: string) {`
### client/src/components/perfil/AbaHistoricoPerfil.tsx

- Linha 20: `texto` (function) - `function texto(valor: unknown) {`
- Linha 27: `formatarData` (function) - `function formatarData(valor?: string | Date | null) {`
- Linha 34: `formatarHora` (function) - `function formatarHora(valor?: string | Date | null) {`
- Linha 50: `formatarMoeda` (function) - `function formatarMoeda(valor?: string | number | null) {`
- Linha 59: `nomeRelacionado` (function) - `function nomeRelacionado(`
- Linha 76: `servico` (function) - `function servico(contratacao: ContratacaoPerfil) {`
- Linha 86: `statusNormalizado` (function) - `function statusNormalizado(contratacao: ContratacaoPerfil) {`
- Linha 90: `dataHoraFim` (function) - `function dataHoraFim(contratacao: ContratacaoPerfil) {`
- Linha 102: `avaliacaoDoUsuario` (function) - `function avaliacaoDoUsuario(`
- Linha 120: `estadoAvaliacao` (function) - `function estadoAvaliacao(`
- Linha 163: `renderEstrelas` (function) - `function renderEstrelas(`
### client/src/components/perfil/AbaSeguranca.tsx

- Linha 9: `senhaForte` (function) - `function senhaForte(senha: string) {`
### client/src/components/perfil/AbaServicosOperacionais.tsx

- Linha 26: `formatarValor` (function) - `function formatarValor(valor?: number | string | null) {`
- Linha 35: `validarForm` (function) - `function validarForm(form: ServicoPayload) {`
### client/src/components/perfil/AbaSolicitacoesPro.tsx

- Linha 27: `texto` (function) - `function texto(valor: unknown) {`
- Linha 34: `formatarData` (function) - `function formatarData(valor?: string | Date | null) {`
- Linha 41: `formatarHora` (function) - `function formatarHora(valor?: string | Date | null) {`
- Linha 60: `formatarMoeda` (function) - `function formatarMoeda(valor?: number | string | null) {`
- Linha 74: `labelStatus` (function) - `function labelStatus(status?: string | null) {`
- Linha 91: `statusClassName` (function) - `function statusClassName(status?: string | null) {`
- Linha 108: `nomeCliente` (function) - `function nomeCliente(contratacao: ContratacaoPerfil) {`
- Linha 115: `nomeServico` (function) - `function nomeServico(contratacao: ContratacaoPerfil) {`
- Linha 128: `iniciaisCliente` (function) - `function iniciaisCliente(nome: string) {`
### client/src/components/perfil/AlertaPerfilIncompleto.tsx

- Linha 14: `vazio` (function) - `function vazio(valor: unknown) {`
- Linha 19: `calcularCamposAusentes` (function) - `function calcularCamposAusentes(`
### client/src/components/perfil/DadosClienteLiberado.tsx

- Linha 15: `texto` (function) - `function texto(valor?: string | null) {`
### client/src/components/perfil/FormEditarPerfil.tsx

- Linha 29: `valorCampo` (function) - `function valorCampo(valor: unknown) {`
- Linha 35: `CampoTexto` (function) - `function CampoTexto({`
### client/src/components/perfil/ModalPagamentoAssinatura.tsx

- Linha 41: `rotuloAcao` (function) - `function rotuloAcao(modo: ModoModalPagamentoAssinatura) {`
- Linha 47: `rotuloSituacao` (function) - `function rotuloSituacao(status: string) {`
- Linha 64: `mensagemPorStatus` (function) - `function mensagemPorStatus(resultado: RespostaAssinatura) {`
### client/src/components/perfil/PerfilCliente.tsx

- Linha 39: `texto` (function) - `function texto(valor: unknown) {`
- Linha 46: `formatarData` (function) - `function formatarData(valor?: string | Date | null) {`
- Linha 53: `CampoInfo` (function) - `function CampoInfo({ label, valor }: { label: string; valor: unknown }) {`
- Linha 64: `VisaoGeral` (function) - `function VisaoGeral({`
- Linha 88: `DadosPessoais` (function) - `function DadosPessoais({ usuario }: { usuario: PerfilUsuario }) {`
- Linha 102: `MinhasContratacoes` (function) - `function MinhasContratacoes({`
- Linha 143: `AvaliacoesCliente` (function) - `function AvaliacoesCliente({`
### client/src/components/perfil/PerfilHeader.tsx

- Linha 13: `texto` (function) - `function texto(valor: unknown, fallback = 'Não informado') {`
- Linha 21: `inicialNome` (function) - `function inicialNome(nome: string) {`
- Linha 25: `formatarAvaliacao` (function) - `function formatarAvaliacao(valor?: number | string | null) {`
### client/src/components/perfil/PerfilPrestador.tsx

- Linha 51: `texto` (function) - `function texto(valor: unknown) {`
- Linha 61: `CampoInfo` (function) - `function CampoInfo({ label, valor }: { label: string; valor: unknown }) {`
- Linha 93: `AlertaAssinaturaInativa` (function) - `function AlertaAssinaturaInativa({`
- Linha 122: `VisaoGeral` (function) - `function VisaoGeral({`
- Linha 163: `DadosProfissionais` (function) - `function DadosProfissionais({ perfil }: { perfil: PerfilUsuario }) {`
### client/src/components/perfil/PerfilSidebar.tsx

- Linha 8: `PerfilSidebar` (const function) - `const PerfilSidebar = ({ perfil }: { perfil: any }) => {`
### client/src/components/perfil/script/usePerfilEditor.ts

- Linha 6: `usePerfilEditor` (const function) - `export const usePerfilEditor = (`
### client/src/components/prestador/CardPrestador.tsx

- Linha 30: `texto` (function) - `function texto(valor: unknown) {`
- Linha 37: `obterPreco` (function) - `function obterPreco(servicos?: ServicoPerfil[]) {`
### client/src/components/prestador/ModalContratarPrestador.tsx

- Linha 30: `hojeIsoLocal` (function) - `function hojeIsoLocal() {`
- Linha 38: `formatarMoeda` (function) - `function formatarMoeda(valor?: string | number | null) {`
- Linha 48: `texto` (function) - `function texto(valor?: string | number | null) {`
### client/src/config/api.ts

- Linha 3: `getApiUrl` (function) - `export function getApiUrl() {`
- Linha 17: `getNossoZeloApiUrl` (function) - `export function getNossoZeloApiUrl() {`
### client/src/config/contatosNossoZelo.ts

- Linha 36: `criarLinkEmail` (function) - `export function criarLinkEmail(email: string) {`
- Linha 40: `criarLinkTelefone` (function) - `export function criarLinkTelefone(telefone: string) {`
- Linha 44: `criarLinkWhatsApp` (function) - `export function criarLinkWhatsApp(telefone: string) {`
- Linha 48: `obterRedesSociaisAtivas` (function) - `export function obterRedesSociaisAtivas() {`
### client/src/hooks/useGeolocalizacao.ts

- Linha 14: `salvarCoordenadas` (function) - `function salvarCoordenadas(latitude: number, longitude: number) {`
- Linha 28: `useGeolocalizacao` (function) - `export function useGeolocalizacao() {`
### client/src/hooks/useMeuPerfil.ts

- Linha 14: `obterTipoUsuario` (function) - `function obterTipoUsuario(`
- Linha 24: `useMeuPerfil` (function) - `export function useMeuPerfil() {`
### client/src/hooks/useOnboardingGuard.ts

- Linha 23: `useOnboardingGuard` (function) - `export function useOnboardingGuard(ativo = true) {`
### client/src/hooks/usePerfilEditor.ts

- Linha 42: `extrairCamposEditaveis` (function) - `function extrairCamposEditaveis(`
- Linha 69: `montarPayloadAlterado` (function) - `function montarPayloadAlterado(`
- Linha 91: `usePerfilEditor` (function) - `export function usePerfilEditor() {`
### client/src/pages/auth/social-callback.tsx

- Linha 9: `destinoPorTipo` (function) - `function destinoPorTipo(tipo: string) {`
### client/src/pages/cadastro-prestador/index.tsx

- Linha 25: `WizardCadastroPrestador` (const function) - `const WizardCadastroPrestador = () => {`
### client/src/pages/cadastro-social/index.tsx

- Linha 35: `decodificarToken` (function) - `function decodificarToken(token?: string): SocialPayload | null {`
- Linha 56: `limparDigitos` (function) - `function limparDigitos(valor: string) {`
- Linha 60: `destinoPorTipo` (function) - `function destinoPorTipo(tipo: string) {`
### client/src/pages/cadastro-user/index.tsx

- Linha 43: `CadastroPage` (const function) - `const CadastroPage = () => {`
### client/src/pages/dashboard/index.tsx

- Linha 20: `CardResumo` (function) - `function CardResumo({`
- Linha 35: `ListaContratacoes` (function) - `function ListaContratacoes({`
- Linha 68: `DashboardPage` (function) - `function DashboardPage() {`
### client/src/pages/login-parceiro/index.tsx

- Linha 20: `LoginPage` (const function) - `const LoginPage = () => {`
### client/src/pages/login-user/index.tsx

- Linha 21: `LoginPage` (const function) - `const LoginPage = () => {`
### client/src/pages/meu-perfil/index.tsx

- Linha 20: `normalizarTipoUsuario` (function) - `function normalizarTipoUsuario(`
- Linha 38: `normalizarPerfilDashboard` (function) - `function normalizarPerfilDashboard(dados: any): PerfilCompleto {`
- Linha 94: `DashboardPerfil` (const function) - `const DashboardPerfil = () => {`
### client/src/pages/onboarding/prestador.tsx

- Linha 23: `moeda` (function) - `function moeda(valor: number | string) {`
- Linha 30: `boolTexto` (function) - `function boolTexto(valor: boolean) {`
### client/src/pages/perfil/index.tsx

- Linha 18: `AlertaEmailNaoConfirmado` (function) - `function AlertaEmailNaoConfirmado({`
- Linha 57: `LoadingPerfil` (function) - `function LoadingPerfil() {`
- Linha 69: `PerfilPage` (function) - `function PerfilPage() {`
### client/src/pages/prestador/[id].tsx

- Linha 28: `normalizarId` (function) - `function normalizarId(id: string | string[] | undefined) {`
- Linha 33: `formatarTexto` (function) - `function formatarTexto(valor?: string | number | null) {`
- Linha 41: `formatarMoeda` (function) - `function formatarMoeda(valor?: string | number | null) {`
- Linha 55: `formatarData` (function) - `function formatarData(valor?: string | Date | null) {`
- Linha 64: `obterAvaliacoes` (function) - `function obterAvaliacoes(prestador: VitrinePrestador | null) {`
- Linha 86: `obterEspecialidades` (function) - `function obterEspecialidades(`
### client/src/pages/prestadores/index.tsx

- Linha 15: `queryString` (function) - `function queryString(valor: string | string[] | undefined) {`
- Linha 19: `PrestadoresPage` (const function) - `const PrestadoresPage = () => {`
### client/src/pages/redefinir-senha/index.tsx

- Linha 8: `validarSenha` (function) - `function validarSenha(senha: string) {`
### client/src/service/Login.ts

- Linha 33: `mascararIdentificador` (function) - `function mascararIdentificador(identificador: string) {`
- Linha 48: `armazenarUsuarioSessao` (function) - `function armazenarUsuarioSessao(responseData: LoginResponse) {`
### client/src/service/acharPrestadoresService.ts

- Linha 19: `normalizarNumero` (function) - `function normalizarNumero(valor: unknown): number | undefined {`
- Linha 25: `obterCoordenadaSalva` (function) - `function obterCoordenadaSalva(chave: 'latitude' | 'longitude') {`
- Linha 38: `formatarTipo` (function) - `function formatarTipo(tipo?: string | null) {`
- Linha 43: `montarLocalidade` (function) - `function montarLocalidade(prestador: any): string {`
- Linha 69: `mapearPrestador` (function) - `function mapearPrestador(prestador: any): PrestadorCardData {`
- Linha 108: `buscarPrestadores` (const function) - `export const buscarPrestadores = async (`
### client/src/service/api.ts

- Linha 18: `extrairErroApi` (function) - `export function extrairErroApi(error: unknown) {`
### client/src/service/avaliacaoService.ts

- Linha 34: `logarErro` (function) - `function logarErro(endpoint: string, error: unknown) {`
### client/src/service/cadastroService.ts

- Linha 89: `cadastrarUsuario` (const function) - `export const cadastrarUsuario = async (`
### client/src/service/contratacaoService.ts

- Linha 55: `criarErroRotaInexistente` (function) - `function criarErroRotaInexistente(mensagem: string) {`
- Linha 59: `logarEndpoint` (function) - `function logarEndpoint(endpoint: string, dados?: unknown) {`
- Linha 66: `logarResposta` (function) - `function logarResposta(endpoint: string, status: number) {`
- Linha 73: `logarErro` (function) - `function logarErro(endpoint: string, error: unknown) {`
### client/src/service/perfilService.ts

- Linha 20: `logarErro` (function) - `function logarErro(endpoint: string, error: unknown) {`
### client/src/service/servicoService.ts

- Linha 15: `logarErro` (function) - `function logarErro(endpoint: string, error: unknown) {`
### client/src/store/useCadastroPrestadorStore.ts

- Linha 109: `limparErrosCampos` (function) - `function limparErrosCampos(`
### client/src/store/useFinalizarCadastro.ts

- Linha 10: `useFinalizarCadastro` (const function) - `export const useFinalizarCadastro = () => {`
### client/src/utils/auth.ts

- Linha 24: `getToken` (const function) - `export const getToken = (): string | undefined => {`
- Linha 30: `logout` (const function) - `export const logout = (silent: boolean = false) => {`
- Linha 59: `getUsuarioDoCookie` (const function) - `export const getUsuarioDoCookie = (): UsuarioDecodificado | null => {`
### client/src/utils/logger.ts

- Linha 19: `nivelHabilitado` (function) - `function nivelHabilitado(nivel: Nivel) {`
- Linha 23: `mascararTexto` (function) - `function mascararTexto(valor: string) {`
- Linha 30: `sanitizar` (function) - `function sanitizar(dados: LogData): LogData {`
- Linha 54: `formatarMensagem` (function) - `function formatarMensagem(`
- Linha 63: `info` (method) - `info(contexto: string, mensagem: string, dados?: LogData) {`
- Linha 71: `warn` (method) - `warn(contexto: string, mensagem: string, dados?: LogData) {`
- Linha 79: `error` (method) - `error(contexto: string, mensagem: string, erro?: LogData) {`
- Linha 87: `debug` (method) - `debug(contexto: string, mensagem: string, dados?: LogData) {`
### client/src/utils/masks.ts

- Linha 10: `clean` (const function) - `const clean = (v: string) => v.replace(/\D/g, '');`
- Linha 12: `mascaraCpf` (const function) - `export const mascaraCpf = (v: string) => {`
- Linha 20: `mascaraCnpj` (const function) - `export const mascaraCnpj = (v: string) => {`
- Linha 29: `mascaraTelefone` (const function) - `export const mascaraTelefone = (v: string) => {`
- Linha 41: `mascaraCep` (const function) - `export const mascaraCep = (v: string) => {`
- Linha 46: `mascaraNumero` (const function) - `export const mascaraNumero = (v: string) => {`
- Linha 50: `mascaraUf` (const function) - `export const mascaraUf = (v: string) => {`
### client/src/utils/tratarErroApi.ts

- Linha 3: `extrairMensagemErro` (function) - `export function extrairMensagemErro(error: unknown): string {`
### client/src/utils/validators.ts

- Linha 10: `cpfValido` (const function) - `export const cpfValido = (v: string): boolean => {`
- Linha 33: `cnpjValido` (const function) - `export const cnpjValido = (v: string): boolean => {`
- Linha 135: `telefoneValido` (const function) - `export const telefoneValido = (v: string): boolean => {`
- Linha 161: `cepValido` (const function) - `export const cepValido = (v: string): boolean => {`
- Linha 169: `emailValido` (const function) - `export const emailValido = (v: string): boolean => {`
- Linha 179: `senhaValida` (const function) - `export const senhaValida = (v: string): boolean => {`
### client/src/utils/withAuth.ts

- Linha 18: `withAuth` (function) - `export function withAuth<P extends object>(`
### client/src/validation/cadastroValidation.ts

- Linha 56: `somenteDigitos` (function) - `function somenteDigitos(valor: string) {`
- Linha 60: `textoObrigatorio` (function) - `function textoObrigatorio(`
- Linha 71: `validarNomeCampo` (function) - `function validarNomeCampo(`
- Linha 93: `validarDataNascimento` (function) - `function validarDataNascimento(`
- Linha 128: `validarSenhaForte` (function) - `export function validarSenhaForte(senha: string) {`
- Linha 139: `mensagemSenhaForte` (function) - `export function mensagemSenhaForte() {`
- Linha 161: `validarCadastroUsuario` (function) - `export function validarCadastroUsuario(`
- Linha 219: `validarDadosPessoaisPrestador` (function) - `export function validarDadosPessoaisPrestador(`
- Linha 266: `validarEnderecoCadastro` (function) - `export function validarEnderecoCadastro(`
- Linha 333: `validarDadosProfissionaisPrestador` (function) - `export function validarDadosProfissionaisPrestador(`
- Linha 407: `validarArquivo` (function) - `function validarArquivo(`
- Linha 431: `validarDocumentosPrestador` (function) - `export function validarDocumentosPrestador(`

## controlador

### controlador/src/app/(admin)/assinaturas/[id]/page.tsx

- Linha 11: `data` (function) - `function data(valor?: Date | string | null) {`
- Linha 16: `texto` (function) - `function texto(valor?: string | number | null) {`
- Linha 20: `moeda` (function) - `function moeda(valor?: number | string | { toString(): string } | null) {`
### controlador/src/app/(admin)/logs/page.tsx

- Linha 15: `formatarData` (function) - `function formatarData(data?: Date | null) {`
- Linha 19: `resumoPayload` (function) - `function resumoPayload(payload: Prisma.JsonValue) {`
### controlador/src/app/(admin)/planos/page.tsx

- Linha 15: `moeda` (function) - `function moeda(valor: Prisma.Decimal | number | string) {`
### controlador/src/app/(admin)/relatorios/inadimplencia/page.tsx

- Linha 9: `data` (function) - `function data(valor?: Date | null) {`
- Linha 14: `moeda` (function) - `function moeda(valor?: number | string | { toString(): string } | null) {`
### controlador/src/app/api/assinaturas/[id]/alterar-status/route.ts

- Linha 15: `hashPayload` (function) - `function hashPayload(valor: unknown) {`
- Linha 21: `alterarStatus` (function) - `async function alterarStatus(request: Request, { params }: Params) {`
- Linha 79: `POST` (function) - `export async function POST(request: Request, context: Params) {`
- Linha 83: `PATCH` (function) - `export async function PATCH(request: Request, context: Params) {`
### controlador/src/app/api/assinaturas/[id]/reprocessar/route.ts

- Linha 12: `jsonEstavel` (function) - `function jsonEstavel(valor: unknown): string {`
- Linha 18: `hashPayload` (function) - `function hashPayload(valor: unknown) {`
- Linha 22: `statusLocalPorStatusAsaas` (function) - `function statusLocalPorStatusAsaas(status?: string | null) {`
- Linha 31: `dataAsaas` (function) - `function dataAsaas(valor?: string | null) {`
- Linha 37: `adicionarDias` (function) - `function adicionarDias(data: Date, dias: number) {`
- Linha 43: `statusPagamentoRecebido` (function) - `function statusPagamentoRecebido(status?: string | null) {`
- Linha 48: `consultarAssinaturaAsaas` (function) - `async function consultarAssinaturaAsaas(gatewaySubscriptionId?: string | null) {`
- Linha 80: `consultarPagamentoRecebidoAsaas` (function) - `async function consultarPagamentoRecebidoAsaas(gatewaySubscriptionId?: string | null) {`
- Linha 138: `POST` (function) - `export async function POST(_request: Request, { params }: Params) {`
### controlador/src/app/api/assinaturas/[id]/route.ts

- Linha 10: `GET` (function) - `export async function GET(_request: Request, { params }: Params) {`
### controlador/src/app/api/assinaturas/route.ts

- Linha 9: `GET` (function) - `export async function GET(request: NextRequest) {`
### controlador/src/app/api/assinaturas/sincronizar/route.ts

- Linha 7: `cronAutorizado` (function) - `function cronAutorizado(request: Request) {`
- Linha 13: `POST` (function) - `export async function POST() {`
- Linha 30: `GET` (function) - `export async function GET(request: Request) {`
### controlador/src/app/api/auth/login/route.ts

- Linha 19: `chaveRateLimit` (function) - `function chaveRateLimit(request: Request, login?: string) {`
- Linha 29: `bloquearPorRateLimit` (function) - `function bloquearPorRateLimit(request: Request, login?: string) {`
- Linha 53: `registrarFalhaLogin` (function) - `function registrarFalhaLogin(request: Request, login?: string) {`
- Linha 70: `limparFalhasLogin` (function) - `function limparFalhasLogin(request: Request, login?: string) {`
- Linha 78: `POST` (function) - `export async function POST(request: Request) {`
### controlador/src/app/api/auth/logout/route.ts

- Linha 4: `POST` (function) - `export async function POST() {`
### controlador/src/app/api/auth/me/route.ts

- Linha 4: `GET` (function) - `export async function GET() {`
### controlador/src/app/api/dashboard/resumo/route.ts

- Linha 6: `GET` (function) - `export async function GET() {`
### controlador/src/app/api/email/confirmar-manual/route.ts

- Linha 10: `POST` (function) - `export async function POST(request: Request) {`
### controlador/src/app/api/email/pendentes/route.ts

- Linha 6: `GET` (function) - `export async function GET() {`
### controlador/src/app/api/email/reenviar/route.ts

- Linha 11: `POST` (function) - `export async function POST(request: Request) {`
### controlador/src/app/api/logs/route.ts

- Linha 6: `GET` (function) - `export async function GET() {`
### controlador/src/app/api/pendencias/route.ts

- Linha 8: `mascararUsuario` (function) - `function mascararUsuario<T extends { email: string; cpf: string; telefone: string | null }>(usuario: T) {`
- Linha 17: `GET` (function) - `export async function GET() {`
### controlador/src/app/api/planos/[id]/ativar/route.ts

- Linha 9: `PATCH` (function) - `export async function PATCH(_request: Request, { params }: Params) {`
### controlador/src/app/api/planos/[id]/desativar/route.ts

- Linha 9: `PATCH` (function) - `export async function PATCH(_request: Request, { params }: Params) {`
### controlador/src/app/api/planos/[id]/route.ts

- Linha 10: `GET` (function) - `export async function GET(_request: Request, { params }: Params) {`
- Linha 28: `PUT` (function) - `export async function PUT(request: Request, { params }: Params) {`
### controlador/src/app/api/planos/planos-api.test.ts

- Linha 20: `requestJson` (function) - `function requestJson(body: unknown) {`
### controlador/src/app/api/planos/route.ts

- Linha 10: `GET` (function) - `export async function GET(request: NextRequest) {`
- Linha 36: `POST` (function) - `export async function POST(request: Request) {`
### controlador/src/app/api/prestadores/[id]/assinatura/status/route.ts

- Linha 15: `POST` (function) - `export async function POST(request: Request, { params }: Params) {`
### controlador/src/app/api/prestadores/[id]/bloquear/route.ts

- Linha 10: `POST` (function) - `export async function POST(_request: Request, { params }: Params) {`
### controlador/src/app/api/prestadores/[id]/liberar/route.ts

- Linha 11: `POST` (function) - `export async function POST(_request: Request, { params }: Params) {`
### controlador/src/app/api/prestadores/[id]/route.ts

- Linha 9: `GET` (function) - `export async function GET(_request: NextRequest, { params }: Params) {`
### controlador/src/app/api/prestadores/route.ts

- Linha 7: `GET` (function) - `export async function GET(request: NextRequest) {`
### controlador/src/app/api/usuarios/[id]/bloquear/route.ts

- Linha 11: `POST` (function) - `export async function POST(request: Request, { params }: Params) {`
### controlador/src/app/api/usuarios/[id]/confirmar-email/route.ts

- Linha 9: `POST` (function) - `export async function POST(_request: Request, { params }: Params) {`
### controlador/src/app/api/usuarios/[id]/liberar/route.ts

- Linha 12: `POST` (function) - `export async function POST(request: Request, { params }: Params) {`
### controlador/src/app/api/usuarios/[id]/route.ts

- Linha 8: `GET` (function) - `export async function GET(_request: NextRequest, { params }: Params) {`
### controlador/src/app/api/usuarios/[id]/status-cadastro/route.ts

- Linha 21: `POST` (function) - `export async function POST(request: Request, { params }: Params) {`
### controlador/src/app/api/usuarios/route.ts

- Linha 21: `gerarIdAdmin` (function) - `function gerarIdAdmin() {`
- Linha 25: `GET` (function) - `export async function GET(request: NextRequest) {`
- Linha 45: `POST` (function) - `export async function POST(request: NextRequest) {`
### controlador/src/app/api/webhooks/asaas/route.ts

- Linha 4: `statusErro` (function) - `function statusErro(error: unknown) {`
- Linha 12: `POST` (function) - `export async function POST(request: NextRequest) {`
### controlador/src/components/AdminActionButton.tsx

- Linha 15: `AdminActionButton` (function) - `export function AdminActionButton({`
### controlador/src/components/AdminCreateForm.tsx

- Linha 9: `AdminCreateForm` (function) - `export function AdminCreateForm() {`
### controlador/src/components/AdminLayout.tsx

- Linha 12: `AdminLayout` (function) - `export function AdminLayout({ admin, children }: AdminLayoutProps) {`
### controlador/src/components/AssinaturaAdminActions.tsx

- Linha 23: `AssinaturaAdminActions` (function) - `export function AssinaturaAdminActions({ id, statusAtual }: AssinaturaAdminActionsProps) {`
### controlador/src/components/BadgeStatus.tsx

- Linha 7: `classeStatus` (function) - `function classeStatus(status?: string | null | boolean) {`
- Linha 23: `BadgeStatus` (function) - `export function BadgeStatus({ status }: BadgeStatusProps) {`
### controlador/src/components/ConfirmDialog.tsx

- Linha 10: `ConfirmDialog` (function) - `export function ConfirmDialog({ message, children }: ConfirmDialogProps) {`
### controlador/src/components/DataTable.tsx

- Linha 9: `DataTable` (function) - `export function DataTable({ headers, children }: DataTableProps) {`
### controlador/src/components/EmptyState.tsx

- Linha 3: `EmptyState` (function) - `export function EmptyState({ message = "Nenhum registro encontrado." }: { message?: string }) {`
### controlador/src/components/ErrorState.tsx

- Linha 3: `ErrorState` (function) - `export function ErrorState({ message = "Nao foi possivel carregar os dados." }: { message?: string }) {`
### controlador/src/components/FilterSelect.tsx

- Linha 10: `FilterSelect` (function) - `export function FilterSelect({ name, defaultValue, label, options }: FilterSelectProps) {`
### controlador/src/components/Header.tsx

- Linha 13: `Header` (function) - `export function Header({ nome, email }: HeaderProps) {`
### controlador/src/components/LoadingState.tsx

- Linha 3: `LoadingState` (function) - `export function LoadingState() {`
### controlador/src/components/Pagination.tsx

- Linha 12: `Pagination` (function) - `export function Pagination({ page, total, limit, basePath, query = {} }: PaginationProps) {`
### controlador/src/components/PlanoForm.tsx

- Linha 20: `PlanoForm` (function) - `export function PlanoForm({ modo, plano }: PlanoFormProps) {`
### controlador/src/components/PlanoStatusButton.tsx

- Linha 12: `PlanoStatusButton` (function) - `export function PlanoStatusButton({ id, ativo }: PlanoStatusButtonProps) {`
### controlador/src/components/SearchInput.tsx

- Linha 9: `SearchInput` (function) - `export function SearchInput({ name = "busca", defaultValue, placeholder = "Buscar" }: SearchInputProps) {`
### controlador/src/components/Sidebar.tsx

- Linha 33: `Sidebar` (function) - `export function Sidebar() {`
### controlador/src/components/StatCard.tsx

- Linha 8: `StatCard` (function) - `export function StatCard({ label, value }: StatCardProps) {`
### controlador/src/lib/adminLog.ts

- Linha 10: `registrarLogAdministrativo` (function) - `export async function registrarLogAdministrativo({`
### controlador/src/lib/asaasConfig.ts

- Linha 8: `ambienteAsaas` (function) - `function ambienteAsaas(): AmbienteAsaas {`
- Linha 27: `validarCompatibilidadeBaseUrl` (function) - `function validarCompatibilidadeBaseUrl(ambiente: AmbienteAsaas, baseUrl: string) {`
- Linha 45: `obterBaseUrlAsaas` (function) - `export function obterBaseUrlAsaas() {`
### controlador/src/lib/asaasWebhook.ts

- Linha 41: `erroWebhook` (function) - `function erroWebhook(message: string, status = 400) {`
- Linha 47: `tokenWebhookAsaasForte` (function) - `function tokenWebhookAsaasForte(token?: string | null) {`
- Linha 62: `validarToken` (function) - `function validarToken(token?: string | null) {`
- Linha 74: `payloadAsaas` (function) - `function payloadAsaas(payload: unknown): AsaasWebhookPayload {`
- Linha 82: `adicionarDias` (function) - `function adicionarDias(data: Date, dias: number) {`
- Linha 88: `dataAsaas` (function) - `function dataAsaas(valor?: string | null) {`
- Linha 95: `numeroAsaas` (function) - `function numeroAsaas(valor?: number | string | null) {`
- Linha 102: `limitar` (function) - `function limitar(valor: string, tamanho: number) {`
- Linha 106: `jsonEstavel` (function) - `function jsonEstavel(valor: unknown): string {`
- Linha 112: `hashPayload` (function) - `function hashPayload(valor: unknown) {`
- Linha 116: `idEventoAsaas` (function) - `function idEventoAsaas(payload: AsaasWebhookPayload, subscriptionId?: string) {`
- Linha 131: `statusAssinaturaPorEventoAsaas` (function) - `function statusAssinaturaPorEventoAsaas(`
- Linha 190: `localizarAssinatura` (function) - `async function localizarAssinatura(subscriptionId?: string) {`
- Linha 202: `processarWebhookAsaasControlador` (function) - `export async function processarWebhookAsaasControlador(input: AsaasWebhookInput) {`
### controlador/src/lib/assinaturaMonitor.ts

- Linha 8: `statusInativo` (function) - `function statusInativo(status: StatusCadastro) {`
- Linha 22: `sincronizarAssinaturasEPrestadores` (function) - `export async function sincronizarAssinaturasEPrestadores(): Promise<ResultadoSincronizacaoAssinaturas> {`
### controlador/src/lib/auth.ts

- Linha 15: `adminEhMestre` (function) - `export function adminEhMestre(admin: AdminSession | null | undefined) {`
- Linha 27: `autenticarAdmin` (function) - `export async function autenticarAdmin(login: string, senha: string) {`
- Linha 57: `obterSessaoAdmin` (function) - `export async function obterSessaoAdmin(): Promise<AdminSession | null> {`
- Linha 80: `exigirAdminPagina` (function) - `export async function exigirAdminPagina() {`
- Linha 89: `exigirAdminApi` (function) - `export async function exigirAdminApi() {`
- Linha 103: `aplicarCookieSessao` (function) - `export function aplicarCookieSessao(response: NextResponse, token: string) {`
- Linha 116: `limparCookieSessao` (function) - `export function limparCookieSessao(response: NextResponse) {`
### controlador/src/lib/financeiro.ts

- Linha 3: `statusCadastroPorAssinatura` (function) - `export function statusCadastroPorAssinatura(status: assinaturas_status): usuarios_status_cadastro {`
### controlador/src/lib/http.ts

- Linha 4: `respostaErro` (function) - `export function respostaErro(error: unknown, fallback = "Erro inesperado.", status = 500) {`
### controlador/src/lib/liberacaoUsuario.ts

- Linha 4: `liberarUsuarioOperacional` (function) - `export async function liberarUsuarioOperacional(tx: Prisma.TransactionClient, usuarioId: string) {`
### controlador/src/lib/planoSchemas.ts

- Linha 22: `dadosPlano` (function) - `export function dadosPlano(input: PlanoPayload) {`
### controlador/src/lib/queries.ts

- Linha 21: `obterResumoDashboard` (function) - `export async function obterResumoDashboard() {`
- Linha 75: `filtrosUsuarios` (function) - `export function filtrosUsuarios(searchParams: URLSearchParams) {`
- Linha 97: `listarUsuarios` (function) - `export async function listarUsuarios(searchParams: URLSearchParams) {`
- Linha 127: `listarPrestadores` (function) - `export async function listarPrestadores(searchParams: URLSearchParams) {`
### controlador/src/lib/sanitize.ts

- Linha 1: `mascararEmail` (function) - `export function mascararEmail(email?: string | null) {`
- Linha 9: `mascararDocumento` (function) - `export function mascararDocumento(documento?: string | null) {`
- Linha 16: `mascararTelefone` (function) - `export function mascararTelefone(telefone?: string | null) {`
- Linha 23: `normalizarBusca` (function) - `export function normalizarBusca(valor: string | null) {`
- Linha 28: `paginaAtual` (function) - `export function paginaAtual(valor: string | null) {`
- Linha 33: `limitePagina` (function) - `export function limitePagina(valor: string | null) {`
### controlador/src/lib/security.test.ts

- Linha 9: `request` (function) - `function request(url: string, init?: RequestInit) {`
### controlador/src/lib/security.ts

- Linha 12: `normalizarOrigem` (function) - `function normalizarOrigem(valor?: string | null) {`
- Linha 27: `origensConfiguradas` (function) - `function origensConfiguradas(request: NextRequest) {`
- Linha 48: `isAsset` (function) - `export function isAsset(pathname: string) {`
- Linha 60: `isRotaPublica` (function) - `export function isRotaPublica(pathname: string) {`
- Linha 68: `exigeProtecaoCsrf` (function) - `export function exigeProtecaoCsrf(pathname: string, method: string) {`
- Linha 77: `origemPermitida` (function) - `export function origemPermitida(request: NextRequest) {`
- Linha 92: `aplicarHeadersSeguranca` (function) - `export function aplicarHeadersSeguranca(response: NextResponse) {`
- Linha 106: `bloquearOrigemInvalida` (function) - `export function bloquearOrigemInvalida() {`
### controlador/src/lib/sessionToken.ts

- Linha 14: `getJwtSecret` (function) - `function getJwtSecret() {`
- Linha 22: `gerarTokenAdmin` (function) - `export async function gerarTokenAdmin(payload: AdminTokenPayload) {`
- Linha 31: `validarTokenAdmin` (function) - `export async function validarTokenAdmin(token?: string): Promise<AdminTokenPayload | null> {`
### controlador/src/proxy.ts

- Linha 12: `proxy` (function) - `export async function proxy(request: NextRequest) {`

## server

### server/src/main.ts

- Linha 19: `validarAmbiente` (function) - `function validarAmbiente() {`
- Linha 99: `allowedOrigins` (const function) - `const allowedOrigins = (`
- Linha 111: `origin` (method) - `origin(origin, callback) {`
### server/src/server.ts

- Linha 33: `shouldRunAivenKeepAlive` (function) - `function shouldRunAivenKeepAlive() {`
- Linha 51: `triggerDatabasePing` (function) - `async function triggerDatabasePing() {`
- Linha 69: `testDatabaseConnection` (function) - `async function testDatabaseConnection() {`
- Linha 85: `startKeepAlive` (function) - `function startKeepAlive(runDatabasePing: boolean) {`
- Linha 106: `bootstrap` (function) - `async function bootstrap() {`
### server/src/src/__tests__/avaliacao-cancelamento.test.ts

- Linha 35: `dataServico` (function) - `function dataServico(data: string, horaFim = '12:00') {`
### server/src/src/__tests__/produto-critico.test.ts

- Linha 136: `appComRotasPublicas` (function) - `function appComRotasPublicas() {`
- Linha 145: `appComRotasProtegidas` (function) - `function appComRotasProtegidas() {`
- Linha 158: `tokenTeste` (function) - `function tokenTeste(payload: Record<string, unknown>) {`
### server/src/src/__tests__/rate-limit.test.ts

- Linha 6: `appComRateLimit` (function) - `function appComRateLimit(nome: string) {`
### server/src/src/__tests__/upload-seguro.test.ts

- Linha 32: `appUpload` (function) - `function appUpload() {`
- Linha 38: `pdfTeste` (function) - `function pdfTeste(): Express.Multer.File {`
### server/src/src/__tests__/validacao-entrada.test.ts

- Linha 11: `appComValidacao` (function) - `function appComValidacao(schema: Parameters<typeof validarEntrada>[0]) {`
### server/src/src/controller/Controller_Agendamentos.ts

- Linha 5: `statusErro` (function) - `function statusErro(error: any) {`
- Linha 9: `mensagemErro` (function) - `function mensagemErro(error: any) {`
- Linha 14: `criar` (method) - `static async criar(req: AuthRequest, res: Response) {`
- Linha 36: `aceitar` (method) - `static async aceitar(req: AuthRequest, res: Response) {`
- Linha 58: `cancelar` (method) - `static async cancelar(req: AuthRequest, res: Response) {`
- Linha 81: `naoRealizado` (method) - `static async naoRealizado(req: AuthRequest, res: Response) {`
- Linha 104: `finalizar` (method) - `static async finalizar(req: AuthRequest, res: Response) {`
- Linha 126: `registroManual` (method) - `static async registroManual(req: AuthRequest, res: Response) {`
- Linha 147: `listarPorTempo` (method) - `static async listarPorTempo(req: AuthRequest, res: Response) {`
- Linha 173: `listarPorCliente` (method) - `static async listarPorCliente(req: AuthRequest, res: Response) {`
### server/src/src/controller/Controller_Assinatura.ts

- Linha 5: `statusErro` (function) - `function statusErro(error: any) {`
- Linha 9: `planoIdDoBody` (function) - `function planoIdDoBody(body: any) {`
- Linha 22: `dadosPagamentoDoBody` (function) - `function dadosPagamentoDoBody(body: any, req: Request) {`
- Linha 48: `webhookAsaas` (method) - `async webhookAsaas(req: Request, res: Response) {`
- Linha 66: `minha` (method) - `async minha(req: AuthRequest, res: Response) {`
- Linha 82: `planos` (method) - `async planos(_req: Request, res: Response) {`
- Linha 93: `status` (method) - `async status(req: AuthRequest, res: Response) {`
- Linha 117: `iniciar` (method) - `async iniciar(req: AuthRequest, res: Response) {`
- Linha 140: `regularizar` (method) - `async regularizar(req: AuthRequest, res: Response) {`
- Linha 163: `cancelar` (method) - `async cancelar(req: AuthRequest, res: Response) {`
- Linha 188: `expirarPendentes` (method) - `async expirarPendentes(req: AuthRequest, res: Response) {`
### server/src/src/controller/Controller_Avaliacao.ts

- Linha 5: `statusErro` (function) - `function statusErro(error: any) {`
- Linha 9: `mensagemErro` (function) - `function mensagemErro(error: any) {`
- Linha 14: `registrar` (method) - `static async registrar(req: AuthRequest, res: Response) {`
- Linha 35: `disponibilidade` (method) - `static async disponibilidade(req: AuthRequest, res: Response) {`
- Linha 57: `minhasPendentes` (method) - `static async minhasPendentes(req: AuthRequest, res: Response) {`
- Linha 74: `listarPorPrestador` (method) - `static async listarPorPrestador(req: Request, res: Response) {`
- Linha 85: `listarPorCliente` (method) - `static async listarPorCliente(req: Request, res: Response) {`
### server/src/src/controller/Controller_ConfirmacaoEmail.ts

- Linha 6: `statusErro` (function) - `function statusErro(error: any) {`
- Linha 11: `confirmar` (method) - `async confirmar(req: Request, res: Response) {`
- Linha 32: `reenviar` (method) - `async reenviar(req: AuthRequest, res: Response) {`
- Linha 54: `status` (method) - `async status(req: AuthRequest, res: Response) {`
### server/src/src/controller/Controller_Crud.ts

- Linha 18: `getErrorMessage` (function) - `function getErrorMessage(error: unknown): string {`
- Linha 24: `statusErroCrud` (function) - `function statusErroCrud(msg: string) {`
- Linha 28: `validarEntidade` (function) - `function validarEntidade(req: Request) {`
- Linha 53: `listarTodos` (method) - `static async listarTodos(req: Request, res: Response) {`
- Linha 65: `buscarPorId` (method) - `static async buscarPorId(req: Request, res: Response) {`
- Linha 86: `buscarPorCampo` (method) - `static async buscarPorCampo(req: Request, res: Response) {`
- Linha 102: `criarRegistro` (method) - `static async criarRegistro(req: Request, res: Response) {`
- Linha 118: `criarMultiplos` (method) - `static async criarMultiplos(req: Request, res: Response) {`
### server/src/src/controller/Controller_Localizacao.ts

- Linha 14: `normalizarParaJson` (function) - `function normalizarParaJson(valor: unknown): unknown {`
### server/src/src/controller/Controller_Login.ts

- Linha 16: `erroAutenticacao` (function) - `function erroAutenticacao(mensagem: string) {`
- Linha 25: `iniciarSocial` (method) - `static iniciarSocial(provider: 'google' | 'facebook') {`
- Linha 48: `callbackSocial` (method) - `static callbackSocial(provider: 'google' | 'facebook') {`
- Linha 92: `completarCadastroSocial` (method) - `static async completarCadastroSocial(req: Request, res: Response) {`
- Linha 116: `login` (method) - `static async login(req: Request, res: Response) {`
- Linha 155: `me` (method) - `static async me(req: AuthRequest, res: Response) {`
- Linha 172: `logout` (method) - `static logout(_req: Request, res: Response) {`
- Linha 178: `cadastroSocialPendente` (method) - `static async cadastroSocialPendente(req: Request, res: Response) {`
### server/src/src/controller/Controller_Onboarding.ts

- Linha 5: `statusErro` (function) - `function statusErro(error: any) {`
- Linha 10: `status` (method) - `async status(req: AuthRequest, res: Response) {`
### server/src/src/controller/Controller_Perfil.ts

- Linha 22: `removerCamposProtegidos` (function) - `function removerCamposProtegidos(dados: any) {`
- Linha 32: `statusErroPerfil` (function) - `function statusErroPerfil(error: any) {`
- Linha 72: `alterarSenha` (method) - `async alterarSenha(req: AuthRequest, res: Response) {`
- Linha 99: `obterMeuPerfil` (method) - `async obterMeuPerfil(req: AuthRequest, res: Response) {    try {`
- Linha 130: `obterResumoPerfil` (method) - `async obterResumoPerfil(req: AuthRequest, res: Response) {    try {`
- Linha 206: `vitrinePrestador` (method) - `async vitrinePrestador(req: Request, res: Response) {`
### server/src/src/controller/Controller_RecuperacaoSenha.ts

- Linha 4: `statusErro` (function) - `function statusErro(error: any) {`
- Linha 9: `enviarEmail` (method) - `static async enviarEmail(req: Request, res: Response) {`
- Linha 22: `validarToken` (method) - `static async validarToken(req: Request, res: Response) {`
- Linha 37: `redefinirSenha` (method) - `static async redefinirSenha(req: Request, res: Response) {`
### server/src/src/controller/Controller_Servico.ts

- Linha 5: `statusErro` (function) - `function statusErro(error: any) {`
- Linha 9: `mensagemErro` (function) - `function mensagemErro(error: any) {`
- Linha 14: `listarMeus` (method) - `static async listarMeus(req: AuthRequest, res: Response) {`
- Linha 29: `criar` (method) - `static async criar(req: AuthRequest, res: Response) {`
- Linha 44: `atualizar` (method) - `static async atualizar(req: AuthRequest, res: Response) {`
- Linha 63: `remover` (method) - `static async remover(req: AuthRequest, res: Response) {`
### server/src/src/gateways/pagamento/AsaasPagamentoGateway.ts

- Linha 48: `apiKeyObrigatoria` (function) - `function apiKeyObrigatoria() {`
- Linha 56: `ambienteAsaas` (function) - `function ambienteAsaas(): AmbienteAsaas {`
- Linha 82: `validarCompatibilidadeBaseUrl` (function) - `function validarCompatibilidadeBaseUrl(`
- Linha 103: `baseUrlAsaas` (function) - `function baseUrlAsaas() {`
- Linha 115: `dataIsoSomenteData` (function) - `function dataIsoSomenteData(data: Date) {`
- Linha 119: `adicionarDias` (function) - `function adicionarDias(data: Date, dias: number) {`
- Linha 125: `billingTypeAssinatura` (function) - `function billingTypeAssinatura(input: CriarAssinaturaMensalInput) {`
- Linha 141: `mensagemPorBillingType` (function) - `function mensagemPorBillingType(billingType: string) {`
- Linha 157: `complementoSemCobrancaAcessivel` (function) - `function complementoSemCobrancaAcessivel(`
- Linha 169: `normalizarStatusAsaas` (function) - `function normalizarStatusAsaas(status?: string): GatewayStatusAssinatura {`
- Linha 178: `mensagemErroAsaas` (function) - `function mensagemErroAsaas(error: unknown) {`
- Linha 194: `statusErroGateway` (function) - `function statusErroGateway(`
- Linha 209: `isPix` (function) - `function isPix(input: CriarAssinaturaMensalInput) {`
- Linha 213: `dadosCartaoAsaas` (function) - `function dadosCartaoAsaas(input: CriarAssinaturaMensalInput) {`
- Linha 235: `constructor` (method) - `constructor() {`
### server/src/src/gateways/pagamento/index.ts

- Linha 5: `obterPagamentoGateway` (function) - `export function obterPagamentoGateway(): PagamentoGateway {`
### server/src/src/lib/logger.ts

- Linha 31: `mascararEmail` (function) - `function mascararEmail(valor: string) {`
- Linha 38: `sanitizar` (function) - `function sanitizar(valor: unknown): unknown {`
### server/src/src/lib/sessionCookie.ts

- Linha 8: `cookieSecure` (function) - `function cookieSecure() {`
- Linha 12: `obterHost` (function) - `function obterHost(url?: string) {`
- Linha 22: `frontendBackendEmSitesDiferentes` (function) - `function frontendBackendEmSitesDiferentes() {`
- Linha 39: `sameSite` (function) - `function sameSite(): 'strict' | 'lax' | 'none' {`
- Linha 47: `definirCookieSessao` (function) - `export function definirCookieSessao(res: Response, token: string) {`
- Linha 57: `limparCookieSessao` (function) - `export function limparCookieSessao(res: Response) {`
- Linha 66: `definirCookieCadastroSocial` (function) - `export function definirCookieCadastroSocial(res: Response, token: string) {`
- Linha 76: `limparCookieCadastroSocial` (function) - `export function limparCookieCadastroSocial(res: Response) {`
### server/src/src/lib/uploadScanner.ts

- Linha 7: `scanMode` (function) - `function scanMode() {`
- Linha 11: `clamavHost` (function) - `function clamavHost() {`
- Linha 15: `clamavPort` (function) - `function clamavPort() {`
- Linha 19: `clamavTimeoutMs` (function) - `function clamavTimeoutMs() {`
- Linha 23: `dividirBuffer` (function) - `function dividirBuffer(buffer: Buffer, tamanho = 64 * 1024) {`
- Linha 31: `tamanhoChunk` (function) - `function tamanhoChunk(tamanho: number) {`
- Linha 37: `scanComClamav` (function) - `async function scanComClamav(buffer: Buffer): Promise<ScanResultado> {`
- Linha 87: `verificarArquivoSeguro` (function) - `export async function verificarArquivoSeguro(`
- Linha 103: `uploadScannerObrigatorioEmProducao` (function) - `export function uploadScannerObrigatorioEmProducao() {`
### server/src/src/middleware/autenticacao.ts

- Linha 7: `obterJwtSecret` (function) - `function obterJwtSecret() {`
- Linha 19: `extrairBearerToken` (function) - `function extrairBearerToken(authHeader?: string) {`
- Linha 28: `extrairToken` (function) - `function extrairToken(req: Request) {`
- Linha 37: `payloadValido` (function) - `function payloadValido(`
- Linha 47: `authMiddleware` (function) - `export function authMiddleware(`
### server/src/src/middleware/autorizacao.ts

- Linha 10: `permitirTipos` (function) - `export function permitirTipos(tiposPermitidos: string[]): RequestHandler {`
- Linha 35: `permitirDonoOuAdmin` (function) - `export function permitirDonoOuAdmin(paramName = 'id'): RequestHandler {`
- Linha 55: `garantirPrestadorOperacional` (function) - `export function garantirPrestadorOperacional(`
### server/src/src/middleware/autorizarUsuarioAlvo.ts

- Linha 5: `autorizarUsuarioAlvo` (function) - `export function autorizarUsuarioAlvo(`
### server/src/src/middleware/rateLimit.ts

- Linha 16: `usarUpstash` (function) - `function usarUpstash() {`
- Linha 20: `upstashConfigurado` (function) - `function upstashConfigurado() {`
- Linha 26: `chaveRequisicao` (function) - `function chaveRequisicao(req: Request, nome: string) {`
- Linha 36: `rateLimit` (function) - `export function rateLimit(options: RateLimitOptions) {`
- Linha 83: `comandoUpstash` (function) - `async function comandoUpstash<T>(comando: unknown[]): Promise<T> {`
- Linha 107: `rateLimitUpstash` (function) - `async function rateLimitUpstash(`
### server/src/src/middleware/uploadCadastro.ts

- Linha 19: `exigirUploadsHabilitados` (function) - `export function exigirUploadsHabilitados(`
- Linha 34: `validarTokenUploadCadastro` (function) - `export function validarTokenUploadCadastro(`
- Linha 118: `nomeSuspeito` (function) - `function nomeSuspeito(nome: string) {`
- Linha 122: `validarArquivosUploadCadastro` (function) - `export async function validarArquivosUploadCadastro(`
### server/src/src/middleware/user.ts

- Linha 21: `validarUsuario` (function) - `export function validarUsuario(`
### server/src/src/middleware/validacaoEntrada.ts

- Linha 7: `detalhesErro` (function) - `function detalhesErro(error: ZodError) {`
- Linha 14: `validarEntrada` (function) - `export function validarEntrada(`
### server/src/src/route/Route_Login.ts

- Linha 35: `isProvedorSocial` (function) - `function isProvedorSocial(provider: string): provider is ProvedorSocial {`
### server/src/src/scripts/backup-db.ts

- Linha 8: `timestampArquivo` (function) - `function timestampArquivo() {`
- Linha 16: `executarBackup` (function) - `async function executarBackup() {`
### server/src/src/scripts/db-url.ts

- Linha 9: `parseDatabaseUrl` (function) - `export function parseDatabaseUrl(): DatabaseConnectionInfo {`
### server/src/src/scripts/ensure-profile-fields.ts

- Linha 179: `colunaExiste` (function) - `async function colunaExiste(tabela: string, coluna: string) {`
- Linha 191: `tabelaExiste` (function) - `async function tabelaExiste(tabela: string) {`
- Linha 202: `garantirTabelaConfirmacoesEmail` (function) - `async function garantirTabelaConfirmacoesEmail() {`
- Linha 233: `garantirColuna` (function) - `async function garantirColuna({`
- Linha 257: `garantirIndiceAssinaturaPrestadorStatus` (function) - `async function garantirIndiceAssinaturaPrestadorStatus() {`
- Linha 284: `sincronizarStatusCadastroPrestadores` (function) - `async function sincronizarStatusCadastroPrestadores() {`
- Linha 312: `ensureProfileFields` (function) - `export async function ensureProfileFields() {`
### server/src/src/scripts/expirar-assinaturas-pendentes.ts

- Linha 5: `main` (function) - `async function main() {`
### server/src/src/scripts/keep-alive.ts

- Linha 3: `aivenKeepAlive` (function) - `async function aivenKeepAlive() {  try {`
### server/src/src/scripts/limpar-tokens.ts

- Linha 4: `main` (function) - `async function main() {`
### server/src/src/scripts/ping-db.ts

- Linha 3: `keepAlive` (function) - `async function keepAlive() {  try {`
### server/src/src/scripts/restore-db.ts

- Linha 8: `obterArquivoBackup` (function) - `function obterArquivoBackup() {`
- Linha 30: `executarRestore` (function) - `async function executarRestore() {`
### server/src/src/scripts/verificar-assinaturas.ts

- Linha 5: `main` (function) - `async function main() {`
### server/src/src/service/Service_Agendamento.ts

- Linha 57: `erroNegocio` (function) - `function erroNegocio(mensagem: string, status = 400) {`
- Linha 65: `dataSomenteData` (function) - `function dataSomenteData(valor?: string) {`
- Linha 80: `horaSomenteHora` (function) - `function horaSomenteHora(`
- Linha 108: `horaFimPadrao` (function) - `function horaFimPadrao(`
- Linha 124: `formatarMoeda` (function) - `function formatarMoeda(`
- Linha 133: `formatarData` (function) - `function formatarData(valor: Date) {`
- Linha 141: `formatarHora` (function) - `function formatarHora(valor: Date) {`
- Linha 149: `dataHoraInicioServico` (function) - `function dataHoraInicioServico(`
- Linha 164: `calcularCancelamentoMvp` (function) - `export function calcularCancelamentoMvp(`
- Linha 196: `respostaCancelamento` (function) - `function respostaCancelamento(`
- Linha 231: `htmlBase` (function) - `function htmlBase(titulo: string, corpo: string) {`
- Linha 243: `enviarEmailSeguro` (function) - `async function enviarEmailSeguro(`
- Linha 261: `notificarCriacao` (function) - `async function notificarCriacao(`
- Linha 303: `notificarMudancaStatus` (function) - `async function notificarMudancaStatus(`
- Linha 356: `buscarContratacaoCompleta` (function) - `async function buscarContratacaoCompleta(id: number) {`
### server/src/src/service/Service_Assinatura.ts

- Linha 92: `erroNegocio` (function) - `function erroNegocio(mensagem: string, status = 400) {`
- Linha 98: `tokenWebhookAsaasForte` (function) - `function tokenWebhookAsaasForte(token?: string | null) {`
- Linha 113: `adicionarDias` (function) - `function adicionarDias(data: Date, dias: number) {`
- Linha 119: `valorAssinaturaMensal` (function) - `function valorAssinaturaMensal(valorPlano: Prisma.Decimal | number | string) {`
- Linha 137: `obterOuCriarPlanoAssinatura` (function) - `async function obterOuCriarPlanoAssinatura(planoId: number) {`
- Linha 149: `statusCadastroPorAssinatura` (function) - `function statusCadastroPorAssinatura(`
- Linha 179: `motivoPerfilInativo` (function) - `function motivoPerfilInativo(status?: assinaturas_status | null) {`
- Linha 191: `dataIsoOuNull` (function) - `function dataIsoOuNull(data?: Date | string | null) {`
- Linha 197: `statusGatewayResposta` (function) - `function statusGatewayResposta(`
- Linha 214: `proximaAcaoAssinatura` (function) - `function proximaAcaoAssinatura(`
- Linha 239: `mensagemUsuarioAssinatura` (function) - `function mensagemUsuarioAssinatura(`
- Linha 291: `payloadAsaas` (function) - `function payloadAsaas(payload: unknown): AsaasWebhookPayload {`
- Linha 299: `dataAsaas` (function) - `function dataAsaas(valor?: string | null) {`
- Linha 307: `limitarGatewayStatus` (function) - `function limitarGatewayStatus(valor: string) {`
- Linha 311: `tipoEventoFinanceiro` (function) - `function tipoEventoFinanceiro(status: assinaturas_status | null, event?: string) {`
- Linha 320: `idEventoAsaas` (function) - `function idEventoAsaas(payload: AsaasWebhookPayload, gatewaySubscriptionId?: string) {`
- Linha 335: `resumoPayloadAsaas` (function) - `function resumoPayloadAsaas(payload: AsaasWebhookPayload) {`
- Linha 352: `jsonEstavel` (function) - `function jsonEstavel(valor: unknown): string {`
- Linha 367: `hashPayload` (function) - `function hashPayload(valor: unknown) {`
- Linha 371: `registrarEventoAssinatura` (function) - `async function registrarEventoAssinatura(`
- Linha 403: `validarDadosPagamentoAssinatura` (function) - `function validarDadosPagamentoAssinatura(`
- Linha 454: `calcularConfirmacaoExpiraEm` (method) - `static calcularConfirmacaoExpiraEm() {`
- Linha 460: `registrarEventoFinanceiro` (method) - `static async registrarEventoFinanceiro(input: RegistrarEventoInput) {`
- Linha 464: `listarPlanosDisponiveis` (method) - `static async listarPlanosDisponiveis() {`
- Linha 483: `obterAssinaturaAtual` (method) - `static async obterAssinaturaAtual(prestadorId: string) {`
- Linha 490: `obterStatusAssinaturaPrestador` (method) - `static async obterStatusAssinaturaPrestador(prestadorId: string) {`
- Linha 630: `prestadorPodeAparecerNaBusca` (method) - `static async prestadorPodeAparecerNaBusca(prestadorId: string) {`
- Linha 636: `prestadorPodeReceberPedidos` (method) - `static async prestadorPodeReceberPedidos(prestadorId: string) {`
- Linha 642: `prestadorPodeUsarPerfilProfissional` (method) - `static async prestadorPodeUsarPerfilProfissional(prestadorId: string) {`
- Linha 992: `cancelarAssinaturaPrestador` (method) - `static async cancelarAssinaturaPrestador(prestadorId: string) {`
- Linha 1046: `expirarAssinaturasSemConfirmacao` (method) - `static async expirarAssinaturasSemConfirmacao() {`
- Linha 1100: `verificarAssinaturasVencidas` (method) - `static async verificarAssinaturasVencidas() {`
- Linha 1215: `validarTokenWebhookAsaas` (method) - `static validarTokenWebhookAsaas(token?: string) {`
- Linha 1289: `processarWebhookAsaas` (method) - `static async processarWebhookAsaas(input: WebhookAsaasInput) {`
- Linha 1604: `statusCadastroPorAssinatura` (method) - `static statusCadastroPorAssinatura(status: assinaturas_status) {`
### server/src/src/service/Service_Autenticacao.ts

- Linha 25: `obterJwtSecret` (function) - `function obterJwtSecret() {`
- Linha 37: `obterFrontendUrl` (function) - `function obterFrontendUrl() {`
- Linha 41: `obterBackendUrl` (function) - `function obterBackendUrl() {`
- Linha 50: `criarTokenSessao` (function) - `function criarTokenSessao(user: {`
- Linha 70: `criarUrlCallback` (function) - `function criarUrlCallback(provider: SocialProvider) {`
- Linha 83: `criarSenhaSocial` (function) - `function criarSenhaSocial() {`
- Linha 87: `normalizarDigitos` (function) - `function normalizarDigitos(valor: unknown) {`
- Linha 91: `valorObrigatorio` (function) - `function valorObrigatorio(valor: unknown) {`
- Linha 95: `normalizarDecimal` (function) - `function normalizarDecimal(valor: unknown) {`
- Linha 100: `montarPerfilProfissional` (function) - `function montarPerfilProfissional(data: any, tipo: TipoCadastroSocial) {`
- Linha 123: `validarComplementoCadastroSocial` (function) - `function validarComplementoCadastroSocial(data: any) {`
- Linha 188: `mascararIdentificador` (function) - `function mascararIdentificador(identificador: string) {`
- Linha 197: `iniciarLoginSocial` (method) - `static iniciarLoginSocial(provider: SocialProvider, state: string) {`
- Linha 275: `completarCadastroSocial` (method) - `static async completarCadastroSocial(data: any) {`
- Linha 379: `obterCadastroSocialPendente` (method) - `static async obterCadastroSocialPendente(token: string) {`
- Linha 403: `obterUsuarioAutenticado` (method) - `static async obterUsuarioAutenticado(usuarioId: string) {`
### server/src/src/service/Service_Avaliacao.ts

- Linha 32: `erroNegocio` (function) - `function erroNegocio(mensagem: string, status = 400) {`
- Linha 38: `dataHoraFimServico` (function) - `function dataHoraFimServico(contratacao: Pick<contratacoes, 'data' | 'hora_fim'>) {`
- Linha 53: `tipoAvaliacaoDaParte` (function) - `function tipoAvaliacaoDaParte(`
- Linha 78: `respostaDisponibilidade` (function) - `function respostaDisponibilidade(`
- Linha 99: `atualizarMediaUsuario` (function) - `async function atualizarMediaUsuario(usuarioId: string) {`
- Linha 225: `registrarAvaliacao` (method) - `static async registrarAvaliacao(data: any, usuario: UsuarioAvaliacao) {`
- Linha 309: `listarPendentes` (method) - `static async listarPendentes(usuario: UsuarioAvaliacao) {`
- Linha 362: `obterAvaliacoesPorPrestador` (method) - `static async obterAvaliacoesPorPrestador(prestadorId: string) {`
- Linha 380: `obterAvaliacoesPorCliente` (method) - `static async obterAvaliacoesPorCliente(clienteId: string) {`
### server/src/src/service/Service_ConfirmacaoEmail.ts

- Linha 10: `erroNegocio` (function) - `function erroNegocio(mensagem: string, status = 400) {`
- Linha 16: `erroServicoEmail` (function) - `function erroServicoEmail(error: unknown) {`
- Linha 42: `frontendUrl` (function) - `function frontendUrl() {`
- Linha 46: `linkConfirmacaoEmail` (function) - `function linkConfirmacaoEmail(token: string, tipo?: string) {`
- Linha 54: `adicionarHoras` (function) - `function adicionarHoras(data: Date, horas: number) {`
- Linha 60: `htmlConfirmacao` (function) - `function htmlConfirmacao(nome: string, link: string, tipo?: string) {`
- Linha 83: `gerarTokenConfirmacao` (method) - `static gerarTokenConfirmacao(_usuarioId: string) {`
- Linha 87: `criarConfirmacaoEmail` (method) - `static async criarConfirmacaoEmail(usuarioId: string) {`
- Linha 102: `enviarEmailConfirmacao` (method) - `static async enviarEmailConfirmacao(usuarioId: string) {`
- Linha 159: `confirmarEmail` (method) - `static async confirmarEmail(token: string) {`
- Linha 218: `reenviarConfirmacao` (method) - `static async reenviarConfirmacao(usuarioId: string) {`
- Linha 253: `obterStatusEmail` (method) - `static async obterStatusEmail(usuarioId: string) {`
- Linha 267: `validarEmailConfirmado` (method) - `static async validarEmailConfirmado(usuarioId: string) {`
### server/src/src/service/Service_Crud.ts

- Linha 63: `normalizarEntidade` (method) - `static normalizarEntidade(entity: string) {`
- Linha 67: `validarEntidadeCrud` (method) - `static validarEntidadeCrud(entity: string) {`
- Linha 84: `validarCampoCrud` (method) - `static validarCampoCrud(field: string) {`
- Linha 94: `validarEntidadeExistenteCrud` (method) - `static async validarEntidadeExistenteCrud(entity: string) {`
- Linha 107: `normalizarId` (method) - `static normalizarId(entity: string, id: string) {`
- Linha 128: `bloqueia_user` (method) - `static async bloqueia_user(entidade: any) {    if (entidade == 'usuario') {      return 'Operação não pode ser realizada por motivos de segurança.';`
### server/src/src/service/Service_Email.ts

- Linha 14: `obterConfigEmail` (function) - `function obterConfigEmail() {`
- Linha 40: `mensagemErroOriginal` (function) - `function mensagemErroOriginal(error: unknown) {`
- Linha 44: `isFalhaConexao` (function) - `function isFalhaConexao(error: unknown) {`
- Linha 54: `normalizarErroEmail` (function) - `function normalizarErroEmail(`
- Linha 72: `criarTransporter` (function) - `function criarTransporter(config: ReturnType<typeof obterConfigEmail>) {`
- Linha 92: `constructor` (method) - `constructor() {`
### server/src/src/service/Service_Localizacao.ts

- Linha 51: `fetchTimeoutSignal` (function) - `function fetchTimeoutSignal() {`
- Linha 59: `normalizarTextoBusca` (function) - `function normalizarTextoBusca(valor: string) {`
- Linha 67: `obterUfPorTexto` (function) - `function obterUfPorTexto(localizacao: string) {`
### server/src/src/service/Service_Onboarding.ts

- Linha 16: `erroNegocio` (function) - `function erroNegocio(mensagem: string, status = 400) {`
- Linha 22: `textoPreenchido` (function) - `function textoPreenchido(valor?: string | null) {`
- Linha 26: `dadosCuidadorCompletos` (function) - `function dadosCuidadorCompletos(dados?: {`
- Linha 39: `dadosAcompanhanteCompletos` (function) - `function dadosAcompanhanteCompletos(dados?: {`
- Linha 47: `dadosEnfermeiroCompletos` (function) - `function dadosEnfermeiroCompletos(dados?: {`
- Linha 56: `proximaAcaoPorEtapa` (function) - `function proximaAcaoPorEtapa(etapa: EtapaOnboardingPrestador) {`
- Linha 73: `ehPrestador` (method) - `static ehPrestador(tipo?: string | null) {`
- Linha 77: `obterStatus` (method) - `static async obterStatus(usuarioId: string) {`
- Linha 160: `validarPodeIniciarAssinatura` (method) - `static async validarPodeIniciarAssinatura(usuarioId: string) {`
### server/src/src/service/Service_Perfil.ts

- Linha 20: `anexarAvaliacoesEmContratacoes` (function) - `async function anexarAvaliacoesEmContratacoes(contratacoes: any[]) {`
- Linha 55: `inicioHoje` (function) - `function inicioHoje() {`
- Linha 61: `montarAgendaFutura` (function) - `function montarAgendaFutura(contratacoes: any[]) {`
- Linha 141: `obterMeuPerfilCompleto` (method) - `static async obterMeuPerfilCompleto(usuarioId: string) {    try {`
- Linha 314: `obterResumoPerfil` (method) - `static async obterResumoPerfil(usuarioId: string) {    try {`
- Linha 409: `obterVitrinePrestador` (method) - `static async obterVitrinePrestador(prestadorId: string) {`
- Linha 589: `atualizarMediaAvaliacao` (method) - `static async atualizarMediaAvaliacao(usuarioId: string) {    try {`
### server/src/src/service/Service_RecuperacaoSenha.ts

- Linha 11: `erroNegocio` (function) - `function erroNegocio(mensagem: string, status = 400) {`
- Linha 17: `mascararEmail` (function) - `function mascararEmail(email: string) {`
- Linha 25: `validarSenhaForte` (function) - `function validarSenhaForte(novaSenha: string) {`
- Linha 36: `dataExpiracao` (function) - `function dataExpiracao() {`
- Linha 42: `frontendUrl` (function) - `function frontendUrl() {`
- Linha 46: `htmlRecuperacaoSenha` (function) - `function htmlRecuperacaoSenha(nome: string, link: string) {`
- Linha 66: `gerarToken` (method) - `static gerarToken() {`
- Linha 70: `enviarEmailRecuperacao` (method) - `static async enviarEmailRecuperacao(email: string) {`
- Linha 128: `validarTokenRecuperacao` (method) - `static async validarTokenRecuperacao(token: string) {`
- Linha 162: `redefinirSenha` (method) - `static async redefinirSenha(token: string, novaSenha: string) {`
### server/src/src/service/Service_Servico.ts

- Linha 23: `erroNegocio` (function) - `function erroNegocio(mensagem: string, status = 400) {`
- Linha 29: `validarPrestador` (function) - `function validarPrestador(usuario: UsuarioAutenticado) {`
- Linha 42: `montarDadosServico` (function) - `function montarDadosServico(`
- Linha 95: `listarMeus` (method) - `static async listarMeus(usuario: UsuarioAutenticado) {`
### server/src/src/service/Service_Storage.ts

- Linha 10: `obterConfigAws` (function) - `function obterConfigAws(isPrivado: boolean) {`
- Linha 36: `obterS3Client` (function) - `function obterS3Client(config: ReturnType<typeof obterConfigAws>) {`
### server/src/src/service/Service_User.ts

- Linha 26: `criarErroCadastro` (function) - `function criarErroCadastro(`
- Linha 35: `removerSenha` (function) - `function removerSenha(usuario: Record<string, any>) {`
- Linha 40: `numeroDecimalOpcional` (function) - `function numeroDecimalOpcional(valor: unknown) {`
- Linha 48: `anosExperiencia` (function) - `function anosExperiencia(valor: unknown) {`
- Linha 55: `montarDadosProfissionais` (function) - `function montarDadosProfissionais(dados: any = {}) {`
- Linha 67: `ehTipoPrestador` (function) - `function ehTipoPrestador(tipo?: string) {`
- Linha 71: `sanitizarAtualizacaoUsuario` (function) - `function sanitizarAtualizacaoUsuario(`
- Linha 88: `statusCadastroInicial` (function) - `function statusCadastroInicial(tipo?: string) {`
- Linha 100: `validouAceiteLegal` (function) - `function validouAceiteLegal(data: any) {`
- Linha 109: `criarRegistroInterno` (function) - `async function criarRegistroInterno(entity: string, data: object) {`
- Linha 121: `criarUsuarioComTipo` (method) - `static async criarUsuarioComTipo(data: any) {    const {`
- Linha 327: `validarEmail` (method) - `static async validarEmail() {  }`
- Linha 335: `buscarUsuarioCompleto` (method) - `static async buscarUsuarioCompleto(id: string) {    try {      const usuarioBase = await ServiceCrud.findById(`
- Linha 471: `deletarUsuario` (method) - `static async deletarUsuario(id: string) {    try {      const result = await ServiceCrud.delete(`
### server/src/src/validator/create/Validator_User.ts

- Linha 90: `normalizarDigitos` (function) - `function normalizarDigitos(valor: unknown): string {`
- Linha 94: `adicionarErro` (function) - `function adicionarErro(`
- Linha 102: `cpfValido` (function) - `function cpfValido(cpfOriginal: string): boolean {`
- Linha 130: `cepValido` (function) - `function cepValido(cepOriginal: string): boolean {`
- Linha 135: `telefoneBrasileiroValido` (function) - `function telefoneBrasileiroValido(telefoneOriginal: unknown): boolean {`
- Linha 159: `senhaForte` (function) - `export function senhaForte(senha: unknown): boolean {`
- Linha 172: `numeroOpcionalValido` (function) - `function numeroOpcionalValido(valor: unknown, minimo = 0, maximo = 100000) {`
- Linha 178: `stringOpcionalValida` (function) - `function stringOpcionalValida(`
- Linha 189: `validarCamposProfissionais` (function) - `function validarCamposProfissionais(`
- Linha 238: `validarCreateUsuarioDto` (function) - `export function validarCreateUsuarioDto(input: any): {`

