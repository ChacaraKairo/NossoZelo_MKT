// src/service/types/service.ts

export interface Service {
  id: number;
  title: string;
  image: string;
  description: string;
}

export interface ServiceCardProps {
  service: Service;
  delay: number;
}
