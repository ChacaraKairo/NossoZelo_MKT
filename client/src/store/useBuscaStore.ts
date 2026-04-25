import { create } from 'zustand';
import logger from '@/utils/logger';

interface BuscaState {
  searchLocation: string;
  searchService: string;
  categoria: string;
  distancia: number;
  precoMax: string;
  setSearchLocation: (val: string) => void;
  setSearchService: (val: string) => void;
  setCategoria: (val: string) => void;
  setDistancia: (val: number) => void;
  setPrecoMax: (val: string) => void;
  limparFiltros: () => void;
  limparBuscaCompleta: () => void;
}

const CONTEXTO = 'useBuscaStore';

logger.info(CONTEXTO, 'Inicializando store de filtros');

export const useBuscaStore = create<BuscaState>((set) => ({
  searchLocation: '',
  searchService: '',
  categoria: '',
  distancia: 50,
  precoMax: '',

  setSearchLocation: (val: string) => {
    logger.debug(CONTEXTO, 'Atualizando localização', { val });
    set({ searchLocation: val });
  },

  setSearchService: (val: string) => {
    logger.debug(CONTEXTO, 'Atualizando termo de busca', { val });
    set({ searchService: val });
  },

  setCategoria: (val: string) => {
    logger.info(CONTEXTO, 'Aplicando categoria', { val });
    set({ categoria: val });
  },

  setDistancia: (val: number) => {
    logger.debug(CONTEXTO, 'Definindo distância', { val });
    set({ distancia: val });
  },

  setPrecoMax: (val: string) => {
    logger.debug(CONTEXTO, 'Definindo preço máximo', { val });
    set({ precoMax: val });
  },

  limparFiltros: () => {
    logger.info(CONTEXTO, 'Limpando filtros de refinamento');
    set({
      categoria: '',
      distancia: 50,
      precoMax: '',
    });
  },

  limparBuscaCompleta: () => {
    logger.info(CONTEXTO, 'Limpando busca completa');
    set({
      searchLocation: '',
      searchService: '',
      categoria: '',
      distancia: 50,
      precoMax: '',
    });
  },
}));

export default useBuscaStore;
