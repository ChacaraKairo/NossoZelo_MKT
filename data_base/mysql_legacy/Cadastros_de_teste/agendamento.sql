INSERT INTO contratacoes (
  cliente_id, prestador_id, tipo_prestador,
  data, hora_inicio, hora_fim, preco, observacoes
) VALUES (
  'C-iFE5PBjC8WhJ5sEb9t', '26KZl9Byh3EjetvaMt6R', 'cuidador',
  '2025-07-30', '08:00:00', '10:00:00', 150.00, 'Observações de teste'
);

SELECT * FROM agenda WHERE prestador_id = '26KZl9Byh3EjetvaMt6R';
