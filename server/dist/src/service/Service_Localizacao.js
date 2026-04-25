"use strict";
/**
 * @author Kairo Chácara
 * @version 1.0
 * @date 14/04/2026
 * @description Classe de serviço responsável por operações de geoprocessamento, geocodificação via APIs externas
 * (Nominatim e ViaCEP) e cálculos de proximidade geográfica utilizando fórmulas de trigonometria esférica.
 * @rota server\src\service\Service_Localizacao.ts
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeolocalizacaoService = void 0;
const client_1 = require("@prisma/client");
console.log('[LOG-FLUXO] Inicializando PrismaClient para o GeolocalizacaoService.');
const prisma = new client_1.PrismaClient();
class GeolocalizacaoService {
    static userAgent = 'SeuApp/1.0 (seuemail@exemplo.com)';
    static EARTH_RADIUS_KM = 6371;
    /**
     * Gera o fragmento SQL para cálculo de distância usando a Fórmula de Haversine.
     * @param {number} lat - Latitude de origem.
     * @param {number} lon - Longitude de origem.
     * @returns {any} - Fragmento SQL compatível com Prisma.sql.
     */
    static getSqlDistancia(lat, lon) {
        console.log(`[LOG-FLUXO] Gerando fragmento SQL de distância para Lat: ${lat}, Lon: ${lon}`);
        return client_1.Prisma.sql `
      (${this.EARTH_RADIUS_KM} * ACOS(
        COS(RADIANS(${lat})) *
        COS(RADIANS(l.latitude)) *
        COS(RADIANS(l.longitude) - RADIANS(${lon})) +
        SIN(RADIANS(${lat})) *
        SIN(RADIANS(l.latitude))
      ))
    `;
    }
    /**
     * Recupera as coordenadas geográficas de um usuário na base de dados.
     * @param {string} usuarioId - UUID/ID do usuário.
     * @returns {Promise<Coordenadas>} - Latitude e longitude do usuário.
     * @throws {Error} - Lança erro caso o registro de localização seja inexistente.
     */
    static async obterLocalizacaoUsuario(usuarioId) {
        console.log(`[LOG-FLUXO] Iniciando obterLocalizacaoUsuario para o ID: ${usuarioId}`);
        try {
            console.log(`[LOG-FLUXO] Consultando tabela 'localizacoes' para o usuário: ${usuarioId}`);
            const loc = await prisma.localizacoes.findUnique({
                where: { usuario_id: usuarioId },
            });
            if (!loc) {
                console.error(`[ERRO-FLUXO] Localização não encontrada para o usuário: ${usuarioId}.`);
                throw new Error('Localização do usuário não encontrada.');
            }
            console.log(`[LOG-FLUXO] Localização recuperada: Lat ${loc.latitude}, Lon ${loc.longitude}`);
            return {
                latitude: Number(loc.latitude),
                longitude: Number(loc.longitude),
            };
        }
        catch (error) {
            console.error(`[ERRO-FLUXO] Falha ao obter localização do usuário ${usuarioId}. Detalhes Técnicos: ${error.message}`);
            throw error;
        }
    }
    // --- MÉTODOS DE GEOCODIFICAÇÃO ---
    /**
     * Converte um CEP em coordenadas geográficas utilizando um fluxo resiliente de múltiplas tentativas.
     * @param {string} cep - CEP brasileiro (com ou sem formatação).
     * @returns {Promise<Coordenadas>} - Objeto contendo latitude e longitude.
     * @throws {Error} - Lança erro se todas as estratégias de busca falharem.
     */
    static async buscarCoordenadasPorCep(cep) {
        const cepLimpo = cep.replace(/\D/g, '');
        console.log(`[LOG-FLUXO] Iniciando busca de coordenadas para o CEP: ${cepLimpo}`);
        try {
            console.log('[LOG-FLUXO] Tentativa 1: Busca direta via Nominatim (OpenStreetMap).');
            const coordenadasDiretas = await this.buscarPorCepNoNominatim(cepLimpo);
            if (coordenadasDiretas) {
                console.log('[LOG-FLUXO] Coordenadas encontradas na primeira tentativa (Nominatim).');
                return coordenadasDiretas;
            }
            console.log('[LOG-FLUXO] Tentativa 1 falhou. Tentativa 2: Buscando endereço via ViaCEP para enriquecimento.');
            const endereco = await this.buscarEnderecoViaCep(cepLimpo);
            console.log(`[LOG-FLUXO] Endereço recuperado do ViaCEP: ${endereco.logradouro}, ${endereco.localidade}`);
            console.log('[LOG-FLUXO] Tentando geocodificar o endereço retornado pelo ViaCEP...');
            const coordenadasEndereco = await this.buscarPorEndereco(endereco);
            if (coordenadasEndereco) {
                console.log('[LOG-FLUXO] Coordenadas encontradas via geocodificação de endereço.');
                return coordenadasEndereco;
            }
            console.log('[LOG-FLUXO] Tentativa 2 falhou. Tentativa 3: Busca genérica por Cidade/Estado.');
            const cidadeEstado = `${endereco.localidade}, ${endereco.uf}, Brasil`;
            const coordenadasCidade = await this.buscarPorEndereco(cidadeEstado);
            if (coordenadasCidade) {
                console.log('[LOG-FLUXO] Coordenadas aproximadas encontradas via Cidade/Estado.');
                return coordenadasCidade;
            }
            console.error('[ERRO-FLUXO] Todas as tentativas de geocodificação falharam para o CEP informado.');
            throw new Error('Coordenadas não encontradas.');
        }
        catch (erro) {
            console.error(`[ERRO-FLUXO] Falha crítica no fluxo de geocodificação do CEP ${cepLimpo}. Detalhes: ${erro.message || erro}`);
            throw new Error(`Erro ao buscar coordenadas: ${erro}`);
        }
    }
    /**
     * Realiza busca de CEP diretamente na API do Nominatim.
     * @param {string} cep - CEP numérico.
     */
    static async buscarPorCepNoNominatim(cep) {
        const url = `https://nominatim.openstreetmap.org/search?postalcode=${cep}&country=Brazil&format=json`;
        console.log(`[LOG-FLUXO] Chamada externa Nominatim (CEP): ${url}`);
        try {
            const resposta = await fetch(url, {
                headers: { 'User-Agent': this.userAgent },
            });
            const dados = await resposta.json();
            if (dados && dados.length > 0) {
                console.log(`[LOG-FLUXO] Nominatim retornou dados para o CEP ${cep}.`);
                return {
                    latitude: parseFloat(dados[0].lat),
                    longitude: parseFloat(dados[0].lon),
                };
            }
            console.log(`[LOG-FLUXO] Nominatim não retornou resultados para o CEP ${cep}.`);
            return null;
        }
        catch (error) {
            console.error(`[ERRO-FLUXO] Erro na API Nominatim (Busca CEP): ${error.message}`);
            return null;
        }
    }
    /**
     * Consulta os dados de endereço em texto via ViaCEP.
     * @param {string} cep - CEP numérico.
     */
    static async buscarEnderecoViaCep(cep) {
        const url = `https://viacep.com.br/ws/${cep}/json/`;
        console.log(`[LOG-FLUXO] Chamada externa ViaCEP: ${url}`);
        try {
            const resposta = await fetch(url);
            const dados = await resposta.json();
            if (dados.erro) {
                console.error(`[ERRO-FLUXO] ViaCEP retornou erro para o CEP: ${cep}.`);
                throw new Error('CEP não encontrado.');
            }
            console.log(`[LOG-FLUXO] Dados do CEP ${cep} recuperados do ViaCEP.`);
            return dados;
        }
        catch (error) {
            console.error(`[ERRO-FLUXO] Falha na comunicação com ViaCEP: ${error.message}`);
            throw error;
        }
    }
    /**
     * Geocodifica uma string de endereço ou objeto de endereço.
     * @param {string | any} endereco - Texto ou objeto de endereço.
     */
    static async buscarPorEndereco(endereco) {
        const query = typeof endereco === 'string'
            ? endereco
            : `${endereco.logradouro}, ${endereco.bairro}, ${endereco.localidade}, ${endereco.uf}, Brasil`;
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json`;
        console.log(`[LOG-FLUXO] Chamada externa Nominatim (Endereço): ${url}`);
        try {
            const resposta = await fetch(url, {
                headers: { 'User-Agent': this.userAgent },
            });
            const dados = await resposta.json();
            if (dados && dados.length > 0) {
                console.log(`[LOG-FLUXO] Nominatim localizou coordenadas para o endereço.`);
                return {
                    latitude: parseFloat(dados[0].lat),
                    longitude: parseFloat(dados[0].lon),
                };
            }
            console.log('[LOG-FLUXO] Nominatim não retornou resultados para o endereço especificado.');
            return null;
        }
        catch (error) {
            console.error(`[ERRO-FLUXO] Erro na API Nominatim (Busca Endereço): ${error.message}`);
            return null;
        }
    }
    // --- MÉTODOS DE BUSCA NO BANCO ---
    /**
     * Realiza busca dinâmica de prestadores com múltiplos filtros e cálculo de raio opcional.
     * @param {object} params - Parâmetros de filtro (idUsuario, nome, localizacao, tipo, raioKm, precoMax, limit).
     * @returns {Promise<any[]>} - Lista de prestadores encontrados.
     */
    static async buscarPrestadores(params) {
        console.log(`[LOG-FLUXO] Iniciando buscarPrestadores. Filtros recebidos: ${JSON.stringify(params)}`);
        const { idUsuario, nome, localizacao, tipo, raioKm, precoMax, limit = 20, } = params;
        try {
            const tiposPermitidos = [
                'cuidador',
                'enfermeiro',
                'acompanhante',
            ];
            const tipoFiltro = tipo && tiposPermitidos.includes(tipo)
                ? tipo
                : null;
            const conditions = [];
            // Filtro de Tipo
            if (tipoFiltro) {
                console.log(`[LOG-FLUXO] Aplicando filtro de tipo específico: ${tipoFiltro}`);
                conditions.push(client_1.Prisma.sql `u.tipo = ${tipoFiltro}`);
            }
            else {
                console.log('[LOG-FLUXO] Filtro de tipo genérico aplicado para todos os prestadores.');
                conditions.push(client_1.Prisma.sql `u.tipo IN ('cuidador', 'enfermeiro', 'acompanhante')`);
            }
            // Filtro de Nome
            if (nome) {
                console.log(`[LOG-FLUXO] Aplicando filtro de busca por nome: ${nome}`);
                conditions.push(client_1.Prisma.sql `u.nome LIKE ${'%' + nome + '%'}`);
            }
            // Filtro de Localização Textual
            if (localizacao) {
                console.log(`[LOG-FLUXO] Aplicando filtro geográfico textual: ${localizacao}`);
                conditions.push(client_1.Prisma.sql `(u.cidade LIKE ${'%' + localizacao + '%'} OR u.estado LIKE ${'%' + localizacao + '%'})`);
            }
            // Filtro de Preço
            if (precoMax) {
                console.log(`[LOG-FLUXO] Aplicando filtro de teto orçamentário: ${precoMax}`);
                conditions.push(client_1.Prisma.sql `EXISTS (SELECT 1 FROM servicos s WHERE s.prestador_id = u.id AND s.valor <= ${Number(precoMax)})`);
            }
            let selectDistancia = client_1.Prisma.empty;
            let havingClause = client_1.Prisma.empty;
            let orderClause = client_1.Prisma.sql `ORDER BY u.criado_em DESC`;
            // Lógica de Cálculo de Raio Dinâmico
            if (idUsuario && raioKm) {
                console.log(`[LOG-FLUXO] Requisitado filtro por raio (${raioKm}km) baseado na localização do usuário logado: ${idUsuario}`);
                try {
                    const loc = await this.obterLocalizacaoUsuario(idUsuario);
                    selectDistancia = client_1.Prisma.sql `, ${this.getSqlDistancia(loc.latitude, loc.longitude)} AS distancia`;
                    havingClause = client_1.Prisma.sql `HAVING distancia <= ${Number(raioKm)}`;
                    orderClause = client_1.Prisma.sql `ORDER BY distancia ASC`;
                    console.log('[LOG-FLUXO] Parâmetros de distância espacial injetados com sucesso na query SQL.');
                }
                catch (error) {
                    console.warn(`[LOG-FLUXO] Aviso: Cálculo de raio ignorado. Usuário ${idUsuario} não possui geolocalização definida.`);
                }
            }
            const whereClause = conditions.length > 0
                ? client_1.Prisma.sql `WHERE ${client_1.Prisma.join(conditions, ' AND ')}`
                : client_1.Prisma.empty;
            const query = client_1.Prisma.sql `
        SELECT 
          u.id, u.nome, u.tipo, u.url_foto_perfil, u.cidade, u.estado
          ${selectDistancia}
        FROM usuarios u
        LEFT JOIN localizacoes l ON u.id = l.usuario_id
        ${whereClause}
        ${havingClause}
        ${orderClause}
        LIMIT ${Number(limit)};
      `;
            console.log('[LOG-FLUXO] Despachando consulta SQL bruta (queryRaw) ao servidor de banco de dados.');
            const resultados = await prisma.$queryRaw(query);
            console.log(`[LOG-FLUXO] Busca de prestadores concluída. Registros retornados: ${Array.isArray(resultados) ? resultados.length : 0}`);
            return resultados;
        }
        catch (error) {
            console.error(`[ERRO-FLUXO] Falha fatal na execução de buscarPrestadores: ${error.message}`);
            throw error;
        }
    }
    // --- MÉTODOS ADICIONAIS LEGADOS ---
    /**
     * Busca IDs de usuários dentro de um raio específico baseado em um usuário de referência.
     * @param {string} usuarioId - ID do usuário de origem.
     * @param {number} raioKm - Raio em quilômetros.
     */
    static async buscarUsuariosPorRaioPorUsuarioId(usuarioId, raioKm) {
        console.log(`[LOG-FLUXO] Iniciando buscarUsuariosPorRaioPorUsuarioId. Usuário: ${usuarioId}, Raio: ${raioKm}km`);
        try {
            const loc = await this.obterLocalizacaoUsuario(usuarioId);
            console.log('[LOG-FLUXO] Localização base para raio recuperada. Executando query espacial.');
            const usuarios = await prisma.$queryRaw `
        SELECT u.id
        FROM usuarios u
        JOIN localizacoes l ON u.id = l.usuario_id
        WHERE u.tipo IN ('cuidador', 'enfermeiro', 'acompanhante')
        AND ${this.getSqlDistancia(loc.latitude, loc.longitude)} <= ${raioKm};
      `;
            console.log(`[LOG-FLUXO] Finalizado: ${usuarios.length} usuários encontrados no raio de ${raioKm}km.`);
            return usuarios.map((u) => u.id);
        }
        catch (error) {
            console.error(`[ERRO-FLUXO] Falha na busca por raio para o usuário ${usuarioId}: ${error.message}`);
            throw error;
        }
    }
    /**
     * Retorna os 20 usuários mais próximos geograficamente de um usuário.
     * @param {string} usuarioId - ID do usuário de referência.
     */
    static async buscar20UsuariosMaisProximos(usuarioId) {
        console.log(`[LOG-FLUXO] Iniciando buscar20UsuariosMaisProximos para o ID: ${usuarioId}`);
        try {
            const loc = await this.obterLocalizacaoUsuario(usuarioId);
            console.log('[LOG-FLUXO] Calculando matriz de distância para os 20 prestadores mais próximos.');
            const usuariosProximos = await prisma.$queryRaw `
        SELECT u.id, ${this.getSqlDistancia(loc.latitude, loc.longitude)} AS distancia
        FROM usuarios u
        INNER JOIN localizacoes l ON u.id = l.usuario_id
        WHERE u.id != ${usuarioId} AND u.tipo IN ('cuidador', 'enfermeiro', 'acompanhante')
        ORDER BY distancia ASC
        LIMIT 20;
      `;
            console.log(`[LOG-FLUXO] Sucesso: Recuperados os 20 vizinhos mais próximos de ${usuarioId}.`);
            return usuariosProximos.map((u) => u.id);
        }
        catch (error) {
            console.error(`[ERRO-FLUXO] Falha ao processar ranking de proximidade: ${error.message}`);
            throw error;
        }
    }
    /**
     * Retorna os 20 usuários mais próximos filtrados por tipo profissional.
     * @param {string} usuarioId - ID do usuário de referência.
     * @param {string} tipo - Tipo de prestador.
     */
    static async buscar20UsuariosMaisProximosPorTipo(usuarioId, tipo) {
        console.log(`[LOG-FLUXO] Iniciando buscar20UsuariosMaisProximosPorTipo. Usuário: ${usuarioId}, Tipo: ${tipo}`);
        try {
            const tiposPermitidos = [
                'cuidador',
                'enfermeiro',
                'acompanhante',
            ];
            if (!tiposPermitidos.includes(tipo)) {
                console.error(`[ERRO-FLUXO] Violação de parâmetro: Tipo '${tipo}' é inválido para busca.`);
                throw new Error('Tipo inválido.');
            }
            const loc = await this.obterLocalizacaoUsuario(usuarioId);
            console.log(`[LOG-FLUXO] Executando query filtrada por tipo: ${tipo} e ordenada por distância.`);
            const usuariosProximos = await prisma.$queryRaw `
        SELECT u.id, ${this.getSqlDistancia(loc.latitude, loc.longitude)} AS distancia
        FROM usuarios u
        INNER JOIN localizacoes l ON u.id = l.usuario_id
        WHERE u.id != ${usuarioId} AND u.tipo = ${tipo}
        ORDER BY distancia ASC
        LIMIT 20;
      `;
            console.log(`[LOG-FLUXO] Busca por tipo concluída. Encontrados: ${usuariosProximos.length} prestadores do tipo ${tipo}.`);
            return usuariosProximos.map((u) => u.id);
        }
        catch (error) {
            console.error(`[ERRO-FLUXO] Erro na busca por tipo e proximidade espacial: ${error.message}`);
            throw error;
        }
    }
    /**
     * Busca prestadores por nome dentro de um limite geográfico.
     * @param {string} usuarioId - ID do usuário de referência.
     * @param {string} nome - Nome ou parte do nome para busca.
     * @param {number} [raioKm=50] - Raio de corte em KM.
     */
    static async buscarPorNomeERaio(usuarioId, nome, raioKm = 50) {
        console.log(`[LOG-FLUXO] Iniciando buscarPorNomeERaio. Nome: ${nome}, Raio: ${raioKm}km, Origem: ${usuarioId}`);
        try {
            const loc = await this.obterLocalizacaoUsuario(usuarioId);
            const nomeBusca = `%${nome}%`;
            console.log('[LOG-FLUXO] Executando query combinada (LIKE + Haversine).');
            const resultados = await prisma.$queryRaw `
        SELECT u.id, u.nome, u.tipo, ${this.getSqlDistancia(loc.latitude, loc.longitude)} AS distancia
        FROM usuarios u
        INNER JOIN localizacoes l ON u.id = l.usuario_id
        WHERE u.nome LIKE ${nomeBusca} AND u.tipo IN ('cuidador', 'enfermeiro', 'acompanhante')
        HAVING distancia <= ${raioKm}
        ORDER BY distancia ASC
        LIMIT 20;
      `;
            console.log(`[LOG-FLUXO] Busca nominal espacial concluída. Total: ${resultados.length} resultados.`);
            return resultados;
        }
        catch (error) {
            console.error(`[ERRO-FLUXO] Falha na operação buscarPorNomeERaio: ${error.message}`);
            throw error;
        }
    }
}
exports.GeolocalizacaoService = GeolocalizacaoService;
exports.default = GeolocalizacaoService;
