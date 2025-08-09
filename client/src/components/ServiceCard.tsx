import React from 'react';
import { ServiceCardProps } from '@/service/types/service';

const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  delay,
}) => {
  return (
    <div
      className="group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:-translate-y-2"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="relative overflow-hidden rounded-2xl shadow-lg bg-white">
        <div className="relative h-64 md:h-72 overflow-hidden">
          <img
            src={service.image}
            alt={service.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-black bg-opacity-20 transition-opacity duration-300 group-hover:bg-opacity-10"></div>
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h3 className="text-white text-2xl md:text-3xl font-semibold drop-shadow-lg">
              {service.title}
            </h3>
          </div>
        </div>

        <div className="absolute inset-0 bg-teal-500 bg-opacity-95 flex items-center justify-center p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="text-center text-white">
            <h3 className="text-2xl font-bold mb-3">
              {service.title}
            </h3>
            <p className="text-lg opacity-90">
              {service.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;
