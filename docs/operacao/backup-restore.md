# Backup e restore

## Backup

Execute a partir de `server`:

```bash
npm run db:backup
```

Requisitos:

- `DATABASE_URL` apontando para o banco correto.
- Destino de backup fora da maquina da aplicacao.
- Retencao definida por ambiente.

Antes de deploy com migration destrutiva, gere um backup manual e registre horario, branch e hash do commit.

## Restore

Restore deve ser manual e confirmado por responsavel tecnico.

```bash
npm run db:restore
```

Antes de restaurar:

1. Congelar escrita da aplicacao, se possivel.
2. Confirmar ambiente alvo.
3. Confirmar timestamp do backup.
4. Confirmar impacto em webhooks pendentes.
5. Executar restore.
6. Rodar health check.
7. Rodar uma consulta de smoke test em usuarios, planos, assinaturas e eventos_assinatura.

## Ensaio

Faca ensaio de restore em banco de homologacao pelo menos uma vez antes de operar em producao. Sem ensaio, o backup ainda nao deve ser considerado recuperavel.

