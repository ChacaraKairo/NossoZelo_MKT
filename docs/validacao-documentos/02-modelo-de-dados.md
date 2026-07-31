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
  tipo_documento_id Int?
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

## Catálogo `tipos_documentos`

Implementado como catálogo interno oficial. Ele define quais documentos existem, quem precisa enviar, campos esperados, regras de validação, validade, nível de risco, se exige revisão manual e se bloqueia a busca.

O sistema não usa modelos visuais de RG/CNH e não deve armazenar imagens de exemplo copiáveis. Para teste, usar arquivos fictícios claramente marcados como sem valor documental.

Campos principais:

```text
codigo
nome
descricao
categoria
obrigatorio_cuidador
obrigatorio_enfermeiro
obrigatorio_acompanhante
obrigatorio_baba
obrigatorio_diarista
obrigatorio_motorista_assistencial
obrigatorio_busca
requer_upload
exige_frente
exige_verso
exige_selfie
exige_validade
exige_numero_documento
exige_orgao_emissor
exige_uf_emissor
exige_data_emissao
exige_revisao_manual
permite_pdf
permite_imagem
tamanho_maximo_mb
validade_dias
nivel_risco
provider_sugerido
campos_esperados
regras_validacao
ativo
```

Catálogo inicial:

```text
documento_identidade
cpf
cnh
selfie
comprovante_residencia
antecedentes_criminais_pf
antecedentes_criminais_estadual
coren
certificado_curso
comprovante_experiencia
documento_profissional
termo_responsabilidade
```

Obrigatórios para busca no MVP:

- Todos os prestadores: documento de identidade, CPF, selfie, comprovante de residência e antecedentes criminais PF.
- Enfermeiro: COREN.
- Motorista assistencial: CNH.
- Certificado, experiência, documento profissional complementar e certidão estadual ficam no catálogo, mas não bloqueiam a busca por padrão.
- Termo de responsabilidade fica no catálogo como aceite digital futuro; não exige upload e não bloqueia a busca nesta primeira versão.

## Tabela `documentos_campos_extraidos`

Armazena campos obtidos por OCR/API futuramente, sem acoplar o documento a um provider específico.

```prisma
model documentos_campos_extraidos {
  id           Int      @id @default(autoincrement())
  documento_id Int
  campo        String   @db.VarChar(80)
  valor        String?  @db.Text
  valor_mascarado String? @db.Text
  confianca    Decimal? @db.Decimal(5, 2)
  origem       String?  @db.VarChar(40)
  criado_em    DateTime @default(now()) @db.Timestamp(0)
}
```

## Tabela `documentos_analises`

Registra a esteira de análise automática/manual por documento. A primeira versão cria sinal amarelo quando OCR/provider externo ainda não está configurado; a estrutura já permite evoluir para OCR, regras e KYC.

```prisma
model documentos_analises {
  id                  Int      @id @default(autoincrement())
  documento_id         Int
  usuario_id           String   @db.VarChar(20)
  tipo_detectado       String?  @db.VarChar(80)
  sinal                String   @db.VarChar(20)
  score                Decimal? @db.Decimal(5, 2)
  status               String   @db.VarChar(40)
  arquivo_legivel      Boolean  @default(false)
  tipo_confere         Boolean  @default(false)
  nome_confere         Boolean  @default(false)
  cpf_confere          Boolean  @default(false)
  validade_confere     Boolean?
  precisa_revisao      Boolean  @default(true)
  dados_extraidos      Json?
  validacoes           Json?
  pendencias           Json?
  motivo               String?  @db.Text
  provider             String?  @db.VarChar(80)
  provider_request_id  String?  @db.VarChar(120)
  criado_em            DateTime @default(now()) @db.Timestamp(0)
  atualizado_em        DateTime @updatedAt @db.Timestamp(0)
}
```

Sinais:

```text
verde = aprovado automaticamente apenas quando provider/OCR e regras forem confiáveis
amarelo = precisa revisão manual
vermelho = recusado ou inconsistente
```

## Tabela `tipos_documentos_regras`

Permite versionar e ativar/desativar regras sem espalhar decisões no código.

```prisma
model tipos_documentos_regras {
  id                 Int     @id @default(autoincrement())
  tipo_documento_id  Int
  codigo             String  @db.VarChar(80)
  descricao          String  @db.Text
  severidade         String  @default("ERRO") @db.VarChar(20)
  ativo              Boolean @default(true)
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

Valores legados substituídos pelo catálogo:

```text
identidade_frente -> documento_identidade
identidade_verso -> documento_identidade com exige_verso=true
comprovante_profissional -> documento_profissional
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
