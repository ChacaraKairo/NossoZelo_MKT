import React from 'react';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import style from '../../styles/components/geral/TooltipAviso.module.css';

export default function TooltipAviso() {
  return (
    <div className={style.tooltipWrapper}>
      <AiOutlineInfoCircle className={style.tooltipIcon} />
      <div className={style.tooltipBox}>
        Utilize um e-mail válido e uma senha segura contendo
        letras e números. O CPF deve estar correto para
        validação posterior.
      </div>
    </div>
  );
}
