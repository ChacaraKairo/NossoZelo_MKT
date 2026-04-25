# Testes manuais - Perfil, vitrine e dashboard

1. Acessar `/perfil` logado como cliente.
   - Deve renderizar `PerfilCliente`.
   - Deve mostrar dados pessoais.
   - Não deve mostrar campos profissionais.

2. Acessar `/perfil` logado como cuidador, enfermeiro ou acompanhante.
   - Deve renderizar `PerfilPrestador`.
   - Deve mostrar dados profissionais.
   - Deve mostrar agenda, serviços e avaliações quando vierem da API.

3. Editar perfil cliente.
   - Deve chamar `PATCH /perfil/update`.
   - Campos protegidos não devem ser enviados.
   - Tela deve atualizar com a resposta real.

4. Editar perfil prestador.
   - Dados comuns e profissionais devem ser enviados corretamente.
   - Tela deve atualizar com a resposta real.

5. Acessar `/prestador/[id]`.
   - Deve buscar vitrine real.
   - Não deve mostrar contato privado sem liberação.
   - Botão contratar deve abrir modal de solicitação.

6. Solicitar contratação.
   - Deve chamar endpoint real via `contratacaoService`.
   - Se endpoint falhar, deve mostrar erro real da API.
   - Não deve simular sucesso.

7. Prestador vê solicitações.
   - Deve listar solicitações reais do perfil.
   - Aceitar/negar deve chamar API real.
   - Erro do backend deve aparecer na tela.

8. Erro 401.
   - Deve remover token.
   - Deve redirecionar para `/login-user`.

9. Logs.
   - Console deve mostrar logs com `[NOSSOZELO-FRONT]`.
   - Cada fluxo deve ter contexto claro.
