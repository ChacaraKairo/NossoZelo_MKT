# Referencia Prisma

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
- Linha 202: modelo `especialidades`
- Linha 209: modelo `faturas`
- Linha 222: modelo `logs_acao`
- Linha 233: modelo `logs_acesso`
- Linha 243: modelo `metodos_pagamento`
- Linha 249: modelo `pagamentos`
- Linha 263: modelo `planos`
- Linha 276: modelo `eventos_assinatura`
- Linha 304: modelo `asaas_webhook_logs`
- Linha 329: modelo `recuperacao_senhas`
- Linha 341: modelo `relatorios`
- Linha 353: modelo `servicos`
- Linha 366: modelo `usuarios`
- Linha 423: modelo `cartoes`
- Linha 439: modelo `dados_bancarios`
- Linha 452: modelo `localizacoes`
- Linha 459: modelo `aiven_keep_alive`
- Linha 466: enum `agenda_recorrente_dia_semana`
- Linha 476: enum `relatorios_tipo`
- Linha 483: enum `avaliacoes_tipo_prestador`
- Linha 489: enum `avaliacoes_tipo_autor`
- Linha 494: enum `avaliacoes_tipo_avaliacao`
- Linha 499: enum `contratacoes_cancelado_por`
- Linha 505: enum `denuncias_status`
- Linha 510: enum `logs_acao_acao`
- Linha 516: enum `pagamentos_status`
- Linha 522: enum `agenda_status`
- Linha 528: enum `servicos_tipo_cobranca`
- Linha 533: enum `cartoes_tipo`
- Linha 538: enum `usuarios_tipo`
- Linha 546: modelo `confirmacoes_email`
- Linha 560: enum `usuarios_status_cadastro`
- Linha 569: enum `assinaturas_status`
- Linha 580: enum `dados_bancarios_tipo_conta`
- Linha 587: enum `usuarios_sexo`
- Linha 593: enum `agenda_tipo_prestador`
- Linha 599: enum `servicos_tipo_prestador`
- Linha 605: enum `contratacoes_tipo_prestador`
- Linha 611: enum `contratacoes_status`

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
- Linha 255: modelo `especialidades`
- Linha 262: modelo `faturas`
- Linha 275: modelo `logs_acao`
- Linha 286: modelo `logs_acesso`
- Linha 296: modelo `metodos_pagamento`
- Linha 302: modelo `pagamentos`
- Linha 316: modelo `planos`
- Linha 329: modelo `recuperacao_senhas`
- Linha 341: modelo `relatorios`
- Linha 353: modelo `servicos`
- Linha 366: modelo `usuarios`
- Linha 423: modelo `cartoes`
- Linha 439: modelo `dados_bancarios`
- Linha 452: modelo `localizacoes`
- Linha 459: modelo `aiven_keep_alive`
- Linha 466: enum `agenda_recorrente_dia_semana`
- Linha 476: enum `relatorios_tipo`
- Linha 483: enum `avaliacoes_tipo_prestador`
- Linha 489: enum `avaliacoes_tipo_autor`
- Linha 494: enum `avaliacoes_tipo_avaliacao`
- Linha 499: enum `contratacoes_cancelado_por`
- Linha 505: enum `denuncias_status`
- Linha 510: enum `logs_acao_acao`
- Linha 516: enum `pagamentos_status`
- Linha 522: enum `agenda_status`
- Linha 528: enum `servicos_tipo_cobranca`
- Linha 533: enum `cartoes_tipo`
- Linha 538: enum `usuarios_tipo`
- Linha 546: modelo `confirmacoes_email`
- Linha 560: enum `usuarios_status_cadastro`
- Linha 569: enum `assinaturas_status`
- Linha 580: enum `dados_bancarios_tipo_conta`
- Linha 587: enum `usuarios_sexo`
- Linha 593: enum `agenda_tipo_prestador`
- Linha 599: enum `servicos_tipo_prestador`
- Linha 605: enum `contratacoes_tipo_prestador`
- Linha 611: enum `contratacoes_status`

## server/prisma/migrations

- `20260428192000_add_assinatura_prestador_mock/migration.sql`
- `20260428193000_add_confirmacoes_email/migration.sql`
- `20260428213000_make_recuperacao_token_unique/migration.sql`
- `20260429102000_add_assinaturas_prestador_status_index/migration.sql`
- `20260501120000_set_asaas_gateway_default_and_test_plan/migration.sql`
- `20260501162000_add_asaas_webhook_logs/migration.sql`
- `20260501173000_cascade_recuperacao_senhas_usuario/migration.sql`
- `20260502120000_add_admin_fields_to_planos/migration.sql`
- `20260502143000_add_eventos_assinatura/migration.sql`
- `20260502170000_add_hash_to_eventos_assinatura/migration.sql`
- `20260508190000_add_gateway_payment_id_assinaturas/migration.sql`
- `20260509180000_avaliacoes_bilaterais_cancelamento_mvp/migration.sql`
- `20260510120000_fix_agenda_recorrente_dia_semana_encoding/migration.sql`

## controlador/prisma/migrations

- `20260501162000_add_asaas_webhook_logs/migration.sql`
- `20260501173000_cascade_recuperacao_senhas_usuario/migration.sql`
- `20260502120000_add_admin_fields_to_planos/migration.sql`
- `20260502143000_add_eventos_assinatura/migration.sql`
- `20260502170000_add_hash_to_eventos_assinatura/migration.sql`
- `20260508190000_add_gateway_payment_id_assinaturas/migration.sql`
- `20260509180000_avaliacoes_bilaterais_cancelamento_mvp/migration.sql`
- `20260510120000_fix_agenda_recorrente_dia_semana_encoding/migration.sql`

