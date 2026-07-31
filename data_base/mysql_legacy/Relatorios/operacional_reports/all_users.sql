SELECT 
    id, 
    nome, 
    email, 
    cpf, 
    genero, 
    tipo, 
    criado_em 
FROM usuarios
WHERE criado_em BETWEEN '2024-01-01' AND '2024-12-31' 
ORDER BY criado_em DESC;
