# Checklist de aceite do MVP NossoZelo

## 1. Cadastro e autenticacao

- [ ] Cliente consegue criar conta.
- [ ] Prestador consegue criar conta.
- [ ] Cadastro exige aceite dos Termos de Uso e Politica de Privacidade.
- [ ] Sistema registra versao e data do aceite.
- [ ] Usuario recebe confirmacao de e-mail.
- [ ] Usuario consegue confirmar e-mail.
- [ ] Usuario consegue fazer login.
- [ ] Usuario consegue sair da conta.
- [ ] Rotas privadas bloqueiam usuario nao autenticado.

## 2. Onboarding do prestador

- [ ] Prestador sem e-mail confirmado e direcionado para confirmar e-mail.
- [ ] Prestador sem dados profissionais e direcionado para completar perfil.
- [ ] Prestador sem assinatura e direcionado para escolher plano.
- [ ] Prestador consegue gerar cobranca de assinatura.
- [ ] Prestador aguardando pagamento nao aparece na busca.
- [ ] Webhook de pagamento confirmado ativa assinatura.
- [ ] Prestador com assinatura ativa aparece na busca.
- [ ] Prestador com assinatura cancelada ou inadimplente nao aparece na busca.

## 3. Busca e perfil publico

- [ ] Cliente consegue buscar prestadores ativos.
- [ ] Prestador inativo nao aparece na busca.
- [ ] Cliente consegue abrir perfil publico do prestador.
- [ ] Dados sensiveis nao sao expostos indevidamente.
- [ ] Cliente consegue ver servicos oferecidos.

## 4. Agendamento

- [ ] Cliente consegue solicitar servico.
- [ ] Sistema impede cliente de solicitar para si mesmo.
- [ ] Sistema impede horario conflitante.
- [ ] Prestador recebe solicitacao.
- [ ] Prestador aceita solicitacao.
- [ ] Prestador recusa solicitacao.
- [ ] Cliente cancela solicitacao pendente.
- [ ] Cliente cancela contratacao confirmada antes do inicio.
- [ ] Prestador cancela contratacao confirmada antes do inicio.
- [ ] Cancelamento pede motivo.
- [ ] Cancelamento nao mostra multa, reembolso ou cobranca da plataforma.
- [ ] Cancelamento tardio e registrado sem custo.

## 5. Servico

- [ ] Servico confirmado pode ser finalizado.
- [ ] Servico passado pode liberar avaliacao.
- [ ] Servico cancelado nao pode ser avaliado.
- [ ] Servico marcado como nao realizado nao pode ser avaliado.

## 6. Avaliacoes

- [ ] Cliente avalia prestador apos data/hora final.
- [ ] Prestador avalia cliente apos data/hora final.
- [ ] Cliente nao avalia antes do horario final.
- [ ] Prestador nao avalia antes do horario final.
- [ ] Cliente nao avalia duas vezes.
- [ ] Prestador nao avalia duas vezes.
- [ ] Terceiro nao avalia contratacao alheia.
- [ ] Nota aceita apenas 1 a 5.
- [ ] Comentario tem limite de caracteres.
- [ ] Media do prestador e atualizada.

## 7. Paginas legais

- [ ] Termos de Uso existe.
- [ ] Politica de Privacidade existe.
- [ ] Politica de Cookies existe.
- [ ] Politica de Cancelamento existe.
- [ ] Footer contem links legais.
- [ ] Textos deixam claro que pagamento do servico e direto entre cliente e prestador.
- [ ] Textos deixam claro que a plataforma cobra apenas assinatura do prestador.

## 8. Admin minimo

- [ ] Admin acessa painel.
- [ ] Admin ve usuarios.
- [ ] Admin ve prestadores.
- [ ] Admin ve assinaturas.
- [ ] Admin ve agendamentos.
- [ ] Admin ve avaliacoes.
- [ ] Admin consegue bloquear/desbloquear prestador, se ja existir esta funcao.

## 9. Qualidade

- [ ] Backend passa em `npm test`.
- [ ] Backend passa em `npm run build`.
- [ ] Client passa em `npm run lint`.
- [ ] Client passa em `npm run build`.
- [ ] Controlador passa em `npm run lint`.
- [ ] Controlador passa em `npm run build`.
