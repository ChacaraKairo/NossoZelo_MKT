import type { assinaturas_status, usuarios_status_cadastro } from "@prisma/client";

export function statusCadastroPorAssinatura(status: assinaturas_status): usuarios_status_cadastro {
  if (status === "ativa") return "ativo";
  if (status === "aguardando_confirmacao") return "aguardando_confirmacao_pagamento";
  if (status === "bloqueada") return "bloqueado";
  if (status === "cancelada") return "cancelado";
  if (status === "falhou" || status === "expirada" || status === "atrasada") return "inadimplente";
  return "pendente_pagamento";
}
