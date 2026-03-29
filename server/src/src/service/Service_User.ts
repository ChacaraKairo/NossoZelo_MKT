import fs from 'fs';
import path from 'path';
import ServiceCrud from './Service_Crud';
import { nanoid } from 'nanoid';
import bcrypt from 'bcrypt';
import { EmailService } from './Service_Email';
import { GeolocalizacaoService } from './Service_Localizacao';

class ServiceUser {
  static async criarUsuarioComTipo(data: any) {
    const { usuario, enfermeiro, cuidador, admin } = data;

    let id = ''; // <-- Declare aqui fora

    try {
      id = nanoid(20); // <-- Depois atribui aqui dentro
      const senhaCriptografada = await bcrypt.hash(
        usuario.senha,
        10,
      );

      let dataNascimentoObj: Date | undefined;
      if (usuario.data_nascimento) {
        dataNascimentoObj = new Date(
          usuario.data_nascimento,
        );
        if (isNaN(dataNascimentoObj.getTime())) {
          throw new Error('data_nascimento inválida');
        }
      }

      const usuarioData = {
        ...usuario,
        id,
        senha: senhaCriptografada,
        data_nascimento: dataNascimentoObj,
      };

      await ServiceCrud.create('usuarios', usuarioData);

      const geolocalizacao =
        await GeolocalizacaoService.buscarCoordenadasPorCep(
          usuario.cep,
        );

      await ServiceCrud.create('localizacoes', {
        usuario_id: id,
        latitude: geolocalizacao.latitude,
        longitude: geolocalizacao.longitude,
      });

      if (usuario.tipo === 'enfermeiro') {
        if (!enfermeiro?.coren)
          throw new Error(
            'COREN obrigatório para enfermeiros',
          );
        await ServiceCrud.create('enfermeiros', {
          usuario_id: id,
          ...enfermeiro,
        });
      } else if (usuario.tipo === 'cuidador') {
        await ServiceCrud.create('cuidadores', {
          usuario_id: id,
          ...cuidador,
        });
      } else if (usuario.tipo === 'admin') {
        await ServiceCrud.create('admins', {
          usuario_id: id,
          ...admin,
        });
      } else if (
        usuario.tipo !== 'cliente' &&
        usuario.tipo !== 'acompanhante'
      ) {
        throw new Error(
          `Tipo de usuário inválido: ${usuario.tipo}`,
        );
      }

      const emailService = new EmailService();
      const templatePath = path.join(
        __dirname,
        '../../HTML/emails/cadastro.html',
      );
      let html = fs.readFileSync(templatePath, 'utf-8');

      html = html
        .replace('{{nome}}', usuario.nome)
        .replace(
          '{{link}}',
          'https://devmarkt.com.br/login',
        );

      await emailService.send(
        usuario.email,
        'Bem-vindo ao Nosso Zelo!',
        html,
      );

      return {
        data: usuarioData,
        enfermeiro,
        cuidador,
        admin,
      };
    } catch (error) {
      console.error(
        'Erro ao criar usuário com tipo:',
        error,
      );

      // Só tenta excluir se o ID foi de fato gerado
      if (id) {
        try {
          await ServiceCrud.delete('usuarios', id);
          console.log(
            'Usuário removido com sucesso via delete em cascata.',
          );
        } catch (rollbackError) {
          console.error(
            'Erro ao remover usuário durante o rollback:',
            rollbackError,
          );
        }
      }

      throw new Error(
        'Não foi possível criar o usuário com tipo.',
      );
    }
  }

  static async validarEmail() {}
}

export default ServiceUser;
