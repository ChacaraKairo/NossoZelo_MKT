/**
 * @author Kairo Chácara
 * @version 1.1
 * @date 22/04/2026
 * @description Catálogo estático de serviços da plataforma NossoZelo.
 * Define as categorias principais (Cuidadores, Enfermeiros, Acompanhantes)
 * utilizadas para renderização de componentes de UI e filtros de busca.
 */

import { Service } from '@/service/types/service';

console.log(
  '[LOG-FLUXO] Inicializando catálogo de serviços principais: Fonte de dados estática carregada.',
);

/**
 * Lista de serviços principais disponíveis para contratação.
 * Cada item contém identificadores, metadados visuais e descrições técnicas.
 */
export const services: Service[] = [
  {
    id: 1,
    title: 'Cuidadores',
    image: '/home/enfermeiro2.png',
    description:
      'Profissionais especializados em cuidados pessoais e suporte diário.',
  },
  {
    id: 2,
    title: 'Enfermeiros',
    image: '/home/enfermeiro.png',
    description:
      'Cuidados médicos especializados e procedimentos técnicos em domicílio.',
  },
  {
    id: 3,
    title: 'Acompanhantes',
    image: '/home/acompanhante2.png',
    description:
      'Companhia qualificada e suporte para atividades sociais e compromissos.',
  },
];

console.log(
  `[LOG-FLUXO] Catálogo de serviços pronto. Total de categorias mapeadas: ${services.length}`,
);
