import React from 'react';

export default function SelectTipoUsuario({
  value,
  onChange,
}: any) {
  return (
    <select name="tipo" value={value} onChange={onChange}>
      <option value="cliente">Cliente</option>
      <option value="cuidador">Cuidador</option>
      <option value="enfermeiro">Enfermeiro</option>
      <option value="acompanhante">Acompanhante</option>
      <option value="admin">Admin</option>
    </select>
  );
}
