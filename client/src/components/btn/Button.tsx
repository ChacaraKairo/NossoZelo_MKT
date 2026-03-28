// file: client/src/components/btn/Button.tsx
import React from 'react';
import Style from './styles/Button.module.css';

interface ButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  className?: string; // 1. Adicionamos a prop 'className' à interface
}

const Button: React.FC<ButtonProps> = ({
  onClick,
  children,
  type = 'button',
  variant = 'primary',
  disabled = false,
  className = '', // 2. Recebemos a prop aqui, com um valor padrão vazio
}) => {
  // 3. Combinamos as classes do módulo com a classe externa recebida
  const buttonClass =
    `${Style.btn} ${Style[variant]} ${className}`.trim();

  return (
    <button
      type={type}
      className={buttonClass}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
