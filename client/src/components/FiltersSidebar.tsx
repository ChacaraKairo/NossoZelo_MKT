import React from 'react';
import { FilterType, Filters } from '@/pages/home';

type FiltersSidebarProps = {
  filterOptions: Record<FilterType, string[]>;
  selectedFilters: Filters;
  onFilterChange: (
    filterType: FilterType,
    value: string,
  ) => void;
};

const FiltersSidebar: React.FC<FiltersSidebarProps> = ({
  filterOptions,
  selectedFilters,
  onFilterChange,
}) => {
  const getLabel = (filterType: string) => {
    switch (filterType) {
      case 'orderBy':
        return 'Ordenar por';
      case 'sex':
        return 'Sexo';
      case 'experience':
        return 'Experiência';
      case 'distance':
        return 'Distância';
      case 'priceRange':
        return 'Faixa de preço';
      case 'category':
        return 'Categoria';
      default:
        return filterType;
    }
  };

  return (
    <div className="w-64 bg-white rounded-lg p-6 h-fit shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Filtros de prestadores
      </h2>

      {Object.entries(filterOptions).map(
        ([filterType, options]) => (
          <div key={filterType} className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-700 capitalize font-medium">
                {getLabel(filterType)}
              </span>
              <span className="text-xl cursor-pointer hover:text-teal-500">
                +
              </span>
            </div>

            <div className="space-y-1">
              {options.map((option) => (
                <label
                  key={option}
                  className="flex items-center text-sm text-gray-600 hover:text-teal-600 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={
                      selectedFilters[
                        filterType as FilterType
                      ] === option
                    }
                    onChange={() =>
                      onFilterChange(
                        filterType as FilterType,
                        option,
                      )
                    }
                    className="mr-2 rounded border-gray-300 text-teal-500 focus:ring-teal-500"
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>
        ),
      )}
    </div>
  );
};

export default FiltersSidebar;
