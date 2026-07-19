import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import {
  exigeProtecaoCsrf,
  isRotaPublica,
  origemPermitida
} from "@/lib/security";

function request(url: string, init?: RequestInit) {
  return new NextRequest(url, init);
}

describe("seguranca do controlador", () => {
  it("mantem webhook publico, mas fora da protecao CSRF do painel", () => {
    expect(isRotaPublica("/api/webhooks/asaas")).toBe(true);
    expect(exigeProtecaoCsrf("/api/webhooks/asaas", "POST")).toBe(false);
  });

  it("exige protecao CSRF em mutacoes administrativas", () => {
    expect(exigeProtecaoCsrf("/api/planos", "POST")).toBe(true);
    expect(exigeProtecaoCsrf("/api/planos", "GET")).toBe(false);
  });

  it("aceita origem configurada do controlador", () => {
    process.env.CONTROLADOR_PUBLIC_URL = "https://admin.nossozelo.com.br";

    expect(
      origemPermitida(
        request("https://admin.nossozelo.com.br/api/planos", {
          headers: { origin: "https://admin.nossozelo.com.br" }
        })
      )
    ).toBe(true);
  });

  it("bloqueia origem externa", () => {
    process.env.CONTROLADOR_PUBLIC_URL = "https://admin.nossozelo.com.br";

    expect(
      origemPermitida(
        request("https://admin.nossozelo.com.br/api/planos", {
          headers: { origin: "https://exemplo-malicioso.test" }
        })
      )
    ).toBe(false);
  });
});
