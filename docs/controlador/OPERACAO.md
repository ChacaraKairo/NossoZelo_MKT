# Controlador - operacao

## Rotina diaria

- Verificar dashboard.
- Revisar pendencias.
- Conferir assinaturas aguardando confirmacao.
- Conferir assinaturas expiradas.
- Verificar logs administrativos recentes.
- Confirmar se jobs automaticos executaram.

## Rotina semanal

- Revisar usuarios bloqueados.
- Revisar prestadores sem dados profissionais.
- Revisar planos ativos.
- Conferir eventos de webhook Asaas.
- Conferir falhas de job no provedor.

## Incidentes comuns

### Admin nao consegue entrar

Verificar:

- `JWT_ADMIN_SECRET` existe e tem 32+ caracteres.
- Usuario existe em `usuarios`.
- `usuarios.tipo` e `admin`.
- Senha esta correta.
- Cookie nao esta bloqueado pelo navegador.
- Dominio usa HTTPS em producao.

### API retorna 401

Significa ausencia ou invalidade de sessao.

Acao:

- refazer login;
- conferir se cookie `controlador_session` foi gravado;
- conferir se o admin ainda existe no banco.

### Mutacao retorna 403 por origem

Significa que `Origin` ou `Referer` nao bateu com origens autorizadas.

Acao:

- conferir `CONTROLADOR_PUBLIC_URL`;
- conferir dominio real acessado;
- configurar `ADMIN_ALLOWED_ORIGINS` somente se houver proxy/domino adicional legitimo.

### Cron retorna 401

Significa `CRON_SECRET` ausente, fraco ou header incorreto.

Header esperado:

```http
Authorization: Bearer <CRON_SECRET>
```

### Webhook Asaas retorna 401

Significa token Asaas invalido.

Verificar:

- header `asaas-access-token`;
- valor de `ASAAS_WEBHOOK_TOKEN`;
- token com 32+ caracteres;
- ambiente sandbox/producao correto.

## Acoes sensiveis

Tratadas como sensiveis:

- criar admin;
- liberar prestador;
- bloquear usuario/prestador;
- alterar status de assinatura;
- reprocessar assinatura;
- ativar/desativar plano;
- confirmar e-mail manualmente.

Todas devem deixar log administrativo quando alteram estado.

## Evidencias para auditoria

Registrar:

- data/hora;
- admin responsavel;
- tabela afetada;
- acao;
- motivo operacional;
- antes/depois quando a acao envolver status financeiro.

## Recomendacoes para proxima camada

- MFA para admin.
- VPN ou allowlist de IP.
- rate limit distribuido.
- trilha de auditoria com payload resumido antes/depois.
- alertas de login falho.
- backup diario testado com restore em homologacao.
