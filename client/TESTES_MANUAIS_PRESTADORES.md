# Testes manuais - Prestadores e busca

1. Abrir `/`.
   - Categorias devem aparecer com visual profissional.
   - Clicar em `Cuidador` deve navegar para `/prestadores?tipo=cuidador`.

2. Abrir `/prestadores?tipo=enfermeiro`.
   - Filtro de enfermeiro deve ficar ativo.
   - A busca deve usar dados reais da API.

3. Alterar localização, serviço, distância e preço.
   - Busca deve refazer com debounce.
   - URL deve refletir os filtros principais.
   - Logs devem usar `[NOSSOZELO-FRONT]`.

4. Sem resultados.
   - Deve mostrar estado vazio profissional.
   - Botão `Limpar filtros` deve limpar busca e filtros.
   - Botão `Aumentar distância` deve ampliar o raio.

5. Erro de API.
   - Deve mostrar erro com botão `Tentar novamente`.
   - Retry deve refazer a chamada real.

6. Clicar em um card.
   - Deve navegar para `/prestador/[id]`.

7. Clicar em `Contratar`.
   - Deve navegar para `/prestador/[id]?acao=contratar`.
   - A vitrine deve abrir o modal.
   - O modal deve chamar API real e não simular sucesso.

8. Mobile.
   - Header não deve gerar overflow horizontal.
   - Filtro deve abrir pelo botão mobile.
   - Cards devem ocupar a largura disponível.

9. Build.
   - Rodar `npm run lint`.
   - Rodar `npm run build`.
