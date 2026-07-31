# Indice da documentacao completa

Esta branch existe para leitura tecnica, auditoria, onboarding e manutencao. A branch limpa de deploy e:

- `release/limpa-controlador-seguro`

Use esta branch documentada quando precisar entender o sistema, revisar seguranca ou explicar a operacao para outro desenvolvedor.

## Documentos principais

- [README.md](../README.md): visao geral do produto, stack, fluxos e comandos.
- [docs/arquitetura.md](arquitetura.md): arquitetura geral ja existente.
- [docs/seguranca.md](seguranca.md): seguranca geral da API publica.
- [docs/PRODUCAO.md](PRODUCAO.md): orientacao de producao.
- [docs/PENDENCIAS_PRODUCAO.md](PENDENCIAS_PRODUCAO.md): pendencias consolidadas.
- [docs/operacao/evidencias-lancamento.md](operacao/evidencias-lancamento.md): roteiro de evidencias para staging e producao.
- [docs/api.md](api.md): rotas principais da API publica.

## Controlador administrativo

- [docs/controlador/VISAO_GERAL.md](controlador/VISAO_GERAL.md): papel do painel, modulos e responsabilidades.
- [docs/controlador/SEGURANCA.md](controlador/SEGURANCA.md): camadas de seguranca do controlador.
- [docs/controlador/APIS.md](controlador/APIS.md): mapa das APIs administrativas.
- [docs/controlador/DEPLOY.md](controlador/DEPLOY.md): variaveis, checklist e passos de deploy.
- [docs/controlador/OPERACAO.md](controlador/OPERACAO.md): rotinas operacionais, jobs e incidentes.

## Referencias tecnicas

- [docs/REFERENCIA_FUNCOES.md](REFERENCIA_FUNCOES.md): inventario gerado de funcoes, metodos, componentes e handlers detectados.
- [docs/REFERENCIA_ROTAS.md](REFERENCIA_ROTAS.md): inventario gerado de rotas Next/Express detectadas.
- [docs/REFERENCIA_VARIAVEIS_AMBIENTE.md](REFERENCIA_VARIAVEIS_AMBIENTE.md): variaveis de ambiente usadas pelos tres apps.
- [docs/REFERENCIA_PRISMA.md](REFERENCIA_PRISMA.md): modelos Prisma e migrations relevantes.

## Como manter esta documentacao

1. Quando criar uma rota, registre a responsabilidade dela em `APIS.md`.
2. Quando criar uma funcao publica/exportada, deixe comentario JSDoc curto ou garanta que ela apareca na referencia gerada.
3. Quando criar variavel de ambiente, atualize `.env.example` e `REFERENCIA_VARIAVEIS_AMBIENTE.md`.
4. Quando alterar comportamento financeiro, atualize tambem `docs/pagamentos/assinatura-prestador-asaas.md`.
5. Quando alterar regras de producao, atualize `PRODUCAO.md`, `PENDENCIAS_PRODUCAO.md` e o checklist operacional.
