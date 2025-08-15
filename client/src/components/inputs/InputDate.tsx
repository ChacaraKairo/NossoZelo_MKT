// client/src/components/inputs/InputDate.tsx
import React from 'react';
import ReactDatePicker, {
  registerLocale,
} from 'react-datepicker';
import { ptBR } from 'date-fns/locale/pt-BR';

// Importa o CSS padrão da biblioteca
import 'react-datepicker/dist/react-datepicker.css';

// Importa os nossos ficheiros de estilo
import Style from './styles/Input.module.css'; // Reutiliza o estilo do input base
import DatePickerStyle from './styles/DatePicker.module.css'; // Estilos específicos para o calendário

import { FaCalendarAlt } from 'react-icons/fa';

// Regista a localidade para que o calendário apareça em português
registerLocale('pt-BR', ptBR);

interface InputDateProps {
  selectedDate: Date | null;
  onChange: (date: Date | null) => void;
  placeholderText?: string;
  id?: string;
  name?: string;
  disabled?: boolean;
}

const InputDate: React.FC<InputDateProps> = ({
  selectedDate,
  onChange,
  placeholderText = 'Selecione a data',
  id,
  name,
}) => {
  return (
    <div className={Style.inputContainer}>
      <ReactDatePicker
        selected={selectedDate}
        onChange={onChange}
        locale="pt-BR" // Define o idioma do calendário
        dateFormat="dd/MM/yyyy" // O formato que o utilizador vê no campo
        placeholderText={placeholderText}
        id={id}
        name={name}
        // Combina as classes de estilo para que pareça com os outros inputs
        className={
          Style.inputField + ' ' + Style.withIconRight
        }
        // Funcionalidades extra para uma melhor experiência do utilizador
        showYearDropdown // Permite escolher o ano numa lista
        scrollableYearDropdown
        yearDropdownItemNumber={60} // Quantidade de anos na lista
        maxDate={new Date()} // Impede a seleção de datas futuras
        // Aplica a nossa classe "âncora" ao container do calendário
        wrapperClassName={DatePickerStyle.datePickerWrapper}
      />
      {/* Ícone decorativo */}
      <span className={`${Style.icon} ${Style.right}`}>
        <FaCalendarAlt />
      </span>
    </div>
  );
};

export default InputDate;
