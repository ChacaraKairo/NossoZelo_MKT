import fs from 'fs';
import path from 'path';
import ServiceCrud from './Service_Crud';
import { nanoid } from 'nanoid';
import bcrypt from 'bcrypt';
import { EmailService } from './Service_Email';
import { GeolocalizacaoService } from './Service_Localizacao';

class ServiceUser {
  static async criarUsuarioComTipo(data: any) {
    // Recebe os objetos dinâmicos vindos do frontend
    const {
      usuario,
      enfermeiro,
      cuidador,
      acompanhante,
      admin,
    } = data;

    let id = '';

    try {
      id = nanoid(20);
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

      // 1. CRIAÇÃO DO USUÁRIO BASE
      const usuarioData = {
        ...usuario,
        id,
        senha: senhaCriptografada,
        data_nascimento: dataNascimentoObj,
      };

      await ServiceCrud.create('usuarios', usuarioData);

      // 2. GEOLOCALIZAÇÃO (Resiliente a falhas)
      try {
        const geolocalizacao =
          await GeolocalizacaoService.buscarCoordenadasPorCep(
            usuario.cep,
          );
        await ServiceCrud.create('localizacoes', {
          usuario_id: id,
          latitude: geolocalizacao.latitude,
          longitude: geolocalizacao.longitude,
        });
      } catch (geoError) {
        console.warn(
          'Aviso: Não foi possível obter coordenadas precisas para o CEP informado.',
        );
      }

      // 3. ROTEAMENTO DE TABELAS ESPECÍFICAS (Mapeamento rigoroso para o Prisma)
      if (usuario.tipo === 'enfermeiro') {
        const docCoren =
          enfermeiro?.coren ||
          enfermeiro?.documento_profissional;
        if (!docCoren) {
          throw new Error(
            'COREN/Registro obrigatório para enfermeiros.',
          );
        }
        await ServiceCrud.create('enfermeiros', {
          usuario_id: id,
          coren: docCoren,
          anos_experiencia: enfermeiro?.experiencia
            ? Number(enfermeiro.experiencia)
            : 0,
        });
      } else if (usuario.tipo === 'cuidador') {
        await ServiceCrud.create('cuidadores', {
          usuario_id: id,
          bio: cuidador?.bio || '',
          anos_experiencia: cuidador?.experiencia
            ? Number(cuidador.experiencia)
            : 0,
        });
      } else if (usuario.tipo === 'acompanhante') {
        await ServiceCrud.create('acompanhantes', {
          usuario_id: id,
          bio: acompanhante?.bio || '',
          anos_experiencia: acompanhante?.experiencia
            ? Number(acompanhante.experiencia)
            : 0,
        });
      } else if (usuario.tipo === 'admin') {
        await ServiceCrud.create('admins', {
          usuario_id: id,
          ...admin,
        });
      } else if (usuario.tipo !== 'cliente') {
        // Se não for nenhum dos prestadores acima, nem admin, nem cliente (usuário comum), bloqueia.
        throw new Error(
          `Tipo de usuário inválido: ${usuario.tipo}`,
        );
      }

      // 4. ENVIO DE E-MAIL (Fire and Forget)
      try {
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

        // Não bloqueamos a criação do usuário se houver demora no email
        emailService
          .send(
            usuario.email,
            'Bem-vindo ao Nosso Zelo!',
            html,
          )
          .catch((err) => {
            console.error(
              'Falha ao enviar e-mail em background:',
              err,
            );
          });
      } catch (emailErr) {
        console.error(
          'Erro na preparação do e-mail:',
          emailErr,
        );
      }

      return {
        data: usuarioData,
        enfermeiro,
        cuidador,
        acompanhante,
        admin,
      };
    } catch (error: any) {
      console.error(
        'Erro ao criar usuário com tipo:',
        error.message || error,
      );

      // 5. TRADUÇÃO DE ERROS DO PRISMA
      let mensagemAmigavel =
        'Não foi possível criar o usuário.';

      if (error.code === 'P2002') {
        const alvo = error.meta?.target;
        if (alvo && alvo.includes('email')) {
          mensagemAmigavel =
            'Este e-mail já está cadastrado no sistema.';
        } else if (alvo && alvo.includes('cpf')) {
          mensagemAmigavel =
            'Este CPF já está cadastrado no sistema.';
        } else {
          mensagemAmigavel =
            'Já existe um cadastro com estes dados únicos.';
        }
      } else {
        mensagemAmigavel =
          error.message || 'Erro interno no servidor.';
      }

      // Rollback inteligente
      if (id) {
        try {
          await ServiceCrud.delete('usuarios', id);
          console.log(
            'Rollback: Usuário base removido com sucesso via delete em cascata.',
          );
        } catch (rollbackError: any) {
          if (rollbackError.code !== 'P2025') {
            console.error(
              'Erro ao remover usuário durante o rollback:',
              rollbackError,
            );
          }
        }
      }

      throw new Error(mensagemAmigavel);
    }
  }

