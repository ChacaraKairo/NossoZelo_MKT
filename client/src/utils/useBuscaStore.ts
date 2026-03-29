// src/store/useBuscaStore.ts
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

export const useBuscaStore = create<BuscaState>((set) => ({
  searchLocation: '',
  searchService: '',
  categoria: '',
  distancia: 50, // Padrão 50km
  precoMax: '',

  setSearchLocation: (val) => set({ searchLocation: val }),
  setSearchService: (val) => set({ searchService: val }),
  setCategoria: (val) => set({ categoria: val }),
  setDistancia: (val) => set({ distancia: val }),
  setPrecoMax: (val) => set({ precoMax: val }),
  limparFiltros: () =>
    set({ categoria: '', distancia: 50, precoMax: '' }),
}));
