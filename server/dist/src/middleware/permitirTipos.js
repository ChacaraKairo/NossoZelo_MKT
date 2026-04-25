"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.permitirTipos = permitirTipos;
function permitirTipos(tiposPermitidos) {
    return (req, res, next) => {
        const tipo = req.user?.tipo;
        if (!tipo) {
            return res
                .status(401)
                .json({ error: 'Tipo de usuário não identificado.' });
        }
        if (!tiposPermitidos.includes(tipo)) {
            return res
                .status(403)
                .json({ error: 'Acesso negado para este tipo de usuário.' });
        }
        return next();
    };
}
