import React, { useState } from 'react';
import { VscEye, VscEyeClosed } from 'react-icons/vsc';
import Style from './styles/InputPassword.module.css';

// 1. Definindo a interface para as props do componente
interface InputPasswordProps {
  value: string;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => void;
  placeholder?: string; // O '?' torna a prop opcional
  id?: string;
  name?: string;
  disabled?: boolean;
}

// 2. Aplicando a interface ao componente
const InputPassword: React.FC<InputPasswordProps> = ({
  value,
  onChange,
  placeholder = 'Senha',
  id,
  name,
  disabled = false,
}) => {
  // Estado para controlar a visibilidade da senha
  const [isPasswordVisible, setIsPasswordVisible] =
    useState(false);

  // Função para alternar a visibilidade
  const toggleVisibility = () => {
    setIsPasswordVisible((prevState) => !prevState);
  };

  return (
    <div className={Style.inputContainer}>
      <input
        type={isPasswordVisible ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        id={id}
        name={name}
        disabled={disabled}
        className={Style.inputField}
      />

      <button
        type="button"
        className={Style.icon}
        onClick={toggleVisibility}
        disabled={disabled}
      >
        {isPasswordVisible ? (
          <VscEyeClosed size={20} />
        ) : (
          <VscEye size={20} />
        )}
      </button>
    </div>
  );
};
export default InputPassword;