  static async validarEmail() {
    // Implemente a lógica de validação de email aqui se necessário
  }

  static async buscarUsuarioCompleto(id: string) {
    const usuarioBase = await ServiceCrud.findById(
      'usuarios',
      id,
    );
    if (!usuarioBase)
      throw new Error('Usuário não encontrado.');

    let dadosExtras = null;

    // Busca na tabela específica dependendo do tipo
    if (usuarioBase.tipo === 'enfermeiro') {
      dadosExtras = await ServiceCrud.findFirst(
        'enfermeiros',
        { usuario_id: id },
      );
    } else if (usuarioBase.tipo === 'cuidador') {
      dadosExtras = await ServiceCrud.findFirst(
        'cuidadores',
        { usuario_id: id },
      );
    } else if (usuarioBase.tipo === 'acompanhante') {
      dadosExtras = await ServiceCrud.findFirst(
        'acompanhantes',
        { usuario_id: id },
      );
    }

    // Remove a senha por segurança antes de retornar ao front
    const { senha, ...usuarioSemSenha } = usuarioBase;

    return {
      ...usuarioSemSenha,
      perfil: dadosExtras,
    };
  }

  static async atualizarUsuario(id: string, data: any) {
    const { usuario, perfil } = data;

    // 1. Atualiza dados básicos
    // Impedimos que a senha seja atualizada por aqui (temos rota própria)
    if (usuario?.senha) delete usuario.senha;

    await ServiceCrud.update('usuarios', id, usuario);

    // 2. Atualiza dados específicos se houver
    const usuarioAtual = await ServiceCrud.findById(
      'usuarios',
      id,
    );
    const tipo = usuarioAtual.tipo;

    if (perfil) {
      let tabelaExtra = '';
      if (tipo === 'enfermeiro')
        tabelaExtra = 'enfermeiros';
      else if (tipo === 'cuidador')
        tabelaExtra = 'cuidadores';
      else if (tipo === 'acompanhante')
        tabelaExtra = 'acompanhantes';

      if (tabelaExtra) {
        // Buscamos o registro na tabela extra para pegar o ID dele
        const registroExtra = await ServiceCrud.findFirst(
          tabelaExtra,
          { usuario_id: id },
        );
        if (registroExtra) {
          await ServiceCrud.update(
            tabelaExtra,
            registroExtra.id,
            perfil,
          );
        }
      }
    }

    return this.buscarUsuarioCompleto(id);
  }

  static async atualizarSenha(
    id: string,
    novaSenha: string,
  ) {
    if (!novaSenha || novaSenha.length < 6) {
      throw new Error(
        'A senha deve ter pelo menos 6 caracteres.',
      );
    }

    const senhaCriptografada = await bcrypt.hash(
      novaSenha,
      10,
    );
    return await ServiceCrud.update('usuarios', id, {
      senha: senhaCriptografada,
    });
  }

  static async deletarUsuario(id: string) {
    // Se o banco estiver configurado com ON DELETE CASCADE,
    // deletar o usuário já removerá localizações e perfis.
    return await ServiceCrud.delete('usuarios', id);
  }
}

export default ServiceUser;
