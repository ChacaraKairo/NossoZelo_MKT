import React from 'react';
import { Search, MapPin, User, Menu } from 'lucide-react';

type HeaderProps = {
  searchLocation: string;
  setSearchLocation: React.Dispatch<
    React.SetStateAction<string>
  >;
  searchService: string;
  setSearchService: React.Dispatch<
    React.SetStateAction<string>
  >;
};

const Header: React.FC<HeaderProps> = ({
  searchLocation,
  setSearchLocation,
  searchService,
  setSearchService,
}) => {
  return (
    <header className="bg-teal-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <img
            src="/logos/1-removebg-preview.png"
            alt="NossoZelo"
            className="h-12 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() =>
              (window.location.href = '/home/nossozelo')
            }
          />
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-2xl mx-6">
          <div className="flex bg-white rounded-full shadow-sm">
            <div className="flex items-center px-4 py-2 border-r border-gray-200">
              <MapPin className="w-5 h-5 text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Localização"
                value={searchLocation}
                onChange={(e) =>
                  setSearchLocation(e.target.value)
                }
                className="outline-none text-gray-600 placeholder-gray-400"
              />
            </div>
            <div className="flex-1 flex items-center">
              <input
                type="text"
                placeholder="Tipo de prestador ou Nome"
                value={searchService}
                onChange={(e) =>
                  setSearchService(e.target.value)
                }
                className="flex-1 px-4 py-2 outline-none text-gray-600 placeholder-gray-400"
              />
              <button className="p-2 mr-2">
                <Search className="w-5 h-5 text-gray-400 hover:text-teal-500" />
              </button>
            </div>
          </div>
        </div>

        {/* User Actions */}
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-teal-300 hover:bg-teal-400 px-4 py-2 rounded-full text-gray-700 transition-colors">
            <User className="w-4 h-4" />
            Login
          </button>
          <button className="text-gray-700 hover:text-teal-600 underline">
            Criar meu cadastro
          </button>
          <button className="p-2">
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
