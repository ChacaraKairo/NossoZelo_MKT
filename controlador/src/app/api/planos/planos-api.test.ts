import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  prisma: {
    planos: {
      create: vi.fn(),
      update: vi.fn(),
      findUnique: vi.fn()
    },
    logs_acao: {
      create: vi.fn()
    }
  },
  exigirAdminApi: vi.fn()
}));

vi.mock("@/lib/prisma", () => ({ prisma: mocks.prisma }));
vi.mock("@/lib/auth", () => ({ exigirAdminApi: mocks.exigirAdminApi }));

function requestJson(body: unknown) {
  return new Request("http://localhost/api/planos", {
    method: "POST",
    body: JSON.stringify(body)
  });
}

describe("APIs administrativas de planos", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.exigirAdminApi.mockResolvedValue({
      admin: { id: "admin-1" },
      response: null
    });
  });

  it("cria plano e registra log administrativo", async () => {
    const { POST } = await import("./route");
    mocks.prisma.planos.create.mockResolvedValue({
      id: 1,
      nome: "Mensal",
      valor: 49.9,
      ativo: true
    });
    mocks.prisma.logs_acao.create.mockResolvedValue({ id: 1 });

    const response = await POST(
      requestJson({
        nome: "Mensal",
        descricao: "Plano mensal",
        valor: 49.9,
        beneficios: "Busca e pedidos",
        ordem: 1,
        ativo: true
      })
    );
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.plano.nome).toBe("Mensal");
    expect(mocks.prisma.logs_acao.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          usuario_id: "admin-1",
          tabela_afetada: "planos",
          acao: "INSERT"
        })
      })
    );
  });

  it("bloqueia API administrativa sem sessao", async () => {
    const { POST } = await import("./route");
    mocks.exigirAdminApi.mockResolvedValue({
      admin: null,
      response: Response.json({ error: "Nao autenticado." }, { status: 401 })
    });

    const response = await POST(
      requestJson({
        nome: "Mensal",
        valor: 49.9,
        ordem: 1,
        ativo: true
      })
    );

    expect(response.status).toBe(401);
    expect(mocks.prisma.planos.create).not.toHaveBeenCalled();
  });


  it("edita plano e bloqueia valor invalido", async () => {
    const { PUT } = await import("./[id]/route");

    const response = await PUT(
      requestJson({
        nome: "Mensal",
        valor: 0,
        ordem: 1,
        ativo: true
      }),
      { params: Promise.resolve({ id: "1" }) }
    );
    const body = await response.json();

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(body.error).toBeTruthy();
    expect(mocks.prisma.planos.update).not.toHaveBeenCalled();
  });

  it("ativa plano somente quando valor e positivo", async () => {
    const { PATCH } = await import("./[id]/ativar/route");
    mocks.prisma.planos.findUnique.mockResolvedValue({
      id: 1,
      valor: 49.9
    });
    mocks.prisma.planos.update.mockResolvedValue({
      id: 1,
      ativo: true
    });

    const response = await PATCH(new Request("http://localhost"), {
      params: Promise.resolve({ id: "1" })
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Plano ativado.");
    expect(mocks.prisma.logs_acao.create).toHaveBeenCalled();
  });

  it("desativa plano e registra log administrativo", async () => {
    const { PATCH } = await import("./[id]/desativar/route");
    mocks.prisma.planos.update.mockResolvedValue({
      id: 1,
      ativo: false
    });

    const response = await PATCH(new Request("http://localhost"), {
      params: Promise.resolve({ id: "1" })
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Plano desativado.");
    expect(mocks.prisma.logs_acao.create).toHaveBeenCalled();
  });
});
