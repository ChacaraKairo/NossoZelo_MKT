import React from 'react';
import {
  FaClock,
  FaCalendarAlt,
  FaEllipsisV,
  FaCheckCircle,
} from 'react-icons/fa';
import styles from '../styles/AbaAgendaPro.module.css';

interface AbaAgendaProProps {
  perfil: any;
}

const AbaAgendaPro: React.FC<AbaAgendaProProps> = ({
  perfil,
}) => {
  const agenda = perfil?.agenda || [];

  return (
    <div className={styles.container}>
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-slate-800 tracking-tight">
          Cronograma de Atendimento
        </h3>
        <button className="text-blue-600 font-bold text-xs hover:underline">
          Ver mês completo
        </button>
      </div>

      <div className={styles.timeline}>
        {agenda.length > 0 ? (
          agenda.map((item: any) => (
            <div
              key={item.id}
              className={styles.timelineItem}
            >
              {/* Ponto na Linha do Tempo */}
              <div
                className={`${styles.timelineDot} ${item.status === 'disponivel' ? styles.dotGreen : styles.dotBlue}`}
              />

              <span className={styles.dateHeader}>
                {new Date(item.data).toLocaleDateString(
                  'pt-BR',
                  {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  },
                )}
              </span>

              <div className={styles.appointmentCard}>
                <div className={styles.timeInfo}>
                  <div className={styles.timeRange}>
                    <FaClock className="inline mr-2 text-slate-300 text-sm" />
                    {new Date(
                      item.hora_inicio,
                    ).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                    <span className="mx-2 text-slate-300">
                      →
                    </span>
                    {new Date(
                      item.hora_fim,
                    ).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {item.observacoes ||
                      'Sem observações para este horário.'}{' '}
                    [cite: 5]
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <span
                    className={`${styles.statusBadge} ${item.status === 'disponivel' ? styles.badgeSuccess : styles.badgeWarning}`}
                  >
                    {item.status}
                  </span>
                  <button className="text-slate-300 hover:text-slate-600 transition-colors">
                    <FaEllipsisV />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-100">
            <FaCalendarAlt className="text-slate-200 text-5xl mx-auto mb-4" />
            <p className="text-slate-400 font-bold">
              Sua agenda está livre para novos compromissos.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AbaAgendaPro;
