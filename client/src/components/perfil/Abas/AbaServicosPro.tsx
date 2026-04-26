import AbaServicosOperacionais from '@/components/perfil/AbaServicosOperacionais';
import { PerfilUsuario } from '@/types/perfil';

interface AbaServicosProProps {
  perfil: PerfilUsuario;
}

export default function AbaServicosPro({ perfil }: AbaServicosProProps) {
  return <AbaServicosOperacionais perfil={perfil} />;
}
