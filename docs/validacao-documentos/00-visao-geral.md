# API de Validação de Documentos — Visão Geral

## Objetivo

Criar uma API interna para validar documentos de usuários prestadores antes de liberar o cadastro completo no marketplace NossoZelo.

A API deve apoiar a análise de documentos de cuidadores, enfermeiros e acompanhantes, reduzindo risco operacional, fraude documental e cadastro indevido de prestadores.

A validação não deve ser tratada como aprovação automática absoluta. O desenho correto para o MVP é:

```text
validação automática assistida + revisão manual quando houver dúvida
```

## Problema que a API resolve

Antes de um prestador aparecer na busca pública, o sistema precisa garantir que:

- o usuário confirmou o e-mail;
- o perfil profissional foi preenchido;
- os documentos obrigatórios foram enviados;
- os documentos passaram por validação mínima;
- a identidade foi aprovada;
- a validação profissional foi aprovada quando aplicável;
- a assinatura está ativa;
- o cadastro está apto para aparecer no marketplace.

## Escopo do MVP

A primeira versão deve focar em controle documental e revisão operacional.

### Incluído no MVP

- Upload controlado de documentos.
- Registro do tipo de documento enviado.
- Status de validação documental.
- Validação básica interna do arquivo.
- Preparação para integração futura com API externa de KYC/documentoscopia.
- Tela administrativa no `controlador/` para aprovar ou recusar documentos.
- Registro de auditoria das decisões.
- Bloqueio de prestador na busca enquanto documentos não estiverem aprovados.

### Fora do MVP inicial

- Aprovação 100% automática sem revisão.
- Integração obrigatória com Datavalid, idwall ou outro provedor logo no primeiro ciclo.
- Biometria facial obrigatória no primeiro ciclo.
- Prova de vida completa no primeiro ciclo.
- Consulta profissional automatizada ao COREN no primeiro ciclo.

Esses itens devem ficar preparados na arquitetura, mas não precisam bloquear a primeira entrega.

## Estratégia recomendada

A implementação deve ocorrer em três fases.

### Fase 1 — Revisão documental estruturada

- Criar status de documentação no banco.
- Registrar documentos enviados.
- Validar arquivo por MIME, extensão, tamanho e assinatura binária.
- Criar fila de revisão no painel administrativo.
- Permitir aprovação/recusa manual por admin.
- Auditar todas as ações.
- Bloquear busca pública até aprovação.

### Fase 2 — Validação automática com provedor externo

- Criar interface `DocumentVerificationProvider`.
- Integrar um provedor externo.
- Salvar score, resultado resumido e referência externa.
- Classificar automaticamente em aprovado, recusado ou pendente de revisão.

### Fase 3 — Validação avançada

- Selfie.
- Comparação facial.
- Prova de vida.
- Validação profissional automatizada.
- Reprocessamento.
- Webhook do provedor, se existir.

## Princípios de segurança

A API deve seguir estes princípios:

- nunca salvar documento em base64 no banco;
- nunca retornar URL pública de documento privado;
- armazenar apenas chave interna do arquivo;
- não logar CPF completo, documento completo, token, cookie ou payload sensível;
- mascarar dados sensíveis em logs e auditoria;
- permitir acesso aos documentos apenas para usuário dono ou admin autorizado;
- manter `ENABLE_UPLOADS=false` em produção enquanto S3/ClamAV não estiverem corretamente configurados;
- exigir ClamAV quando uploads estiverem ativos em produção;
- registrar trilha de auditoria em toda ação documental.

## Relação com regras atuais do NossoZelo

A regra final de liberação do prestador deve considerar:

```text
email confirmado
+ perfil profissional completo
+ documentos aprovados
+ identidade aprovada
+ validação profissional aprovada ou não aplicável
+ assinatura ativa
+ status_cadastro ativo
= prestador apto para aparecer na busca
```

## Decisão de produto

Para o NossoZelo, a documentação deve ser tratada como etapa obrigatória do onboarding do prestador.

O usuário pode até criar conta e preencher perfil, mas não deve aparecer na busca pública enquanto a documentação estiver pendente, recusada ou em análise.
