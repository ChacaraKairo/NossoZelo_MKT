# Resultados dos Testes

## Contexto da execução

| Item | Valor |
| --- | --- |
| Repositório | `ChacaraKairo/NossoZelo_MKT` |
| Branch | `docs/relatorio-tecnico-projeto` |
| Commit analisado | `c3c9dea149c4834c8bd320709eda088d41b8b901` |
| Data e hora inicial | `2026-05-14T23:32:51.8658278-03:00` |
| Ambiente | Windows, PowerShell, Node/npm local, Docker CLI disponível sem daemon ativo |

Antes da execução, `main` e `origin/main` estavam alinhadas no commit `c3c9dea149c4834c8bd320709eda088d41b8b901`. A branch de trabalho `docs/relatorio-tecnico-projeto` foi criada a partir desse estado. Já existiam alterações locais não relacionadas em `controlador/next-env.d.ts`, `controlador/prisma/schema.prisma`, `docs/api.md`, `controlador/prisma/migrations/20260509180000_add_gateway_payment_id_assinaturas/` e `docs/mvp/`.

## Comandos executados

| Área | Comando | Resultado | Evidência |
| --- | --- | --- | --- |
| Backend | `npm install` | Aprovado. Dependências já estavam atualizadas; `npm audit` reportou 16 vulnerabilidades. | `logs/backend-npm-install.log` |
| Backend | `npm run lint` | Aprovado. `tsc --noEmit` sem erros. | `logs/backend-lint.log` |
| Backend | `npm test` | Aprovado. 3 arquivos passaram e 1 foi ignorado; 54 testes passaram e 1 foi ignorado. | `logs/backend-test.log` |
| Backend | `npm run build` | Aprovado. Prisma Client gerado e compilação TypeScript concluída. | `logs/backend-build.log` |
| Frontend | `npm install` | Aprovado. Houve ajuste local de pacotes instalados; `npm audit` reportou 9 vulnerabilidades. | `logs/frontend-npm-install.log` |
| Frontend | `npm run lint` | Aprovado com ressalvas. 13 avisos de uso de `<img>` em vez de `next/image`; nenhum erro. | `logs/frontend-lint.log` |
| Frontend | `npm run build` | Aprovado. Build Next.js concluído com 31 páginas geradas. | `logs/frontend-build.log` |
| Controlador | `npm install` | Aprovado. Dependências atualizadas; `npm audit` reportou 2 vulnerabilidades. | `logs/controlador-npm-install.log` |
| Controlador | `npm run lint` | Aprovado. ESLint sem erros. | `logs/controlador-lint.log` |
| Controlador | `npm test` | Aprovado. 1 arquivo de teste e 5 testes passaram. | `logs/controlador-test.log` |
| Controlador | `npm run build` | Reprovado inicialmente por arquivo gerado em `.next/dev/types/validator.ts`. | `logs/controlador-build.log` |
| Controlador | limpeza de `controlador/.next` e novo `npm run build` | Aprovado após remover cache gerado. Build Next.js concluído com 19 páginas/rotas administrativas. | `logs/controlador-build-clean.log` |
| Raiz | `docker compose config` | Aprovado. Compose validado e renderizado. | `logs/docker-compose-config.log` |
| Raiz | `docker compose up --build -d` | Não executado com sucesso por limitação do ambiente: Docker daemon não estava ativo. | `logs/docker-compose-up-build.log` |

## Erros encontrados

1. O primeiro build do `controlador` falhou por erro de type check em arquivo gerado por Next.js dentro de `.next/dev/types/validator.ts`.
2. A correção realizada foi remover somente o diretório gerado `controlador/.next` e reexecutar `npm run build`.
3. O comando `docker compose up --build -d` falhou porque o Docker CLI não conseguiu conectar ao Docker Desktop/Linux Engine local.
4. O frontend apresentou 13 avisos de lint relacionados a imagens HTML diretas.
5. `npm audit` reportou vulnerabilidades em backend, frontend e controlador, ainda sem correção aplicada nesta etapa.

## Status final

**Aprovado com ressalvas.** O backend, o frontend e o painel administrativo compilaram e passaram pelos testes possíveis. As ressalvas são: Docker Compose não pôde subir por indisponibilidade do daemon Docker, há avisos de lint no frontend, vulnerabilidades reportadas pelo `npm audit` e ausência de testes end-to-end automatizados.
