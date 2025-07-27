import React from 'react';
import style from '../../styles/components/geral/Input.module.css';

interface InputProps {
  label?: string;
  type: string;
  placeholder: string;
  name: string;
  required?: boolean;

  value?: string | number;
  onChange?: (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => void;
}

export default function Input({
  label,
  type,
  placeholder,
  name,
  required,
  value,
  onChange,
}: InputProps) {
  return (
    <div className={style.inputWrapper}>
      {label && (
        <label htmlFor={name} className={style.label}>
          {label}
        </label>
      )}
      <input
        type={type}
        id={name}
        name={name}
        placeholder={placeholder}
        required={required}
        value={value}
        onChange={onChange}
        className={style.input}
      />
    </div>
  );
}
