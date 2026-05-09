type AmbienteAsaas = "sandbox" | "production";

const ASAAS_BASE_URLS: Record<AmbienteAsaas, string> = {
  sandbox: "https://api-sandbox.asaas.com/v3",
  production: "https://api.asaas.com/v3"
};

function ambienteAsaas(): AmbienteAsaas {
  const ambiente = process.env.ASAAS_ENVIRONMENT?.trim().toLowerCase();

  if (!ambiente) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "ASAAS_ENVIRONMENT precisa ser definido como sandbox ou production em producao."
      );
    }

    return "sandbox";
  }

  if (["production", "producao", "prod"].includes(ambiente)) return "production";
  if (["sandbox", "homologacao", "homologation", "test"].includes(ambiente)) return "sandbox";

  throw new Error("ASAAS_ENVIRONMENT invalido. Use sandbox ou production.");
}

function validarCompatibilidadeBaseUrl(ambiente: AmbienteAsaas, baseUrl: string) {
  const urlNormalizada = baseUrl.toLowerCase();
  const urlSandbox = urlNormalizada.includes("api-sandbox.asaas.com");
  const urlProducao = urlNormalizada.includes("api.asaas.com");

  if (ambiente === "production" && urlSandbox) {
    throw new Error(
      "ASAAS_BASE_URL aponta para sandbox, mas ASAAS_ENVIRONMENT esta em production."
    );
  }

  if (ambiente === "sandbox" && urlProducao && !urlSandbox) {
    throw new Error(
      "ASAAS_BASE_URL aponta para producao, mas ASAAS_ENVIRONMENT esta em sandbox."
    );
  }
}

export function obterBaseUrlAsaas() {
  const ambiente = ambienteAsaas();
  const baseUrl = (process.env.ASAAS_BASE_URL?.trim() || ASAAS_BASE_URLS[ambiente]).replace(/\/$/, "");

  validarCompatibilidadeBaseUrl(ambiente, baseUrl);

  return baseUrl;
}
