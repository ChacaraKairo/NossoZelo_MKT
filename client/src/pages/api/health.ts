// pages/api/health.ts

import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const response = await fetch(
      'http://localhost:4000/api/health',
    );
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error(
      'Erro ao buscar dados do backend:',
      error,
    );
    res
      .status(500)
      .json({
        error: 'Erro ao conectar com a API externa',
      });
  }
}
