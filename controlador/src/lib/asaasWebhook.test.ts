import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const tx = {
    assinaturas: { update: vi.fn() },
    usuarios: { update: vi.fn() },
    logs_acao: { create: vi.fn() },
    eventos_assinatura: { create: vi.fn() },
    asaas_webhook_logs: { update: vi.fn() }
  };

  return {
    tx,
    prisma: {
      eventos_assinatura: {
        findUnique: vi.fn(),
        create: vi.fn()
      },
      asaas_webhook_logs: {
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn()
      },
      assinaturas: {
        findFirst: vi.fn()
      },
      $transaction: vi.fn(async (callback: (transaction: typeof tx) => unknown) => callback(tx))
    }
  };
});

vi.mock("@/lib/prisma", () => ({ prisma: mocks.prisma }));

import { processarWebhookAsaasControlador } from "./asaasWebhook";

const TOKEN_FORTE = "asaas-webhook-token-valido-para-controlador-2026";

describe("processarWebhookAsaasControlador", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.ASAAS_WEBHOOK_TOKEN = TOKEN_FORTE;

    mocks.prisma.eventos_assinatura.findUnique.mockResolvedValue(null);
    mocks.prisma.asaas_webhook_logs.findUnique.mockResolvedValue(null);
    mocks.prisma.asaas_webhook_logs.create.mockResolvedValue({ id: 10 });
    mocks.prisma.assinaturas.findFirst.mockResolvedValue({
      id: 1,
      prestador_id: "prestador-1",
      plano_id: 1,
      status: "aguardando_confirmacao",
      gateway_customer_id: "cus_1",
      gateway_subscription_id: "sub_1",
      gateway_payment_id: null,
      data_ultimo_pagamento: null,
      confirmacao_expira_em: new Date("2026-05-05T00:00:00Z")
    });
    mocks.tx.assinaturas.update.mockResolvedValue({
      id: 1,
      prestador_id: "prestador-1",
      plano_id: 1,
      status: "ativa"
    });
    mocks.tx.usuarios.update.mockResolvedValue({});
    mocks.tx.logs_acao.create.mockResolvedValue({});
    mocks.tx.eventos_assinatura.create.mockResolvedValue({ id: 20 });
    mocks.tx.asaas_webhook_logs.update.mockResolvedValue({ id: 10 });
  });

  it("bloqueia token fraco configurado no ambiente", async () => {
    process.env.ASAAS_WEBHOOK_TOKEN = "curto";

    await expect(
      processarWebhookAsaasControlador({
        token: "curto",
        payload: { id: "evt_token_fraco", event: "PAYMENT_RECEIVED" }
      })
    ).rejects.toMatchObject({ status: 500 });
  });

  it("processa PAYMENT_RECEIVED e ativa assinatura local", async () => {
    const resultado = await processarWebhookAsaasControlador({
      token: TOKEN_FORTE,
      payload: {
        id: "evt_received",
        event: "PAYMENT_RECEIVED",
        payment: {
          id: "pay_1",
          subscription: "sub_1",
          customer: "cus_1",
          status: "RECEIVED",
          paymentDate: "2026-05-02",
          dueDate: "2026-06-02"
        }
      }
    });

    expect(resultado).toMatchObject({
      processado: true,
      assinatura_id: 1,
      prestador_id: "prestador-1",
      status: "ativa"
    });
    expect(mocks.tx.usuarios.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status_cadastro: "ativo" } })
    );
    expect(mocks.tx.eventos_assinatura.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tipo: "pagamento_confirmado",
          gateway_event_id: "evt_received",
          payload_hash: expect.any(String),
          processado_em: expect.any(Date)
        })
      })
    );
  });

  it("ignora evento ja processado sem atualizar assinatura novamente", async () => {
    mocks.prisma.eventos_assinatura.findUnique.mockResolvedValue({
      id: 99
    });

    const resultado = await processarWebhookAsaasControlador({
      token: TOKEN_FORTE,
      payload: {
        id: "evt_repetido",
        event: "PAYMENT_CONFIRMED",
        payment: {
          id: "pay_2",
          subscription: "sub_1",
          status: "CONFIRMED"
        }
      }
    });

    expect(resultado).toMatchObject({
      processado: true,
      idempotente: true,
      duplicado: true,
      evento_assinatura_id: 99
    });
    const eventoDuplicado = mocks.prisma.eventos_assinatura.create.mock.calls[0]?.[0];
    expect(eventoDuplicado).toEqual(
      expect.objectContaining({
        data: expect.objectContaining({
          tipo: "webhook_evento_duplicado_ignorado"
        })
      })
    );
    expect(eventoDuplicado.data).not.toHaveProperty("gateway_event_id");
    expect(mocks.prisma.assinaturas.findFirst).not.toHaveBeenCalled();
    expect(mocks.prisma.$transaction).not.toHaveBeenCalled();
  });
});
