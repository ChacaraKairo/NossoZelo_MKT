// src/store/useCadastroPrestadorStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Funções auxiliares de validação (importar as suas se já existirem)
const isEmailValido = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isCpfValido = (cpf: string) =>
  cpf.replace(/\D/g, '').length === 11; // Validação simples
const isTelefoneValido = (tel: string) =>
  tel.replace(/\D/g, '').length >= 10;
const isCepValido = (cep: string) =>
  cep.replace(/\D/g, '').length === 8;

interface CadastroState {
  step: number;
  erros: Record<string, string>; // Guarda os erros por campo (ex: { nome: 'Campo obrigatório' })

  dadosPessoais: {
    nome: string;
    sobrenome: string;
    cpf: string;
    telefone: string;
    dataNascimento: string | null;
    sexo: string;
    email: string;
    senha: string;
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
    bio: string;
  };
  documentos: {
    foto: File | null;
    identidade: File | null;
    certificado: File | null;
    antecedentes: File | null;
  };

  // Actions
  setStep: (step: number) => void;
  setErros: (erros: Record<string, string>) => void;
  limparErros: () => void;
  validarEtapa: (etapaAtual: number) => boolean; // Retorna true se estiver tudo OK

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

export const useCadastroPrestadorStore =
  create<CadastroState>()(
    persist(
      (set, get) => ({
        // Estado Inicial
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
          bio: '',
        },
        documentos: {
          foto: null,
          identidade: null,
          certificado: null,
          antecedentes: null,
        },

        // Funções de Atualização
        setStep: (step) => set({ step, erros: {} }), // Limpa erros ao mudar de passo
        setErros: (erros) => set({ erros }),
        limparErros: () => set({ erros: {} }),

        // Lógica de Validação Sênior
        validarEtapa: (etapaAtual: number) => {
          const state = get();
          const novosErros: Record<string, string> = {};

          if (etapaAtual === 1) {
            const {
              nome,
              sobrenome,
              cpf,
              telefone,
              dataNascimento,
              sexo,
              email,
              senha,
            } = state.dadosPessoais;
            if (!nome.trim())
              novosErros.nome = 'O nome é obrigatório.';
            if (!sobrenome.trim())
              novosErros.sobrenome =
                'O sobrenome é obrigatório.';
            if (!cpf || !isCpfValido(cpf))
              novosErros.cpf = 'Insira um CPF válido.';
            if (!telefone || !isTelefoneValido(telefone))
              novosErros.telefone =
                'Insira um telefone válido.';
            if (!dataNascimento)
              novosErros.dataNascimento =
                'A data de nascimento é obrigatória.';
            if (!sexo)
              novosErros.sexo = 'Selecione um género.';
            if (!email || !isEmailValido(email))
              novosErros.email = 'Insira um e-mail válido.';
            if (!senha || senha.length < 6)
              novosErros.senha =
                'A senha deve ter pelo menos 6 caracteres.';
          } else if (etapaAtual === 2) {
            const { cep, rua, numero, bairro, cidade, uf } =
              state.endereco;
            if (!cep || !isCepValido(cep))
              novosErros.cep = 'Insira um CEP válido.';
            if (!rua.trim())
              novosErros.rua =
                'O logradouro é obrigatório.';
            if (!numero.trim())
              novosErros.numero = 'O número é obrigatório.';
            if (!bairro.trim())
              novosErros.bairro = 'O bairro é obrigatório.';
            if (!cidade.trim())
              novosErros.cidade = 'A cidade é obrigatória.';
            if (!uf.trim() || uf.length !== 2)
              novosErros.uf =
                'Insira uma UF válida (ex: SP).';
          } else if (etapaAtual === 3) {
            const { categoria, registro, bio } =
              state.profissional;
            if (!categoria)
              novosErros.categoria =
                'Selecione uma categoria profissional.';
            if (
              categoria === 'enfermeiro' &&
              !registro.trim()
            ) {
              novosErros.registro =
                'O número de registo (ex: COREN) é obrigatório para enfermeiros.';
            }
            if (!bio.trim() || bio.length < 20)
              novosErros.bio =
                'Fale um pouco mais sobre si (mínimo 20 caracteres).';
          }

          // Etapa 4 (Documentos): Normalmente, a validação é feita no envio (se os campos são required)
          else if (etapaAtual === 4) {
            // Exemplo de validação:
            // const { identidade } = state.documentos;
            // if(!identidade) novosErros.identidade = "Envie o documento de identidade.";
          }

          // Atualiza a Store com os erros encontrados
          set({ erros: novosErros });

          // Retorna TRUE se não houver erros (Objeto vazio)
          return Object.keys(novosErros).length === 0;
        },

        updateDadosPessoais: (dados) =>
          set((state) => ({
            dadosPessoais: {
              ...state.dadosPessoais,
              ...dados,
            },
            // Limpa o erro do campo que o utilizador está a corrigir agora
            erros: {
              ...state.erros,
              ...Object.keys(dados).reduce(
                (acc, key) => ({
                  ...acc,
                  [key]: undefined,
                }),
                {},
              ),
            },
          })),

        updateEndereco: (dados) =>
          set((state) => ({
            endereco: { ...state.endereco, ...dados },
            erros: {
              ...state.erros,
              ...Object.keys(dados).reduce(
                (acc, key) => ({
                  ...acc,
                  [key]: undefined,
                }),
                {},
              ),
            },
          })),

        updateProfissional: (dados) =>
          set((state) => ({
            profissional: {
              ...state.profissional,
              ...dados,
            },
            erros: {
              ...state.erros,
              ...Object.keys(dados).reduce(
                (acc, key) => ({
                  ...acc,
                  [key]: undefined,
                }),
                {},
              ),
            },
          })),

        updateDocumentos: (dados) =>
          set((state) => ({
            documentos: { ...state.documentos, ...dados },
          })),

        // Reset Completo do Rascunho
        limparRascunho: () =>
          set({
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
              bio: '',
            },
            documentos: {
              foto: null,
              identidade: null,
              certificado: null,
              antecedentes: null,
            },
          }),
      }),
      {
        name: 'rascunho-cadastro-prestador',
        partialize: (state) => ({
          ...state,
          documentos: undefined,
          erros: {}, // Não guardamos erros no localStorage
        }),
      },
    ),
  );
