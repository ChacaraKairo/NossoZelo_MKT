// client/src/components/inputs/Input.tsx
import React from 'react';
import Style from './styles/Input.module.css';

interface InputProps {
  value: string;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => void;
  type?:
    | 'text'
    | 'email'
    | 'password'
    | 'number'
    | 'date'
    | 'tel';
  placeholder?: string;
  id?: string;
  name?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  // Nova prop para a ação de clique no ícone!
  onIconClick?: () => void;
}

const Input: React.FC<InputProps> = ({
  value,
  onChange,
  type = 'text',
  placeholder,
  id,
  name,
  disabled = false,
  icon,
  iconPosition = 'left',
  onIconClick, // Recebemos a nova prop aqui
}) => {
  const inputClasses = [
    Style.inputField,
    icon && iconPosition === 'left'
      ? Style.withIconLeft
      : '',
    icon && iconPosition === 'right'
      ? Style.withIconRight
      : '',
  ].join(' ');

  // Adiciona a classe .clickable se onIconClick for fornecido
  const iconClasses = [
    Style.icon,
    Style[iconPosition],
    onIconClick ? Style.clickable : '',
  ].join(' ');

  return (
    <div className={Style.inputContainer}>
      {/* O ícone agora pode receber a função de clique */}
      {icon && (
        <span className={iconClasses} onClick={onIconClick}>
          {icon}
        </span>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        id={id}
        name={name}
        disabled={disabled}
        className={inputClasses}
      />
    </div>
  );
};

export default Input;
