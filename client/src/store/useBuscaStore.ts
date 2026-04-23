/**
 * @author Kairo Chácara
 * @version 1.1
 * @date 22/04/2026
 * @description Store global utilizando Zustand para o gerenciamento de estado dos filtros de busca.
 * Controla a localização, tipo de serviço, categoria, raio de distância e teto de preço
 * para a filtragem dinâmica de prestadores na plataforma NossoZelo.
 */

import { create } from 'zustand';

interface BuscaState {
  searchLocation: string;
  searchService: string;
  categoria: string;
  distancia: number;
  precoMax: string;

  // Ações
  setSearchLocation: (val: string) => void;
  setSearchService: (val: string) => void;
  setCategoria: (val: string) => void;
  setDistancia: (val: number) => void;
  setPrecoMax: (val: string) => void;
  limparFiltros: () => void;
}

console.log(
  '[LOG-FLUXO] Inicializando instância do useBuscaStore para controle de filtros.',
);

export const useBuscaStore = create<BuscaState>((set) => ({
  // Estado Inicial
  searchLocation: '',
  searchService: '',
  categoria: '',
  distancia: 50, // Padrão 50km
  precoMax: '',

  /**
   * Atualiza o termo de localização da busca e registra a transição no fluxo.
   */
  setSearchLocation: (val: string) => {
    console.log(
      `[LOG-FLUXO] Atualizando searchLocation para: ${val}`,
    );
    set({ searchLocation: val });
  },

  /**
   * Atualiza o nome do serviço procurado e registra a transição no fluxo.
   */
  setSearchService: (val: string) => {
    console.log(
      `[LOG-FLUXO] Atualizando searchService para: ${val}`,
    );
    set({ searchService: val });
  },

  /**
   * Define a categoria profissional para o filtro e registra a transição no fluxo.
   */
  setCategoria: (val: string) => {
    console.log(
      `[LOG-FLUXO] Aplicando filtro de categoria: ${val}`,
    );
    set({ categoria: val });
  },

  /**
   * Define o raio de distância máximo e registra a transição no fluxo.
   */
  setDistancia: (val: number) => {
    console.log(
      `[LOG-FLUXO] Definindo raio de distância: ${val}km`,
    );
    set({ distancia: val });
  },

  /**
   * Define o teto de preço e registra a transição no fluxo.
   */
  setPrecoMax: (val: string) => {
    console.log(
      `[LOG-FLUXO] Definindo teto de preço máximo: R$ ${val}`,
    );
    set({ precoMax: val });
  },

  /**
   * Reseta os filtros de categoria, distância e preço para o estado padrão.
   */
  limparFiltros: () => {
    console.log(
      '[LOG-FLUXO] Executando limparFiltros: Resetando categoria, distância e precoMax.',
    );
    set({
      categoria: '',
      distancia: 50,
      precoMax: '',
    });
  },
}));

export default useBuscaStore;
