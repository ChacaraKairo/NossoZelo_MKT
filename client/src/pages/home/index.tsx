import React, { useState } from 'react';
import Header from '@/components/Header2';
import FiltersSidebar from '@/components/FiltersSidebar';
import ProvidersGrid from '@/components/ProviderGrid';

export type FilterType =
  | 'orderBy'
  | 'sex'
  | 'experience'
  | 'distance'
  | 'priceRange'
  | 'category';

export type Filters = {
  [key in FilterType]: string;
};

const NossoZeloHome = () => {
  const [searchLocation, setSearchLocation] = useState('');
  const [searchService, setSearchService] = useState('');
  const [selectedFilters, setSelectedFilters] =
    useState<Filters>({
      orderBy: '',
      sex: '',
      experience: '',
      distance: '',
      priceRange: '',
      category: '',
    });

  const prestadores = [
    {
      id: 1,
      name: 'Fulana da Silva',
      age: 35,
      experience: '3 anos',
      location: 'Cidade',
      sex: 'Feminino',
      image: '/api/placeholder/120/120',
      category: 'Cuidados',
    },
  ];

  const filterOptions: Record<FilterType, string[]> = {
    orderBy: [
      'Relevância',
      'Preço menor',
      'Preço maior',
      'Mais próximo',
      'Melhor avaliado',
    ],
    sex: ['Feminino', 'Masculino', 'Indiferente'],
    experience: [
      'Menos de 1 ano',
      '1-3 anos',
      '3-5 anos',
      'Mais de 5 anos',
    ],
    distance: [
      'Até 5km',
      'Até 10km',
      'Até 20km',
      'Qualquer distância',
    ],
    priceRange: [
      'Até R$ 50',
      'R$ 50-100',
      'R$ 100-200',
      'Acima de R$ 200',
    ],
    category: [
      'Cuidados',
      'Limpeza',
      'Jardinagem',
      'Culinária',
      'Outros',
    ],
  };

  const handleFilterChange = (
    filterType: FilterType,
    value: string,
  ) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [filterType]: prev[filterType] === value ? '' : value,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        searchLocation={searchLocation}
        setSearchLocation={setSearchLocation}
        searchService={searchService}
        setSearchService={setSearchService}
      />

      <div className="max-w-7xl mx-auto flex gap-6 p-6">
        <FiltersSidebar
          filterOptions={filterOptions}
          selectedFilters={selectedFilters}
          onFilterChange={handleFilterChange}
        />

        <ProvidersGrid prestadores={prestadores} />
      </div>
    </div>
  );
};

export default NossoZeloHome;
