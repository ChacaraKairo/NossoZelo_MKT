# Roteiro de teste manual do MVP

## Cenario 1 - Cliente

1. Criar conta cliente.
2. Aceitar termos.
3. Confirmar e-mail.
4. Fazer login.
5. Buscar prestador ativo.
6. Abrir perfil do prestador.
7. Solicitar servico para data futura.
8. Ver solicitacao no historico.
9. Cancelar solicitacao pendente.
10. Criar nova solicitacao.
11. Aguardar aceite do prestador.
12. Ver status confirmado.
13. Tentar avaliar antes do horario final e confirmar bloqueio.
14. Alterar data/hora no ambiente de teste ou usar seed de contratacao passada.
15. Avaliar prestador.
16. Confirmar que segunda avaliacao e bloqueada.

## Cenario 2 - Prestador

1. Criar conta prestador.
2. Aceitar termos.
3. Confirmar e-mail.
4. Completar perfil profissional.
5. Escolher plano.
6. Gerar cobranca de assinatura.
7. Simular webhook Asaas confirmado.
8. Confirmar que aparece na busca.
9. Receber solicitacao.
10. Aceitar solicitacao.
11. Cancelar uma contratacao confirmada com motivo.
12. Finalizar uma contratacao passada.
13. Avaliar cliente.
14. Confirmar que segunda avaliacao e bloqueada.

## Cenario 3 - Bloqueios

1. Prestador sem assinatura nao aparece na busca.
2. Prestador aguardando pagamento nao aparece na busca.
3. Prestador ativo aparece.
4. Cliente sem e-mail confirmado nao solicita servico.
5. Usuario externo nao ve contratacao alheia.
6. Usuario externo nao avalia contratacao alheia.
7. Contratacao cancelada nao permite avaliacao.
8. Contratacao nao realizada nao permite avaliacao.

## Cenario 4 - Paginas legais

1. Abrir `/termos-de-uso`.
2. Abrir `/politica-de-privacidade/nossozelo`.
3. Abrir `/politica-de-cookies`.
4. Abrir `/politica-de-cancelamento`.
5. Confirmar links no footer.
6. Confirmar que textos dizem que pagamento do servico e direto entre cliente e prestador.
