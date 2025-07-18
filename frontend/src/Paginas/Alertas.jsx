import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../Estilos/Alertas.css';
import { detallesEmbalses } from '../Paginas/EmbalseDetalle';
import IconTelegram from '../Iconos/iconoTelegram.png';

// Establecemos los umbrales para marcar niveles críticos
const NIVEL_CRITICO_EMBALSE = 30;
const NIVEL_CRITICO_EMBALSES = 50;

export default function Alertas() {
  // Estados locales para manejar datos y control de carga
  const [alertas, setAlertas] = useState([]);
  const [estadoEmbalses, setEstadoEmbalses] = useState([]);
  const [resumen, setResumen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Obtenemos datos de alertas, resumen de todos los embalses y estado de cada embalses desde el backend desplegado
  useEffect(() => {
    Promise.all([
      fetch('http://localhost:5000/alertas').then(res => res.json()),
      fetch('http://localhost:5000/embalses').then(res => res.json()),
      fetch('http://localhost:5000/resumenembalses').then(res => res.json())
    ])
      .then(([alertasData, embalsesData, resumenData]) => {
        setAlertas(alertasData);                      // Guarda alertas individuales
        setEstadoEmbalses(embalsesData);              // Guarda estado de todos los embalses
        setResumen(resumenData[0]);                   // Guarda resumen general
        setLoading(false);                            
      })
      .catch(err => {
        console.error(err);
        setError('Error al cargar datos');            
        setLoading(false);
      });
  }, []);

  // Mostrar pantalla de carga mientras se obtienen los datos
  if (loading) {
    return (
      <div className="alertas-page">
        <h1>Alertas de Embalses</h1>
        <p>Cargando datos…</p>
      </div>
    );
  }

  // Mostrar mensaje de error si falló la carga de datos
  if (error) {
    return (
      <div className="alertas-page">
        <h1>Alertas de Embalses</h1>
        <p className="error">⚠️ {error}</p>
      </div>
    );
  }

  return (
    <div className="alertas-page">
      <h1>Alertas de Embalses</h1>

      {/* Si no hay alertas activas */}
      {alertas.length === 0 ? (
        <p>No hay alertas en este momento.</p>
      ) : (
        <div className="feed-alertas">
          {alertas.map(alerta => {
            // Si la alerta es global ('todos'), dejamos el ID como 'todos'; si no, convertimos a número
            const dbIdNum = alerta.embalseId === 'todos' ? 'todos' : Number(alerta.embalseId);

            // Buscamos detalles del embalse según el ID
            const detalle = dbIdNum !== 'todos'
              ? Object.values(detallesEmbalses).find(d => d.dbId === dbIdNum)
              : null;

            // Encabezado personalizado para la tarjeta de alerta
            const headerText = detalle
              ? `Alerta ${detalle.nombre}`
              : 'Alerta Capacidad de Embalses';

            // Ruta de destino para ver más detalles
            const destino = detalle ? `/embalses/${detalle.idAPI}` : '/';

            // Formatear la fecha de la alerta
            const fecha = new Date(alerta.timestamp);
            const dia = fecha.toLocaleDateString('es-ES', {
              day: '2-digit', month: '2-digit', year: 'numeric'
            });
            const hora = fecha.toLocaleTimeString('es-ES', {
              hour: '2-digit', minute: '2-digit'
            });

            // Limpiamos texto del mensaje de alerta
            let mensajeLimpio = alerta.mensaje.replace(/\*/g, '').trim();
            mensajeLimpio = mensajeLimpio.replace(/^Alerta capacidad de Embalses\s*URGENTE\s*/i, '');

            // Determina si la alerta se considera resuelta en función del nivel actual
            let estaResuelta = false;
            if (dbIdNum === 'todos') {
              estaResuelta = resumen && resumen.PorcentajeTotal > NIVEL_CRITICO_EMBALSES;
            } else {
              const actual = estadoEmbalses.find(e => e.id === dbIdNum);
              estaResuelta = actual && actual.volumen_porcentual > NIVEL_CRITICO_EMBALSE;
            }

            // Renderiza la tarjeta de alerta
            return (
              <Link key={alerta.id} to={destino} className="tarjeta-alerta">
                {/* Etiqueta si el nivel ya se ha recuperado */}
                {estaResuelta && (
                  <span className="etiqueta-resuelta">Nivel Recuperado</span>
                )}

                <h3 className="titulo-alerta">{headerText}</h3>
                <span className="timestamp">{dia} · {hora}</span>
                <p className="mensaje">{mensajeLimpio}</p>

                {/* Enlace al canal de Telegram */}
                <a
                  href="https://t.me/Embalses_CAM"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="telegram-link"
                  onClick={e => e.stopPropagation()}
                >
                  <img src={IconTelegram} alt="Telegram" className="telegram-icon" />
                </a>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
