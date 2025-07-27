'use client';
import { useEffect, useState } from 'react';

export default function Home() {
  const [healthData, setHealthData] = useState<{
    status?: string;
    message?: string;
    timestamp?: string;
    version?: string;
    error?: string;
  }>({});

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => setHealthData(data))
      .catch((err) => {
        console.error(
          'Erro ao conectar com a API do Next:',
          err,
        );
      });
  }, []);

  return (
    <div className="p-6 text-center">
      <h1 className="text-2xl font-bold mb-4">
        Frontend com Next.js
      </h1>
      <div className="bg-white shadow-md rounded-xl p-4 inline-block text-left">
        <p>
          <strong>Status:</strong>{' '}
          {healthData.status || 'Erro'}
        </p>
        <p>
          <strong>Mensagem:</strong>{' '}
          {healthData.message || healthData.error}
        </p>
        <p>
          <strong>Versão:</strong> {healthData.version}
        </p>
        <p>
          <strong>Timestamp:</strong> {healthData.timestamp}
        </p>
      </div>
    </div>
  );
}
