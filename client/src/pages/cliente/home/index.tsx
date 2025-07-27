'use client';
import React from 'react';

export default function Home() {
  return (
    <main className="home-container">
      <section className="hero">
        <h1>Bem-vindo ao NossoZelo</h1>
        <p className="hero-description">
          Encontre, anuncie e negocie serviços de cuidadores
          e profissionais da saúde com segurança, confiança
          e praticidade.
        </p>
        <div className="cta-buttons">
          <button className="btn primary-btn">
            Começar agora
          </button>
          <button className="btn secondary-btn">
            Saiba mais
          </button>
        </div>
      </section>
    </main>
  );
}
