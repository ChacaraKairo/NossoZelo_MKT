import React from 'react';

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

type ProviderCardProps = {
  prestador: Provider;
};

const ProviderCard: React.FC<ProviderCardProps> = ({
  prestador,
}) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col items-center text-center">
        {/* Imagem do prestador */}
        <div className="w-24 h-24 mb-4 relative">
          <div className="w-full h-full bg-teal-300 rounded-t-full flex items-end justify-center overflow-hidden">
            {/* Simulação da ilustração da pessoa */}
            <div className="w-16 h-20 bg-pink-400 rounded-t-full relative">
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-amber-700 rounded-full"></div>
              <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-2 h-1 bg-white rounded-full"></div>
              <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-3 h-1 bg-white rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Informações do prestador */}
        <div className="w-full bg-teal-300 rounded-lg p-4 -mt-2">
          <h3 className="font-semibold text-gray-800 mb-2">
            {prestador.name}
          </h3>

          <div className="grid grid-cols-2 gap-y-1 text-xs text-gray-700">
            <div>
              <span className="font-medium">Idade:</span>
              <div>{prestador.age} anos</div>
            </div>
            <div>
              <span className="font-medium">
                Tempo de exp.:
              </span>
              <div>{prestador.experience}</div>
            </div>
            <div>
              <span className="font-medium">
                Localidade:
              </span>
              <div>{prestador.location}</div>
            </div>
            <div>
              <span className="font-medium">Sexo:</span>
              <div>{prestador.sex}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderCard;
