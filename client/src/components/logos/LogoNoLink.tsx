import Style from './styles/Logo.module.css';
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
