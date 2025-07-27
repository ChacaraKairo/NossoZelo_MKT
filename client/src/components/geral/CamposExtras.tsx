import React from 'react';
import Input from './Input';

export default function CamposExtras({
  tipo,
  extra,
  onChange,
}: any) {
  if (tipo === 'cuidador') {
    return (
      <>
        <Input
          type="text"
          name="bio"
          placeholder="Biografia"
          value={extra.bio}
          onChange={onChange}
        />
        <Input
          type="number"
          name="anos_experiencia"
          placeholder="Anos de Experiência"
          value={extra.anos_experiencia}
          onChange={onChange}
        />
      </>
    );
  }

  if (tipo === 'enfermeiro') {
    return (
      <>
        <Input
          type="text"
          name="coren"
          placeholder="COREN"
          value={extra.coren}
          onChange={onChange}
        />
        <Input
          type="text"
          name="especialidade"
          placeholder="Especialidade"
          value={extra.especialidade}
          onChange={onChange}
        />
        <Input
          type="number"
          name="anos_experiencia"
          placeholder="Anos de Experiência"
          value={extra.anos_experiencia}
          onChange={onChange}
        />
      </>
    );
  }

  return null; // nenhum campo extra
}
