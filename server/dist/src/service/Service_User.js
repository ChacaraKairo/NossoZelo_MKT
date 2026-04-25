"use strict";
/**
 * @author Kairo Chácara
 * @version 1.0
 * @date 14/04/2026
 * @description Classe de serviço responsável pela orquestração de operações de negócio relacionadas ao usuário,
 * incluindo criação com perfis específicos, geolocalização, integração de e-mail e persistência de dados.
 * @rota server\src\src\service\Service_User.ts
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const Service_Crud_1 = __importDefault(require("./Service_Crud"));
const nanoid_1 = require("nanoid");
const bcrypt_1 = __importDefault(require("bcrypt"));
const Service_Email_1 = require("./Service_Email");
const Service_Localizacao_1 = require("./Service_Localizacao");
class ServiceUser {
    /**
     * Cria um usuário completo, incluindo geolocalização, perfil específico e envio de e-mail.
     * Implementa lógica de rollback em caso de falha.
     * * @param {any} data - Objeto contendo dados do usuário e perfis específicos (enfermeiro, cuidador, acompanhante, admin).
     * @returns {Promise<any>} - Retorna o objeto do usuário criado e perfis associados.
     * @throws {Error} - Lança erro em caso de falha na validação, persistência ou violação de constraints.
     */
    static async criarUsuarioComTipo(data) {
        console.log(`[LOG-FLUXO] Iniciando criarUsuarioComTipo. Payload de entrada: ${JSON.stringify(data)}`);
        const { usuario, enfermeiro, cuidador, acompanhante, admin, } = data;
        let id = '';
        try {
            // Geração de identificador único
            id = (0, nanoid_1.nanoid)(20);
            console.log(`[LOG-FLUXO] Identificador nanoid gerado para o novo usuário: ${id}`);
            // Processamento de segurança da senha
            console.log('[LOG-FLUXO] Solicitando criptografia de senha (bcrypt salt 10).');
            const senhaCriptografada = await bcrypt_1.default.hash(usuario.senha, 10);
            console.log('[LOG-FLUXO] Hash de senha gerado com sucesso.');
            let dataNascimentoObj;
            if (usuario.data_nascimento) {
                console.log(`[LOG-FLUXO] Convertendo string de data_nascimento para objeto Date: ${usuario.data_nascimento}`);
                dataNascimentoObj = new Date(usuario.data_nascimento);
                if (isNaN(dataNascimentoObj.getTime())) {
                    console.error(`[ERRO-FLUXO] Falha de validação: A data '${usuario.data_nascimento}' é inválida.`);
                    throw new Error('data_nascimento inválida');
                }
                console.log('[LOG-FLUXO] Data de nascimento validada com sucesso.');
            }
            // 1. CRIAÇÃO DO USUÁRIO BASE
            const usuarioData = {
                ...usuario,
                id,
                senha: senhaCriptografada,
                data_nascimento: dataNascimentoObj,
            };
            console.log(`[LOG-FLUXO] Chamando persistência ServiceCrud.create na tabela 'usuarios' para o e-mail: ${usuario.email}`);
            await Service_Crud_1.default.create('usuarios', usuarioData);
            console.log(`[LOG-FLUXO] Sucesso: Registro base criado na tabela 'usuarios' (ID: ${id}).`);
            // 2. GEOLOCALIZAÇÃO (Resiliente a falhas)
            try {
                console.log(`[LOG-FLUXO] Iniciando integração com GeolocalizacaoService para o CEP: ${usuario.cep}`);
                const geolocalizacao = await Service_Localizacao_1.GeolocalizacaoService.buscarCoordenadasPorCep(usuario.cep);
                console.log(`[LOG-FLUXO] Coordenadas obtidas: [Lat: ${geolocalizacao.latitude}, Lon: ${geolocalizacao.longitude}]. Persistindo localização.`);
                await Service_Crud_1.default.create('localizacoes', {
                    usuario_id: id,
                    latitude: geolocalizacao.latitude,
                    longitude: geolocalizacao.longitude,
                });
                console.log('[LOG-FLUXO] Registro de geolocalização vinculado ao usuário com sucesso.');
            }
            catch (geoError) {
                console.warn(`[LOG-FLUXO] Aviso: Falha não impeditiva na geolocalização. O cadastro continuará. Detalhes: ${geoError.message}`);
            }
            // 3. ROTEAMENTO DE TABELAS ESPECÍFICAS
            console.log(`[LOG-FLUXO] Avaliando ramificação de perfil para o tipo: ${usuario.tipo}`);
            if (usuario.tipo === 'enfermeiro') {
                const docCoren = enfermeiro?.coren ||
                    enfermeiro?.documento_professional;
                console.log('[LOG-FLUXO] Processando perfil do tipo enfermeiro.');
                if (!docCoren) {
                    console.error('[ERRO-FLUXO] Erro de negócio: Enfermeiro sem COREN ou documento profissional.');
                    throw new Error('COREN/Registro obrigatório para enfermeiros.');
                }
                await Service_Crud_1.default.create('enfermeiros', {
                    usuario_id: id,
                    coren: docCoren,
                    anos_experiencia: enfermeiro?.experiencia
                        ? Number(enfermeiro.experiencia)
                        : 0,
                });
                console.log('[LOG-FLUXO] Dados específicos de enfermeiro persistidos.');
            }
            else if (usuario.tipo === 'cuidador') {
                console.log('[LOG-FLUXO] Processando perfil do tipo cuidador.');
                await Service_Crud_1.default.create('cuidadores', {
                    usuario_id: id,
                    bio: cuidador?.bio || '',
                    anos_experiencia: cuidador?.experiencia
                        ? Number(cuidador.experiencia)
                        : 0,
                });
                console.log('[LOG-FLUXO] Dados específicos de cuidador persistidos.');
            }
            else if (usuario.tipo === 'acompanhante') {
                console.log('[LOG-FLUXO] Processando perfil do tipo acompanhante.');
                await Service_Crud_1.default.create('acompanhantes', {
                    usuario_id: id,
                    bio: acompanhante?.bio || '',
                    anos_experiencia: acompanhante?.experiencia
                        ? Number(acompanhante.experiencia)
                        : 0,
                });
                console.log('[LOG-FLUXO] Dados específicos de acompanhante persistidos.');
            }
            else if (usuario.tipo === 'admin') {
                console.log('[LOG-FLUXO] Processando perfil do tipo administrador.');
                await Service_Crud_1.default.create('admins', {
                    usuario_id: id,
                    ...admin,
                });
                console.log('[LOG-FLUXO] Dados específicos de admin persistidos.');
            }
            else if (usuario.tipo !== 'cliente') {
                console.error(`[ERRO-FLUXO] Erro de validação: Tipo '${usuario.tipo}' é desconhecido.`);
                throw new Error(`Tipo de usuário inválido: ${usuario.tipo}`);
            }
            else {
                console.log("[LOG-FLUXO] Usuário identificado como 'cliente'. Sem necessidade de tabelas satélites.");
            }
            // 4. ENVIO DE E-MAIL (Background)
            try {
                console.log(`[LOG-FLUXO] Iniciando processo de envio de e-mail de boas-vindas para: ${usuario.email}`);
                const emailService = new Service_Email_1.EmailService();
                const templatePath = path_1.default.join(__dirname, '../../HTML/emails/cadastro.html');
                if (fs_1.default.existsSync(templatePath)) {
                    console.log(`[LOG-FLUXO] Template de e-mail localizado em: ${templatePath}`);
                    let html = fs_1.default.readFileSync(templatePath, 'utf-8');
                    html = html
                        .replace('{{nome}}', usuario.nome)
                        .replace('{{link}}', 'https://devmarkt.com.br/login');
                    emailService
                        .send(usuario.email, 'Bem-vindo ao Nosso Zelo!', html)
                        .then(() => console.log(`[LOG-FLUXO] E-mail enviado com sucesso para: ${usuario.email}`))
                        .catch((err) => console.error(`[ERRO-FLUXO] Falha assíncrona no envio de e-mail: ${err.message}`));
                    console.log('[LOG-FLUXO] Solicitação de envio de e-mail encaminhada ao serviço de correio.');
                }
                else {
                    console.warn(`[LOG-FLUXO] Aviso: Arquivo de template de e-mail não encontrado em ${templatePath}`);
                }
            }
            catch (emailErr) {
                console.error(`[ERRO-FLUXO] Erro crítico na preparação do e-mail: ${emailErr.message}`);
            }
            console.log(`[LOG-FLUXO] Finalização bem-sucedida da criação do usuário ID: ${id}`);
            return {
                data: usuarioData,
                enfermeiro,
                cuidador,
                acompanhante,
                admin,
            };
        }
        catch (error) {
            console.error(`[ERRO-FLUXO] Exceção capturada em criarUsuarioComTipo: ${error.message || error}`);
            // 5. TRADUÇÃO DE ERROS DO PRISMA / DB
            let mensagemAmigavel = 'Não foi possível criar o usuário.';
            if (error.code === 'P2002') {
                const alvo = error.meta?.target;
                console.log(`[LOG-FLUXO] Conflito de dados detectado (Constraint Unique). Campos afetados: ${alvo}`);
                if (alvo && alvo.includes('email')) {
                    mensagemAmigavel =
                        'Este e-mail já está cadastrado no sistema.';
                }
                else if (alvo && alvo.includes('cpf')) {
                    mensagemAmigavel =
                        'Este CPF já está cadastrado no sistema.';
                }
                else {
                    mensagemAmigavel =
                        'Já existe um cadastro com estes dados únicos.';
                }
            }
            else {
                mensagemAmigavel =
                    error.message || 'Erro interno no servidor.';
            }
            // Lógica de Rollback Manual para garantir consistência em caso de erro no meio do processo
            if (id) {
                console.log(`[LOG-FLUXO] Iniciando Rollback de segurança para remover rastro do ID: ${id}`);
                try {
                    await Service_Crud_1.default.delete('usuarios', id);
                    console.log(`[LOG-FLUXO] Rollback concluído: Registro parcial de ID ${id} removido.`);
                }
                catch (rollbackError) {
                    if (rollbackError.code !== 'P2025') {
                        console.error(`[ERRO-FLUXO] Falha crítica no Rollback (ID: ${id}): ${rollbackError.message}`);
                    }
                    else {
                        console.log('[LOG-FLUXO] Rollback finalizado: Registro já não existia ou foi removido.');
                    }
                }
            }
            throw new Error(mensagemAmigavel);
        }
    }
    /**
     * Stub para o método de validação de e-mail.
     * Atualmente apenas registra a intenção de execução.
     * * @returns {Promise<void>}
     */
    static async validarEmail() {
        console.log('[LOG-FLUXO] Executando validarEmail (Stub). Aguardando implementação da lógica de tokens.');
    }
    /**
     * Busca um perfil de usuário completo, agregando dados da tabela base e tabelas de perfil satélites.
     * * @param {string} id - UUID/NanoID do usuário.
     * @returns {Promise<any>} - Objeto com dados básicos e perfil detalhado enriquecido.
     * @throws {Error} - Lança erro caso usuário não seja localizado.
     */
    static async buscarUsuarioCompleto(id) {
        console.log(`[LOG-FLUXO] Iniciando buscarUsuarioCompleto para o ID: ${id}`);
        try {
            console.log(`[LOG-FLUXO] Consultando dados base na tabela 'usuarios' para ID: ${id}`);
            const usuarioBase = await Service_Crud_1.default.findById('usuarios', id);
            if (!usuarioBase) {
                console.error(`[ERRO-FLUXO] Erro: Usuário com ID ${id} não existe na base.`);
                throw new Error('Usuário não encontrado.');
            }
            console.log(`[LOG-FLUXO] Usuário '${usuarioBase.nome}' localizado. Tipo: ${usuarioBase.tipo}`);
            let dadosExtras = null;
            // Verificação condicional de tabelas satélites baseada no tipo
            if (usuarioBase.tipo === 'enfermeiro') {
                console.log('[LOG-FLUXO] Enriquecendo dados via tabela enfermeiros.');
                dadosExtras = await Service_Crud_1.default.findFirst('enfermeiros', { usuario_id: id });
            }
            else if (usuarioBase.tipo === 'cuidador') {
                console.log('[LOG-FLUXO] Enriquecendo dados via tabela cuidadores.');
                dadosExtras = await Service_Crud_1.default.findFirst('cuidadores', { usuario_id: id });
            }
            else if (usuarioBase.tipo === 'acompanhante') {
                console.log('[LOG-FLUXO] Enriquecendo dados via tabela acompanhantes.');
                dadosExtras = await Service_Crud_1.default.findFirst('acompanhantes', { usuario_id: id });
            }
            console.log('[LOG-FLUXO] Processo de enriquecimento de dados concluído.');
            // LGPD: Remoção de dados sensíveis antes de retornar ao controller
            const { senha, ...usuarioSemSenha } = usuarioBase;
            console.log(`[LOG-FLUXO] Sucesso ao recuperar perfil completo do usuário: ${id}`);
            return {
                ...usuarioSemSenha,
                perfil: dadosExtras,
            };
        }
        catch (error) {
            console.error(`[ERRO-FLUXO] Erro na busca completa do usuário ${id}: ${error.message}`);
            throw error;
        }
    }
    /**
     * Atualiza os dados de um usuário e seu respectivo perfil satélite.
     * * @param {string} id - Identificador do usuário.
     * @param {any} data - Objeto contendo chaves 'usuario' e/ou 'perfil' para atualização.
     * @returns {Promise<any>} - Retorna o perfil completo e atualizado.
     */
    static async atualizarUsuario(id, data) {
        console.log(`[LOG-FLUXO] Iniciando atualizarUsuario para ID: ${id}. Dados: ${JSON.stringify(data)}`);
        try {
            const { usuario, perfil } = data;
            // Proteção de segurança: Senhas devem ser tratadas pelo método especializado atualizarSenha
            if (usuario?.senha) {
                console.warn(`[LOG-FLUXO] Bloqueio: Campo 'senha' removido do payload genérico para o usuário: ${id}`);
                delete usuario.senha;
            }
            if (usuario) {
                console.log(`[LOG-FLUXO] Atualizando dados base do usuário ${id} na tabela 'usuarios'.`);
                await Service_Crud_1.default.update('usuarios', id, usuario);
                console.log('[LOG-FLUXO] Tabela base atualizada.');
            }
            console.log('[LOG-FLUXO] Verificando perfil atual para atualização de dados extras.');
            const usuarioAtual = await Service_Crud_1.default.findById('usuarios', id);
            const tipo = usuarioAtual.tipo;
            if (perfil) {
                let tabelaExtra = '';
                if (tipo === 'enfermeiro')
                    tabelaExtra = 'enfermeiros';
                else if (tipo === 'cuidador')
                    tabelaExtra = 'cuidadores';
                else if (tipo === 'acompanhante')
                    tabelaExtra = 'acompanhantes';
                if (tabelaExtra) {
                    console.log(`[LOG-FLUXO] Localizando registro vinculado na tabela satélite: ${tabelaExtra}`);
                    const registroExtra = await Service_Crud_1.default.findFirst(tabelaExtra, { usuario_id: id });
                    if (registroExtra) {
                        console.log(`[LOG-FLUXO] Atualizando registro de perfil específico (ID: ${registroExtra.id}).`);
                        await Service_Crud_1.default.update(tabelaExtra, registroExtra.id, perfil);
                        console.log(`[LOG-FLUXO] Tabela ${tabelaExtra} atualizada com sucesso.`);
                    }
                    else {
                        console.warn(`[LOG-FLUXO] Aviso: Perfil detectado, mas nenhum registro em ${tabelaExtra} foi encontrado para o usuário ${id}`);
                    }
                }
            }
            console.log('[LOG-FLUXO] Atualização concluída. Recarregando dados para resposta.');
            return this.buscarUsuarioCompleto(id);
        }
        catch (error) {
            console.error(`[ERRO-FLUXO] Falha na atualização do usuário ${id}: ${error.message}`);
            throw error;
        }
    }
    /**
     * Atualiza a senha de um usuário após aplicar hash criptográfico.
     * * @param {string} id - Identificador do usuário.
     * @param {string} novaSenha - Senha em texto plano.
     * @returns {Promise<any>} - Objeto do banco com resultado da atualização.
     * @throws {Error} - Lança erro caso a senha seja inválida.
     */
    static async atualizarSenha(id, novaSenha) {
        console.log(`[LOG-FLUXO] Iniciando atualização de senha para o ID: ${id}`);
        try {
            if (!novaSenha || novaSenha.length < 6) {
                console.error(`[ERRO-FLUXO] Validação falhou: Senha curta ou nula para o usuário ${id}.`);
                throw new Error('A senha deve ter pelo menos 6 caracteres.');
            }
            console.log('[LOG-FLUXO] Gerando novo hash seguro via bcrypt.');
            const senhaCriptografada = await bcrypt_1.default.hash(novaSenha, 10);
            console.log(`[LOG-FLUXO] Gravando nova senha na tabela 'usuarios' para ID: ${id}`);
            const result = await Service_Crud_1.default.update('usuarios', id, { senha: senhaCriptografada });
            console.log(`[LOG-FLUXO] Senha atualizada com sucesso para o usuário ${id}.`);
            return result;
        }
        catch (error) {
            console.error(`[ERRO-FLUXO] Exceção ao atualizar senha do usuário ${id}: ${error.message}`);
            throw error;
        }
    }
    /**
     * Deleta um usuário e propaga a exclusão para dados dependentes (Cascade).
     * * @param {string} id - Identificador do usuário.
     * @returns {Promise<any>} - Resultado da operação de deleção.
     */
    static async deletarUsuario(id) {
        console.log(`[LOG-FLUXO] Iniciando remoção definitiva do usuário ID: ${id}`);
        try {
            console.log(`[LOG-FLUXO] Solicitando ServiceCrud.delete para ID: ${id} na tabela 'usuarios'.`);
            const result = await Service_Crud_1.default.delete('usuarios', id);
            console.log(`[LOG-FLUXO] Sucesso: Usuário ${id} e todas as dependências foram removidos.`);
            return result;
        }
        catch (error) {
            console.error(`[ERRO-FLUXO] Falha crítica ao deletar usuário ${id}: ${error.message}`);
            throw error;
        }
    }
}
exports.default = ServiceUser;
