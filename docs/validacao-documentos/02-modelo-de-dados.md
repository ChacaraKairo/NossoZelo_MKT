# API de Validação de Documentos — Modelo de Dados

## Objetivo do modelo

Registrar documentos enviados, resultados de validação, revisão manual e histórico operacional sem expor arquivos privados ou dados sensíveis diretamente em logs e respostas públicas.

## Alterações sugeridas em `usuarios`

Adicionar campos de status ao usuário/prestador.

```prisma
model usuarios {
  // campos existentes...

  documentos_status    String @default("nao_enviado") @db.VarChar(40)
  identidade_status    String @default("nao_iniciada") @db.VarChar(40)
  profissional_status  String @default("nao_aplicavel") @db.VarChar(40)
  perfil_completo      Boolean @default(false)
  documentos_revisados_em DateTime? @db.Timestamp(0)
}
```

Observação: se o projeto preferir manter compatibilidade com enums MySQL, criar enums controlados no Prisma. Para menor risco inicial, `String` com validação por Zod no service pode ser suficiente.

## Tabela `documentos_verificacao`

Armazena cada documento enviado.

```prisma
model documentos_verificacao {
  id                Int      @id @default(autoincrement())
  usuario_id        String   @db.VarChar(20)
  tipo_documento    String   @db.VarChar(60)
  arquivo_chave     String   @db.VarChar(255)
  arquivo_nome      String?  @db.VarChar(255)
  mime_type         String?  @db.VarChar(100)
  tamanho_bytes     Int?
  status            String   @default("enviado") @db.VarChar(40)
  provedor          String?  @db.VarChar(60)
  provider_request_id String? @db.VarChar(120)
  score             Decimal? @db.Decimal(5, 2)
  motivo_recusa     String?  @db.Text
  dados_extraidos   Json?
  resultado_resumo  Json?
  criado_em         DateTime @default(now()) @db.Timestamp(0)
  atualizado_em     DateTime @updatedAt @db.Timestamp(0)
  validado_em       DateTime? @db.Timestamp(0)
  expirado_em       DateTime? @db.Timestamp(0)

  usuarios usuarios @relation(fields: [usuario_id], references: [id], onDelete: Cascade, onUpdate: NoAction)

  @@index([usuario_id])
  @@index([status])
  @@index([tipo_documento])
  @@index([provider_request_id])
}
```

## Tabela `verificacoes_identidade`

Armazena o resultado consolidado da verificação de identidade.

```prisma
model verificacoes_identidade {
  id                    Int      @id @default(autoincrement())
  usuario_id             String   @db.VarChar(20)
  status                 String   @default("em_analise") @db.VarChar(40)
  provedor               String?  @db.VarChar(60)
  provider_request_id    String?  @db.VarChar(120)
  cpf_validado           Boolean  @default(false)
  nome_validado          Boolean  @default(false)
  nascimento_validado    Boolean  @default(false)
  documento_validado     Boolean  @default(false)
  face_match_validado    Boolean  @default(false)
  liveness_validado      Boolean  @default(false)
  score_geral            Decimal? @db.Decimal(5, 2)
  motivo                 String?  @db.Text
  resultado_resumo       Json?
  criado_em              DateTime @default(now()) @db.Timestamp(0)
  atualizado_em          DateTime @updatedAt @db.Timestamp(0)
  finalizado_em          DateTime? @db.Timestamp(0)

  usuarios usuarios @relation(fields: [usuario_id], references: [id], onDelete: Cascade, onUpdate: NoAction)

  @@index([usuario_id])
  @@index([status])
  @@index([provider_request_id])
}
```

## Tabela `revisoes_documentos`

Registra decisões administrativas.

```prisma
model revisoes_documentos {
  id              Int      @id @default(autoincrement())
  usuario_id      String   @db.VarChar(20)
  documento_id    Int?
  admin_id        String?  @db.VarChar(20)
  decisao         String   @db.VarChar(40)
  motivo          String?  @db.Text
  dados_anteriores Json?
  dados_novos      Json?
  criado_em       DateTime @default(now()) @db.Timestamp(0)

  usuarios usuarios @relation(fields: [usuario_id], references: [id], onDelete: Cascade, onUpdate: NoAction)

  @@index([usuario_id])
  @@index([documento_id])
  @@index([admin_id])
  @@index([decisao])
}
```

## Tipos de documento

Valores iniciais recomendados:

```text
identidade_frente
identidade_verso
cpf
cnh
selfie
comprovante_profissional
coren
certificado_curso
outro
```

## Dados que não devem ser salvos diretamente

Não salvar no banco:

- documento em base64;
- selfie em base64;
- imagem binária;
- token do provedor;
- resposta bruta sensível sem sanitização;
- CPF completo em logs de auditoria abertos;
- URL pública de documento privado.

## Dados permitidos

Pode salvar:

- chave interna do arquivo;
- tipo de documento;
- status;
- score;
- provedor;
- request id do provedor;
- resumo sanitizado;
- dados extraídos necessários para decisão;
- motivo de recusa;
- histórico de revisão.

## Relação com tabela atual `documentos_cuidadores`

O projeto já possui estrutura relacionada a documentos de cuidadores. A nova tabela deve ser planejada para não quebrar o fluxo atual.

Opções:

1. Evoluir a tabela existente `documentos_cuidadores`.
2. Criar `documentos_verificacao` como camada nova e migrar gradualmente.

Recomendação para menor risco:

```text
Criar `documentos_verificacao` e manter compatibilidade temporária com `documentos_cuidadores`.
```

Depois de validar o novo fluxo, planejar migração e remoção de redundância.
