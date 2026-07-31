# API de Validação de Documentos — Fluxo e Status

## Fluxo geral

```text
1. Usuário cria conta
2. Usuário confirma e-mail
3. Prestador preenche perfil profissional
4. Prestador envia documentos obrigatórios
5. Backend valida arquivo
6. Documento entra em validação
7. Sistema pode enviar para provedor externo, quando configurado
8. Sistema classifica resultado
9. Admin revisa casos duvidosos no controlador
10. Cadastro é aprovado, recusado ou permanece pendente
11. Prestador aprovado pode aparecer na busca se também tiver assinatura ativa
```

## Status de documento

Campo sugerido:

```text
documentos_status
```

Valores:

```text
nao_enviado
```

Nenhum documento obrigatório foi enviado.

```text
enviado
```

Documento recebido pelo backend, mas ainda não processado.

```text
em_validacao
```

Documento em validação interna ou externa.

```text
aprovado
```

Documento aprovado.

```text
pendente_revisao
```

Documento precisa de análise manual no controlador.

```text
recusado
```

Documento recusado por inconsistência, baixa qualidade, divergência ou suspeita.

```text
expirado
```

Documento perdeu validade ou precisa ser reenviado.

## Status de identidade

Campo sugerido:

```text
identidade_status
```

Valores:

```text
nao_iniciada
em_analise
aprovada
divergente
reprovada
```

## Status profissional

Campo sugerido:

```text
profissional_status
```

Valores:

```text
nao_aplicavel
pendente
em_analise
aprovado
recusado
```

## Tipos de prestador e documentos mínimos

### Cuidador

Documentos mínimos:

- documento de identidade;
- CPF;
- comprovante/certificado opcional, quando informado no perfil.

Validação profissional:

```text
profissional_status = nao_aplicavel
```

ou

```text
profissional_status = pendente
```

se houver certificado informado que precise ser revisado.

### Enfermeiro

Documentos mínimos:

- documento de identidade;
- CPF;
- COREN;
- documento profissional ou comprovante de registro.

Validação profissional:

```text
profissional_status = pendente | em_analise | aprovado | recusado
```

### Acompanhante

Documentos mínimos:

- documento de identidade;
- CPF.

Validação profissional:

```text
profissional_status = nao_aplicavel
```

## Regras de liberação para busca

O prestador só deve aparecer na busca pública quando todas as condições forem verdadeiras:

```text
email_confirmado = true
perfil_profissional_completo = true
documentos_status = aprovado
identidade_status = aprovada
profissional_status in (aprovado, nao_aplicavel)
assinatura.status = ativa
usuarios.status_cadastro = ativo
```

## Função de regra central

A regra não deve ficar espalhada em várias rotas.

Criar uma função central no backend:

```ts
export function prestadorPodeAparecerNaBusca(prestador: PrestadorElegibilidade): boolean {
  return (
    prestador.emailConfirmado === true &&
    prestador.perfilCompleto === true &&
    prestador.documentosStatus === "aprovado" &&
    prestador.identidadeStatus === "aprovada" &&
    ["aprovado", "nao_aplicavel"].includes(prestador.profissionalStatus) &&
    prestador.assinaturaStatus === "ativa" &&
    prestador.statusCadastro === "ativo"
  );
}
```

## Aprovação automática

Aprovar automaticamente apenas quando todas as condições forem fortes:

```text
arquivo válido
+ documento legível
+ CPF válido
+ nome compatível com cadastro
+ data de nascimento compatível, se existir
+ documento profissional válido, quando obrigatório
+ score >= 85
```

## Revisão manual

Enviar para revisão manual quando:

```text
score entre 60 e 84
nome parecido, mas não idêntico
imagem ruim
OCR incompleto
dados parcialmente divergentes
documento profissional precisa de conferência humana
```

## Recusa automática

Recusar automaticamente apenas em casos claros:

```text
CPF inválido
documento obrigatório ausente
arquivo inválido
documento claramente adulterado
score < 60
provedor externo retornou fraude confirmada
```

## Observação importante

O marketplace envolve serviço de cuidado e saúde. Por isso, a API deve reduzir risco, mas não deve substituir totalmente a revisão humana em casos duvidosos.
