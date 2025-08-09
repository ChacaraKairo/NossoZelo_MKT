import React from 'react';
import ProviderCard from './ProviderCard';

type Provider = {
  id: number;
  name: string;
  age: number;
  experience: string;
  location: string;
  sex: string;
  image: string;
  category: string;
};

type ProvidersGridProps = {
  prestadores: Provider[];
};

const ProvidersGrid: React.FC<ProvidersGridProps> = ({
  prestadores,
}) => {
  if (prestadores.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">
          Nenhum prestador encontrado com os filtros
          selecionados.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {prestadores.map((prestador) => (
          <ProviderCard
            key={prestador.id}
            prestador={prestador}
          />
        ))}
      </div>
    </div>
  );
};

export default ProvidersGrid;
