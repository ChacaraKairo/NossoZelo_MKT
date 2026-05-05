# Politicas operacionais minimas

Este documento define o minimo para um MVP controlado. Antes de lancamento publico, deve ser revisado por responsavel juridico e operacional.

## Validacao de prestadores

- Prestador so deve aparecer na busca quando tiver e-mail confirmado, perfil profissional completo, assinatura ativa e revisao documental aprovada.
- Documentos minimos: identidade, comprovante/registro profissional quando aplicavel, certificado ou experiencia declarada, antecedentes quando a politica comercial exigir.
- Admin deve registrar decisao de aprovacao, reprovacao ou pendencia.
- Prestadores bloqueados nao aparecem em busca e nao recebem pedidos.

## Suporte

- Canal minimo: e-mail ou WhatsApp operacional com SLA declarado.
- Todo problema deve receber protocolo interno.
- Casos envolvendo risco a pessoas, fraude, documento falso, cobranca indevida ou assedio devem ter prioridade alta.

## Denuncia e moderacao

- Clientes e prestadores podem denunciar conduta inadequada, falta, perfil falso, cobranca fora da plataforma, documento suspeito ou risco fisico.
- Admin pode suspender perfil enquanto analisa a denuncia.
- Denuncias devem manter historico, status, responsavel e decisao final.

## Cancelamento

- Definir janela minima para cancelamento sem penalidade.
- Cancelamentos proximos ao horario do servico devem seguir regra clara para cliente e prestador.
- Reincidencia de faltas ou cancelamentos abusivos pode gerar bloqueio.

## Reembolso e disputa

- Enquanto nao houver pagamento por servico dentro da plataforma, reembolso se aplica apenas a assinatura de prestador conforme politica do gateway e regra comercial.
- Quando pagamento por servico for habilitado, criar fluxo de disputa antes de qualquer split/repasse automatico.
- Chargeback, fraude ou risco a usuario deve bloquear repasse ate revisao manual.

## LGPD e retencao

- Coletar apenas dados necessarios para cadastro, verificacao, assinatura, agendamento e suporte.
- Definir prazo de retencao para documentos privados.
- Registrar base operacional para acesso, correcao e exclusao de dados.
- Logs nao devem conter senha, token, numero completo de cartao, CVV, documentos completos ou payload financeiro sensivel.

## Criterio de MVP controlado

- 5 a 10 prestadores verificados manualmente.
- Regiao unica.
- Suporte humano ativo.
- Webhook Asaas validado em sandbox.
- Backup/restore testado.
- Fluxo E2E validado antes de aceitar usuario externo.
