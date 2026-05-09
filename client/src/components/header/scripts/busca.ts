import { getNossoZeloApiUrl } from '@/config/api';

export interface BuscarPrestadoresParams {
  nome?: string;
  localizacao?: string;
  tipo?: string;
  raioKm?: number; // ✅ Novo
  precoMax?: string; // ✅ Novo
  limit?: number;
}

export class BuscaService {
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

      const url = `${getNossoZeloApiUrl()}/geolocalizacao/prestadores?${queryParams.toString()}`;

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
