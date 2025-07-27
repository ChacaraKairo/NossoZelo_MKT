import React from 'react';
import style from '../../styles/components/geral/GenderSelector.module.css';

interface GenderSelectorProps {
  onChange: (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => void;
  value?: string;
}

export default function GenderSelector({
  onChange,
  value,
}: GenderSelectorProps) {
  return (
    <div className={style.genderContainer}>
      <span className={style.tituloGenero}>Gênero:</span>

      <label className={style.radioLabel}>
        <input
          type="radio"
          name="genero"
          value="masculino"
          required
          onChange={onChange}
          checked={value === 'masculino'}
        />
        Masculino
      </label>

      <label className={style.radioLabel}>
        <input
          type="radio"
          name="genero"
          value="feminino"
          required
          onChange={onChange}
          checked={value === 'feminino'}
        />
        Feminino
      </label>

      <label className={style.radioLabel}>
        <input
          type="radio"
          name="genero"
          value="outro"
          onChange={onChange}
          checked={value === 'outro'}
        />
        Prefiro não informar
      </label>
    </div>
  );
}
