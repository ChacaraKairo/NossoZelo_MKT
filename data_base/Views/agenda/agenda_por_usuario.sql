CREATE OR REPLACE VIEW view_agenda_cuidadores AS
SELECT 
    u.id AS cuidador_id,
    u.nome AS nome_cuidador,
    u.email,
    a.data,
    a.hora_inicio,
    a.hora_fim,
    a.status
FROM agenda a
JOIN usuarios u ON u.id = a.cuidador_id
WHERE u.tipo = 'cuidador'
ORDER BY a.data, a.hora_inicio;
