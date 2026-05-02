import { z } from "zod";

export const PlanoPayloadSchema = z.object({
  nome: z.string().trim().min(3, "Informe o nome do plano."),
  descricao: z.string().trim().optional().nullable(),
  valor: z.coerce.number().positive("O valor deve ser maior que zero."),
  beneficios: z.string().trim().optional().nullable(),
  ordem: z.coerce.number().int().min(0).default(0),
  ativo: z.coerce.boolean().default(true)
}).superRefine((data, ctx) => {
  if (data.ativo && data.valor <= 0) {
    ctx.addIssue({
      code: "custom",
      path: ["valor"],
      message: "Plano ativo precisa ter valor maior que zero."
    });
  }
});

export type PlanoPayload = z.infer<typeof PlanoPayloadSchema>;

export function dadosPlano(input: PlanoPayload) {
  return {
    nome: input.nome,
    descricao: input.descricao || null,
    valor: input.valor,
    beneficios: input.beneficios || null,
    ordem: input.ordem,
    ativo: input.ativo
  };
}
