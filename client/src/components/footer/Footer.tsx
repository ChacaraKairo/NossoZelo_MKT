import React from 'react';
import Link from 'next/link';
import Style from './Footer.module.css';
import {
  FaInstagram,
  FaFacebook,
  FaLinkedin,
  FaEnvelope,
  FaPhoneAlt,
  FaHeadset,
} from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className={Style.footer}>
      <div className={Style.container}>
        {/* Seção Principal */}
        <div className={Style.mainGrid}>
          {/* Coluna 1: Logo e Slogan */}
          <div className={Style.brandColumn}>
            <div className={Style.logoWrapper}>
              {/* Substitua pela sua imagem OnlyLogo ou texto estilizado */}
              <h1 className={Style.logoText}>NossoZelo</h1>
            </div>
            <p className={Style.slogan}>
              Assim como você, cuidamos bem de quem amamos!
            </p>
            <p className={Style.subText}>
              Sua plataforma de confiança para serviços de
              cuidado.
            </p>
          </div>

          {/* Coluna 2: Navegação */}
          <div className={Style.navColumn}>
            <h3>Navegação</h3>
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

          {/* Coluna 3: Contatos */}
          <div className={Style.contactColumn}>
            <h3>Contatos</h3>
            <div className={Style.contactItem}>
              <FaEnvelope />
              <div>
                <strong>E-mail</strong>
                <span>atendimento@nossozelomkt.com.br</span>
              </div>
            </div>
            <div className={Style.contactItem}>
              <FaHeadset />
              <div>
                <strong>Sac</strong>
                <span>+55 (99) 9 9999-9999</span>
              </div>
            </div>
            <div className={Style.contactItem}>
              <FaPhoneAlt />
              <span>+55 (99) 9 999-9999</span>
            </div>
          </div>
        </div>

        {/* Linha Divisora Estilizada */}
        <div className={Style.dividerContainer}>
          <div className={Style.dividerDark}></div>
          <div className={Style.dividerLight}></div>
        </div>

        {/* Copyright */}
        <p className={Style.copyright}>
          Copyright ©2026 Todos os direitos reservados |
          Block foi criado por KORU Company
        </p>

        {/* Redes Sociais */}
        <div className={Style.socialWrapper}>
          <a href="#" className={Style.socialBox}>
            <FaLinkedin />
          </a>
          <a href="#" className={Style.socialBox}>
            <FaInstagram />
          </a>
          <a href="#" className={Style.socialBox}>
            <FaFacebook />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
