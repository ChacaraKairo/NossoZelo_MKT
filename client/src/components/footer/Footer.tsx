import React from 'react';
import Link from 'next/link';
import Style from '@/styles/components/footer/Footer.module.css';
import {
  contatosNossoZelo,
  criarLinkEmail,
  criarLinkTelefone,
  criarLinkWhatsApp,
  obterRedesSociaisAtivas,
  RedeSocialNossoZelo,
} from '@/config/contatosNossoZelo';
import {
  FaInstagram,
  FaFacebook,
  FaLinkedin,
  FaEnvelope,
  FaPhoneAlt,
  FaHeadset,
} from 'react-icons/fa';

const iconesRedes: Record<RedeSocialNossoZelo['nome'], React.ReactNode> = {
  LinkedIn: <FaLinkedin />,
  Instagram: <FaInstagram />,
  Facebook: <FaFacebook />,
};

const Footer = () => {
  const redesSociais = obterRedesSociaisAtivas();

  return (
    <footer className={Style.footer}>
      <div className={Style.container}>
        <div className={Style.mainGrid}>
          <div className={Style.brandColumn}>
            <div className={Style.logoWrapper}>
              <h1 className={Style.logoText}>
                {contatosNossoZelo.empresa}
              </h1>
            </div>
            <p className={Style.slogan}>
              {contatosNossoZelo.slogan}
            </p>
            <p className={Style.subText}>
              {contatosNossoZelo.descricao}
            </p>
          </div>

          <div className={Style.navColumn}>
            <h3>Navegacao</h3>
            <ul>
              <li>
                <Link href="/sobre">Sobre a empresa</Link>
              </li>
              <li>
                <Link href="/home">Nosso Zelo</Link>
              </li>
              <li>
                <Link href="/parceiros">
                  Parceiro Nosso Zelo
                </Link>
              </li>
              <li>
                <Link href="/login-user">Login</Link>
              </li>
              <li>
                <Link href="/cadastro-user">Cadastro</Link>
              </li>
            </ul>
          </div>

          <div className={Style.contactColumn}>
            <h3>Contatos</h3>
            <div className={Style.contactItem}>
              <FaEnvelope />
              <div>
                <strong>E-mail</strong>
                <a
                  href={criarLinkEmail(
                    contatosNossoZelo.emailAtendimento,
                  )}
                >
                  {contatosNossoZelo.emailAtendimento}
                </a>
              </div>
            </div>

            {contatosNossoZelo.whatsappAtendimento && (
              <div className={Style.contactItem}>
                <FaHeadset />
                <div>
                  <strong>WhatsApp</strong>
                  <a
                    href={criarLinkWhatsApp(
                      contatosNossoZelo.whatsappAtendimento,
                    )}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {contatosNossoZelo.whatsappAtendimento}
                  </a>
                </div>
              </div>
            )}

            {contatosNossoZelo.telefoneAtendimento && (
              <div className={Style.contactItem}>
                <FaPhoneAlt />
                <a
                  href={criarLinkTelefone(
                    contatosNossoZelo.telefoneAtendimento,
                  )}
                >
                  {contatosNossoZelo.telefoneAtendimento}
                </a>
              </div>
            )}
          </div>
        </div>

        <div className={Style.dividerContainer}>
          <div className={Style.dividerDark}></div>
          <div className={Style.dividerLight}></div>
        </div>

        <p className={Style.copyright}>
          Copyright ©2026 Todos os direitos reservados |
          Block foi criado por KORU Company
        </p>

        {redesSociais.length > 0 && (
          <div className={Style.socialWrapper}>
            {redesSociais.map((rede) => (
              <a
                key={rede.nome}
                href={rede.url}
                className={Style.socialBox}
                target="_blank"
                rel="noreferrer"
                aria-label={rede.nome}
                title={rede.nome}
              >
                {iconesRedes[rede.nome]}
              </a>
            ))}
          </div>
        )}
      </div>
    </footer>
  );
};

export default Footer;
