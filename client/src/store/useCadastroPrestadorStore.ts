import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  validarDadosPessoaisPrestador,
  validarDadosProfissionaisPrestador,
  validarDocumentosPrestador,
  validarEnderecoCadastro,
} from '@/validation/cadastroValidation';

interface CadastroState {
  step: number;
  erros: Record<string, string | undefined>;
  dadosPessoais: {
    nome: string;
    sobrenome: string;
    cpf: string;
    telefone: string;
    dataNascimento: string | null;
    sexo: string;
    email: string;
    senha: string;
    confirmarSenha: string;
  };
  endereco: {
    cep: string;
    rua: string;
    numero: string;
    bairro: string;
    cidade: string;
    uf: string;
    raioAtuacao: number;
  };
  profissional: {
    categoria: string;
    registro: string;
    experiencia: number;
    valorHora: number;
    valorDiaria: number;
    disponibilidade: string;
    especialidades: string;
    bio: string;
  };
  documentos: {
    foto: File | null;
    identidade: File | null;
    certificado: File | null;
    antecedentes: File | null;
  };
  setStep: (step: number) => void;
  setErros: (erros: Record<string, string>) => void;
  limparErros: () => void;
  validarEtapa: (etapaAtual: number) => boolean;
  updateDadosPessoais: (
    dados: Partial<CadastroState['dadosPessoais']>,
  ) => void;
  updateEndereco: (
    dados: Partial<CadastroState['endereco']>,
  ) => void;
  updateProfissional: (
    dados: Partial<CadastroState['profissional']>,
  ) => void;
  updateDocumentos: (
    dados: Partial<CadastroState['documentos']>,
  ) => void;
  limparRascunho: () => void;
}

const estadoInicial = {
  step: 1,
  erros: {},
  dadosPessoais: {
    nome: '',
    sobrenome: '',
    cpf: '',
    telefone: '',
    dataNascimento: null,
    sexo: '',
    email: '',
    senha: '',
    confirmarSenha: '',
  },
  endereco: {
    cep: '',
    rua: '',
    numero: '',
    bairro: '',
    cidade: '',
    uf: '',
    raioAtuacao: 10,
  },
  profissional: {
    categoria: '',
    registro: '',
    experiencia: 0,
    valorHora: 30,
    valorDiaria: 180,
    disponibilidade: '',
    especialidades: '',
    bio: '',
  },
  documentos: {
    foto: null,
    identidade: null,
    certificado: null,
    antecedentes: null,
  },
};

function limparErrosCampos(
  erros: Record<string, string | undefined>,
  campos: string[],
) {
  const novosErros = { ...erros };
  campos.forEach((campo) => {
    delete novosErros[campo];
  });
  return novosErros;
}

export const useCadastroPrestadorStore =
  create<CadastroState>()(
    persist(
      (set, get) => ({
        ...estadoInicial,

        setStep: (step) => set({ step, erros: {} }),
        setErros: (erros) => set({ erros }),
        limparErros: () => set({ erros: {} }),

        validarEtapa: (etapaAtual: number) => {
          const state = get();
          let novosErros: Record<string, string> = {};

          if (etapaAtual === 1) {
            novosErros = validarDadosPessoaisPrestador(
              state.dadosPessoais,
            );
          } else if (etapaAtual === 2) {
            novosErros = validarEnderecoCadastro(
              {},
              state.endereco,
            );
          } else if (etapaAtual === 3) {
            novosErros = validarDadosProfissionaisPrestador(
              state.profissional,
            );
          } else if (etapaAtual === 4) {
            novosErros = validarDocumentosPrestador(
              state.documentos,
              state.profissional.categoria,
            );
          }

          set({ erros: novosErros });
          return Object.keys(novosErros).length === 0;
        },

        updateDadosPessoais: (dados) =>
          set((state) => ({
            dadosPessoais: {
              ...state.dadosPessoais,
              ...dados,
            },
            erros: limparErrosCampos(
              state.erros,
              Object.keys(dados),
            ),
          })),

        updateEndereco: (dados) =>
          set((state) => ({
            endereco: { ...state.endereco, ...dados },
            erros: limparErrosCampos(
              state.erros,
              Object.keys(dados),
            ),
          })),

        updateProfissional: (dados) =>
          set((state) => ({
            profissional: {
              ...state.profissional,
              ...dados,
            },
            erros: limparErrosCampos(
              state.erros,
              Object.keys(dados),
            ),
          })),

        updateDocumentos: (dados) =>
          set((state) => ({
            documentos: { ...state.documentos, ...dados },
            erros: limparErrosCampos(
              state.erros,
              Object.keys(dados),
            ),
          })),

        limparRascunho: () => set(estadoInicial),
      }),
      {
        name: 'rascunho-cadastro-prestador',
        partialize: (state) => ({
          ...state,
          documentos: undefined,
          erros: {},
        }),
      },
    ),
  );
