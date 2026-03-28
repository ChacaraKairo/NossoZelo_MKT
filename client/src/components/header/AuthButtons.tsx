import React from 'react';
import BtnLogin from '../btn/BtnLogin';
import BtnCadastrar from '../btn/BtnCadastrar';

const AuthButtons: React.FC = () => {
  return (
    <>
      <BtnLogin />
      <BtnCadastrar />
    </>
  );
};

export default AuthButtons;
