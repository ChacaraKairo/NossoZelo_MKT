import React from 'react';
import Style from './styles/Button.module.css';

// Interface para definir as propriedades que o botão pode receber
interface ButtonProps {
  onClick?: () => void;
  children: React.ReactNode; // O texto ou ícone dentro do botão
  type?: 'button' | 'submit' | 'reset'; // O tipo do botão
  variant?: 'primary' | 'secondary'; // A variação de estilo
}

/**
 * Componente de botão reutilizável com diferentes estilos.
 * @param variant - 'primary' para o botão principal (preenchido), 'secondary' para o botão de contorno.
 */
const Button: React.FC<ButtonProps> = ({
  onClick,
  children,
  type = 'button',
  variant = 'primary',
}) => {
  // Constrói a lista de classes CSS dinamicamente
  // Ex: Style.btn + Style.primary
  const buttonClass = `${Style.btn} ${Style[variant]}`;

  return (
    <button
      type={type}
      className={buttonClass}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;
