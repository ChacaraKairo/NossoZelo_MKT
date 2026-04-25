"use strict";
/**
 * @author Kairo Chácara
 * @version 1.0
 * @date 15/04/2026
 * @description Conjunto de funções e tipos para validação de integridade de dados (DTO)
 * no processo de criação de usuários, cobrindo dados base e perfis específicos (Enfermeiro, Cuidador, etc).
 * @rota server\src\src\validator\create\Validator_User.ts
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validarCreateUsuarioDto = validarCreateUsuarioDto;
const validator_1 = __importDefault(require("validator"));
var TipoUsuario;
(function (TipoUsuario) {
    TipoUsuario["CLIENTE"] = "cliente";
    TipoUsuario["CUIDADOR"] = "cuidador";
    TipoUsuario["ENFERMEIRO"] = "enfermeiro";
    TipoUsuario["ACOMPANHANTE"] = "acompanhante";
    TipoUsuario["ADMIN"] = "admin";
})(TipoUsuario || (TipoUsuario = {}));
/**
 * Valida o objeto de entrada para a criação de um novo usuário.
 * Realiza checagem de tipos, formatos de string, CPF e regras específicas por perfil.
 * @param {any} input - Objeto de entrada contendo 'usuario' e dados de perfil.
 * @returns {{ valid: boolean, erros: Record<string, string[]> }} - Status da validação e mapa de erros.
 */
