import React from 'react';
import { VscMail } from 'react-icons/vsc';
import Style from './styles/InputEmail.module.css';

// --- Interface para as props do componente ---
interface InputEmailProps {
  value: string;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => void;
  placeholder?: string;
  id?: string;
  name?: string;
}

// --- Componente Funcional ---
// Agora ele usa 'className' para importar os estilos do arquivo .css
const InputEmail: React.FC<InputEmailProps> = ({
  value,
  onChange,
  placeholder = 'E-mail',
  id,
  name,
}) => {
  return (
    <div className={Style.inputContainer}>
      <span className={Style.icon}>
        <VscMail size={20} />
      </span>
      <input
        type="email"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        id={id}
        name={name}
        className={Style.inputField}
      />
    </div>
  );
};

export default InputEmail;
