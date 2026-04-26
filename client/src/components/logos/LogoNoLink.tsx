import Style from '@/styles/components/logos/Logo.module.css';
const Logo = () => {
  return (
    <img
      className={Style.logo}
      src="/logos/Logo-com-nome.png"
      alt="Logo NossoZelo"
    />
  );
};
export default Logo;