function validarCreateUsuarioDto(input) {
    console.log(`[LOG-FLUXO] Iniciando validarCreateUsuarioDto. Analisando estrutura do payload.`);
    const erros = {};
    // Normalização do input mantendo nomenclaturas originais
    const usuario = input.usuario ?? input;
    const tipo = usuario.tipo;
    console.log(`[LOG-FLUXO] Identificado tipo de usuário para validação: ${tipo || 'Não informado'}.`);
    // ========== VALIDAÇÃO DO USUÁRIO BASE ==========
    console.log('[LOG-FLUXO] Iniciando validação do bloco de dados base.');
    if (!usuario.nome ||
        typeof usuario.nome !== 'string' ||
        usuario.nome.trim().length < 3 ||
        usuario.nome.trim().length > 100) {
        console.warn('[LOG-FLUXO] Falha de validação: nome inválido ou fora dos limites (3-100 carac).');
        erros.nome = ['Nome deve ter entre 3 e 100 caracteres'];
    }
    if (!usuario.email || !validator_1.default.isEmail(usuario.email)) {
        console.warn(`[LOG-FLUXO] Falha de validação: e-mail '${usuario.email}' inválido.`);
        erros.email = ['Email inválido'];
    }
    if (!usuario.senha ||
        typeof usuario.senha !== 'string' ||
        usuario.senha.length < 6 ||
        usuario.senha.length > 255) {
        console.warn('[LOG-FLUXO] Falha de validação: senha curta ou inexistente.');
        erros.senha = [
            'Senha deve ter entre 6 e 255 caracteres',
        ];
    }
    if (usuario.telefone &&
        !validator_1.default.isMobilePhone(usuario.telefone, 'pt-BR')) {
        console.warn(`[LOG-FLUXO] Falha de validação: telefone '${usuario.telefone}' fora do padrão pt-BR.`);
        erros.telefone = [
            'Telefone inválido. Use formato nacional brasileiro',
        ];
    }
    if (!usuario.cpf ||
        !validator_1.default.matches(usuario.cpf, /^\d{3}\.\d{3}\.\d{3}-\d{2}$/)) {
        console.warn(`[LOG-FLUXO] Falha de validação: CPF '${usuario.cpf}' não atende ao regex de máscara.`);
        erros.cpf = [
            'CPF inválido. Formato esperado: 000.000.000-00',
        ];
    }
    if (usuario.data_nascimento &&
        !validator_1.default.isISO8601(usuario.data_nascimento)) {
        console.warn(`[LOG-FLUXO] Falha de validação: data_nascimento '${usuario.data_nascimento}' não é ISO8601.`);
        erros.data_nascimento = [
            'Data de nascimento inválida. Use o formato ISO: YYYY-MM-DDTHH:mm:ss.sssZ',
        ];
    }
    if (usuario.endereco &&
        typeof usuario.endereco !== 'string') {
        erros.endereco = ['Endereço deve ser uma string'];
    }
    if (usuario.cidade &&
        typeof usuario.cidade !== 'string') {
        erros.cidade = ['Cidade deve ser uma string'];
    }
    if (usuario.estado &&
        typeof usuario.estado !== 'string') {
        erros.estado = ['Estado deve ser uma string'];
    }
    if (usuario.pais && typeof usuario.pais !== 'string') {
        erros.pais = ['País deve ser uma string'];
    }
    if (usuario.url_foto_perfil &&
        !validator_1.default.isURL(usuario.url_foto_perfil)) {
        console.warn(`[LOG-FLUXO] Falha de validação: URL de perfil inválida.`);
        erros.url_foto_perfil = [
            'URL de foto de perfil inválida',
        ];
    }
    if (!usuario.tipo ||
        !Object.values(TipoUsuario).includes(usuario.tipo)) {
        console.warn(`[LOG-FLUXO] Falha de validação: Tipo de usuário '${usuario.tipo}' é desconhecido.`);
        erros.tipo = ['Tipo de usuário inválido'];
    }
    // ========== VALIDAÇÕES POR TIPO DE USUÁRIO ==========
    console.log(`[LOG-FLUXO] Verificando campos específicos para o perfil: ${tipo}`);
    if (tipo === TipoUsuario.CUIDADOR) {
        const cuidador = input.cuidador || {};
        if (cuidador.bio && typeof cuidador.bio !== 'string') {
            erros.bio = ['Bio deve ser uma string'];
        }
        if (cuidador.experiencia &&
            typeof cuidador.experiencia !== 'string') {
            erros.experiencia = [
                'Experiência deve ser uma string',
            ];
        }
        if (cuidador.documento_professional &&
            typeof cuidador.documento_professional !== 'string') {
            erros.documento_professional = [
                'Documento profissional deve ser uma string',
            ];
        }
    }
    if (tipo === TipoUsuario.ENFERMEIRO) {
        const enfermeiro = input.enfermeiro || {};
        if (!enfermeiro.coren ||
            typeof enfermeiro.coren !== 'string') {
            console.warn('[LOG-FLUXO] Falha de validação: COREN ausente para perfil enfermeiro.');
            erros.coren = [
                'COREN é obrigatório e deve ser uma string',
            ];
        }
        if (enfermeiro.especialidade &&
            typeof enfermeiro.especialidade !== 'string') {
            erros.especialidade = [
                'Especialidade deve ser uma string',
            ];
        }
        if (enfermeiro.experiencia &&
            typeof enfermeiro.experiencia !== 'string') {
            erros.experiencia = [
                'Experiência deve ser uma string',
            ];
        }
    }
    if (tipo === TipoUsuario.ADMIN) {
        const admin = input.admin || {};
        if (admin.cargo && typeof admin.cargo !== 'string') {
            erros.cargo = ['Cargo deve ser uma string'];
        }
        if (admin.permissao_total !== undefined &&
            typeof admin.permissao_total !== 'boolean') {
            erros.permissao_total = [
                'Permissão total deve ser um booleano',
            ];
        }
    }
    const isValid = Object.keys(erros).length === 0;
    if (isValid) {
        console.log('[LOG-FLUXO] DTO validado com sucesso. Nenhuma inconsistência encontrada.');
    }
    else {
        console.warn(`[LOG-FLUXO] Validação do DTO finalizada com ${Object.keys(erros).length} erro(s) detectado(s).`);
    }
    return {
        valid: isValid,
        erros,
    };
}
