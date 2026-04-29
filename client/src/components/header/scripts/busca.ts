export interface BuscarPrestadoresParams {
  nome?: string;
  localizacao?: string;
  tipo?: string;
  raioKm?: number; // ✅ Novo
  precoMax?: string; // ✅ Novo
  limit?: number;
}

export class BuscaService {
  private static readonly API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:4000';

  public static async buscarPrestadores(
    params: BuscarPrestadoresParams,
  ): Promise<any[]> {
    try {
      const queryParams = new URLSearchParams();

      if (params.nome)
        queryParams.append('nome', params.nome);
      if (params.localizacao)
        queryParams.append(
          'localizacao',
          params.localizacao,
        );
      if (params.tipo)
        queryParams.append('tipo', params.tipo);
      if (params.limit)
        queryParams.append(
          'limit',
          params.limit.toString(),
        );
      if (params.raioKm)
        queryParams.append(
          'raioKm',
          params.raioKm.toString(),
        );
      if (params.precoMax)
        queryParams.append(
          'precoMax',
          params.precoMax.toString(),
        );

      const url = `${
        this.API_BASE_URL
      }/api/localizacao/prestadores?${queryParams.toString()}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok)
        throw new Error('Erro ao buscar prestadores.');
      return await response.json();
    } catch (error) {      throw error;
    }
  }
}
