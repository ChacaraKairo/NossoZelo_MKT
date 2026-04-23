import React from 'react';
import {
  FaPlus,
  FaSuitcase,
  FaTrashAlt,
  FaEdit,
} from 'react-icons/fa';
import styles from '../styles/AbaServicosPro.module.css';

interface AbaServicosProProps {
  perfil: any;
}

const AbaServicosPro: React.FC<AbaServicosProProps> = ({
  perfil,
}) => {
  const servicos = perfil?.servicos || [];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          Meus Serviços Agenciados
        </h3>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors">
          <FaPlus /> Novo Serviço
        </button>
      </div>

      <div className={styles.grid}>
        {servicos.length > 0 ? (
          servicos.map((s: any) => (
            <div key={s.id} className={styles.serviceCard}>
              <div>
                <div className={styles.priceTag}>
                  R$ {Number(s.valor).toFixed(2)}
                  <span className={styles.priceUnit}>
                    /{s.tipo_cobranca}
                  </span>
                </div>
                <h4 className={styles.serviceName}>
                  {s.nome}
                </h4>
                <p className={styles.description}>
                  {s.descricao}
                </p>
              </div>

              <div className={styles.actions}>
                <button className={styles.btnEdit}>
                  <FaEdit /> Editar
                </button>
                <button className="text-red-400 p-2 hover:bg-red-50 rounded-lg transition-colors">
                  <FaTrashAlt />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-16 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <FaSuitcase className="text-slate-200 text-5xl mx-auto mb-4" />
            <p className="text-slate-400 font-bold">
              Nenhum serviço cadastrado ainda.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AbaServicosPro;
