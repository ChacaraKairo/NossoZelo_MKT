# Referencia Prisma

Inventario gerado a partir dos schemas Prisma atuais. As migrations MySQL antigas ficam arquivadas em `mysql_migrations_legacy/` e nao representam o estado ativo.

## server/prisma/schema.prisma

- Linha 10: modelo `admins`
- Linha 18: modelo `agenda`
- Linha 33: modelo `agenda_recorrente`
- Linha 45: modelo `assinaturas`
- Linha 73: modelo `avaliacoes`
- Linha 100: modelo `contratacoes`
- Linha 126: modelo `cuidador_especialidade`
- Linha 137: modelo `cuidadores`
- Linha 153: modelo `denuncias`
- Linha 163: modelo `documentos_cuidadores`
- Linha 174: modelo `enfermeiros`
- Linha 189: modelo `acompanhantes`
- Linha 202: modelo `babas`
- Linha 215: modelo `diaristas`
- Linha 228: modelo `motoristas_assistenciais`
- Linha 242: modelo `especialidades`
- Linha 249: modelo `faturas`
- Linha 262: modelo `logs_acao`
- Linha 273: modelo `logs_acesso`
- Linha 283: modelo `metodos_pagamento`
- Linha 289: modelo `pagamentos`
- Linha 303: modelo `planos`
- Linha 316: modelo `eventos_assinatura`
- Linha 344: modelo `asaas_webhook_logs`
- Linha 369: modelo `recuperacao_senhas`
- Linha 381: modelo `relatorios`
- Linha 393: modelo `servicos`
- Linha 406: modelo `usuarios`
- Linha 466: modelo `cartoes`
- Linha 482: modelo `dados_bancarios`
- Linha 495: modelo `localizacoes`
- Linha 502: modelo `aiven_keep_alive`
- Linha 509: enum `agenda_recorrente_dia_semana`
- Linha 519: enum `relatorios_tipo`
- Linha 526: enum `avaliacoes_tipo_prestador`
- Linha 535: enum `avaliacoes_tipo_autor`
- Linha 540: enum `avaliacoes_tipo_avaliacao`
- Linha 545: enum `contratacoes_cancelado_por`
- Linha 551: enum `denuncias_status`
- Linha 556: enum `logs_acao_acao`
- Linha 562: enum `pagamentos_status`
- Linha 568: enum `agenda_status`
- Linha 574: enum `servicos_tipo_cobranca`
- Linha 579: enum `cartoes_tipo`
- Linha 584: enum `usuarios_tipo`
- Linha 595: modelo `confirmacoes_email`
- Linha 609: enum `usuarios_status_cadastro`
- Linha 618: enum `assinaturas_status`
- Linha 629: enum `dados_bancarios_tipo_conta`
- Linha 636: enum `usuarios_sexo`
- Linha 642: enum `agenda_tipo_prestador`
- Linha 651: enum `servicos_tipo_prestador`
- Linha 660: enum `contratacoes_tipo_prestador`
- Linha 669: enum `contratacoes_status`

## controlador/prisma/schema.prisma

- Linha 10: modelo `admins`
- Linha 18: modelo `agenda`
- Linha 33: modelo `agenda_recorrente`
- Linha 45: modelo `assinaturas`
- Linha 73: modelo `eventos_assinatura`
- Linha 101: modelo `asaas_webhook_logs`
- Linha 126: modelo `avaliacoes`
- Linha 153: modelo `contratacoes`
- Linha 179: modelo `cuidador_especialidade`
- Linha 190: modelo `cuidadores`
- Linha 206: modelo `denuncias`
- Linha 216: modelo `documentos_cuidadores`
- Linha 227: modelo `enfermeiros`
- Linha 242: modelo `acompanhantes`
- Linha 255: modelo `babas`
- Linha 268: modelo `diaristas`
- Linha 281: modelo `motoristas_assistenciais`
- Linha 295: modelo `especialidades`
- Linha 302: modelo `faturas`
- Linha 315: modelo `logs_acao`
- Linha 326: modelo `logs_acesso`
- Linha 336: modelo `metodos_pagamento`
- Linha 342: modelo `pagamentos`
- Linha 356: modelo `planos`
- Linha 369: modelo `recuperacao_senhas`
- Linha 381: modelo `relatorios`
- Linha 393: modelo `servicos`
- Linha 406: modelo `usuarios`
- Linha 466: modelo `cartoes`
- Linha 482: modelo `dados_bancarios`
- Linha 495: modelo `localizacoes`
- Linha 502: modelo `aiven_keep_alive`
- Linha 509: enum `agenda_recorrente_dia_semana`
- Linha 519: enum `relatorios_tipo`
- Linha 526: enum `avaliacoes_tipo_prestador`
- Linha 535: enum `avaliacoes_tipo_autor`
- Linha 540: enum `avaliacoes_tipo_avaliacao`
- Linha 545: enum `contratacoes_cancelado_por`
- Linha 551: enum `denuncias_status`
- Linha 556: enum `logs_acao_acao`
- Linha 562: enum `pagamentos_status`
- Linha 568: enum `agenda_status`
- Linha 574: enum `servicos_tipo_cobranca`
- Linha 579: enum `cartoes_tipo`
- Linha 584: enum `usuarios_tipo`
- Linha 595: modelo `confirmacoes_email`
- Linha 609: enum `usuarios_status_cadastro`
- Linha 618: enum `assinaturas_status`
- Linha 629: enum `dados_bancarios_tipo_conta`
- Linha 636: enum `usuarios_sexo`
- Linha 642: enum `agenda_tipo_prestador`
- Linha 651: enum `servicos_tipo_prestador`
- Linha 660: enum `contratacoes_tipo_prestador`
- Linha 669: enum `contratacoes_status`

## server/prisma/migrations

- `20260731174000_postgresql_baseline/migration.sql`
- `20260731182000_add_novos_prestadores/migration.sql`

## controlador/prisma/migrations

- `20260731174000_postgresql_baseline/migration.sql`
- `20260731182000_add_novos_prestadores/migration.sql`

