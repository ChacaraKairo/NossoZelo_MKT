# Relatórios técnicos para a monografia

Esta pasta reúne os artefatos técnicos usados como apoio ao Capítulo III da monografia do projeto Nosso Zelo. O material documenta a análise do código-fonte, da arquitetura, das funcionalidades implementadas, dos testes automatizados e das limitações técnicas identificadas no repositório.

## Arquivos gerados

| Arquivo | Finalidade |
| --- | --- |
| `relatorio-tecnico-projeto.md` | Relatório técnico-acadêmico principal, em português formal, com análise do repositório, arquitetura, backend, frontend, banco de dados, segurança, testes e recomendações para a monografia. |
| `resultados-testes.md` | Registro objetivo dos comandos executados, resultados obtidos, erros encontrados e status final da avaliação técnica. |
| `relatorio-tecnico-projeto.json` | Versão estruturada e consolidada dos principais achados da análise, útil para consulta programática ou atualização futura. |
| `logs/` | Evidências simplificadas da execução dos comandos de instalação, lint, testes, build e Docker Compose. |

## Como reexecutar os testes

Backend:

```bash
cd server
npm install
npm run lint
npm test
npm run build
```

Frontend público:

```bash
cd client
npm install
npm run lint
npm run build
```

Painel administrativo:

```bash
cd controlador
npm install
npm run lint
npm test
npm run build
```

Ambiente Docker:

```bash
docker compose config
docker compose up --build
```

Caso o Docker Desktop ou daemon equivalente não esteja ativo, registre a limitação em `resultados-testes.md` em vez de assumir resultado não observado.

## Como atualizar os relatórios

1. Atualize a branch de trabalho com `main`.
2. Reexecute os comandos de validação.
3. Atualize os resultados em `resultados-testes.md`.
4. Atualize as tabelas e conclusões em `relatorio-tecnico-projeto.md`.
5. Atualize os campos de branch, commit, data, testes e limitações em `relatorio-tecnico-projeto.json`.
6. Revise se nenhum segredo, token, senha real ou dado sensível foi incluído.

## Uso na monografia

As seções finais do relatório principal contêm textos prontos ou quase prontos para o Capítulo III. Recomenda-se adaptar a redação ao padrão da instituição, mantendo as evidências técnicas, os comandos executados e as limitações como base para a seção de avaliação do sistema.
