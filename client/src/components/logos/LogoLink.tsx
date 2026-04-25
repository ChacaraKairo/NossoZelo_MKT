import Link from 'next/link';
import Style from './styles/Logo.module.css';

const Logo = () => {
  return (
    <Link href="/" className={Style.logoLink} aria-label="Ir para inicio">
      <img
        className={Style.logo}
        src="/logos/Logo-com-nome.png"
        alt="NossoZelo"
      />
    </Link>
  );
};

export default Logo;
