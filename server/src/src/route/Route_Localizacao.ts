import { Router } from 'express';
import { GeolocalizacaoController } from '../controller/Controller_Localizacao'; // corrigido o path

const LocalizacaoRouter = Router();

// Rota para buscar coordenadas por CEP
LocalizacaoRouter.get(
  '/coordenadas/:cep',
  GeolocalizacaoController.buscarCoordenadas,
);

// Rota para buscar usuários por raio
LocalizacaoRouter.get(
  '/usuarios-proximos',
  GeolocalizacaoController.buscarUsuariosProximos,
);

// ✅ Nova rota: buscar os 20 usuários mais próximos (por ID)
LocalizacaoRouter.get(
  '/mais-proximos/:idUsuario',
  GeolocalizacaoController.buscar20UsuariosMaisProximos,
);
// ✅ Nova rota: buscar 20 usuários mais próximos filtrando por tipo
LocalizacaoRouter.get(
  '/mais-proximos/:idUsuario/:tipo',
  GeolocalizacaoController.buscar20UsuariosMaisProximosPorTipo,
);

export default LocalizacaoRouter;
