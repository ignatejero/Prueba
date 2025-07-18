// Importamos librerías necesarias
import React, { useEffect, useState } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts' // Gráfica
import { DateTime } from 'luxon' // Manipulación de fechas
import '../Estilos/ResumenEmbalses.css'
import telegramQR from '../Iconos/telegram.png'

const ResumenEmbalses = () => {
  // Estados principales
  const [resumen, setResumen] = useState(null)                     // Datos resumen actuales
  const [historial, setHistorial] = useState([])                   // Histórico total
  const [historialEmbalses, setHistorialEmbalses] = useState([])   // Histórico por embalse
  const [rango, setRango] = useState('todo')                       // Rango de fechas seleccionado

  // Función para cargar todos los datos
  const fetchDatos = () => {
    // Resumen general actual
    fetch('http://localhost:5000/resumenembalses')
    // Histórico general de porcentajes
    fetch('http://localhost:5000/historialresumenembalses')
    // Histórico detallado por embalse
    fetch('http://localhost:5000/historialembalses')
    
  }

  // Ejecutamos la carga inicial y recargamos cada minuto
  useEffect(() => {
    fetchDatos()
    const interval = setInterval(fetchDatos, 60 * 1000) // actualiza cada 60s
    return () => clearInterval(interval)
  }, [])

  // Mostramos mensaje mientras no hay datos
  if (!resumen) return <p className="loading">Cargando datos…</p>

  // Tooltip personalizado para el área chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const punto = payload[0].payload
      const capacidad = punto.CapacidadTotal.toLocaleString('es-ES', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
      const porcentaje = punto.PorcentajeTotal?.toFixed(2)
      const fecha = DateTime.fromISO(label, { zone: 'utc' })
        .setZone('Europe/Madrid')
        .toLocaleString(DateTime.DATETIME_MED_WITH_SECONDS)

      return (
        <div className="custom-tooltip" style={{ background: '#fff', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}>
          <p style={{ margin: 0, fontWeight: 600 }}>{fecha}</p>
          <p style={{ margin: 0, color: '#3b82f6' }}>
            Capacidad: {capacidad} hm³ | Nivel: {porcentaje}%
          </p>
        </div>
      )
    }
    return null
  }

  // Filtramos el historial en función del rango de fechas seleccionado
  const getHistorialFiltrado = () => {
    if (rango === 'todo') return [...historial].reverse()

    const ahora = DateTime.now()
    let desde

    // Calculamos la fecha desde la que queremos mostrar datos
    switch (rango) {
      case '24h': desde = ahora.minus({ hours: 24 }); break
      case '7d': desde = ahora.minus({ days: 7 }); break
      case '15d': desde = ahora.minus({ days: 15 }); break
      case '1m': desde = ahora.minus({ months: 1 }); break
      case '3m': desde = ahora.minus({ months: 3 }); break
      default: desde = DateTime.fromISO('1970-01-01')
    }

    // Devolvemos el historial invertido desde esa fecha
    return [...historial]
      .filter(h =>
        DateTime.fromISO(h.fecha_registro).diff(desde, 'hours').hours > 0
      )
      .reverse()
  }

  // Calculamos los embalses que más suben y más bajan en el rango seleccionado
  const calcularVariaciones = () => {
    const ahora = DateTime.now()
    let desde

    // Igual que antes, calculamos la fecha de corte
    switch (rango) {
      case '24h': desde = ahora.minus({ hours: 24 }); break
      case '7d': desde = ahora.minus({ days: 7 }); break
      case '15d': desde = ahora.minus({ days: 15 }); break
      case '1m': desde = ahora.minus({ months: 1 }); break
      case '3m': desde = ahora.minus({ months: 3 }); break
      default: desde = DateTime.fromISO('1970-01-01')
    }

    const porEmbalse = {}

    // Agrupamos registros por nombre
    historialEmbalses.forEach(item => {
      const fecha = DateTime.fromISO(item.fecha_registro)
      if (fecha < desde) return

      if (!porEmbalse[item.nombre]) porEmbalse[item.nombre] = []
      porEmbalse[item.nombre].push(item)
    })

    // Calculamos la diferencia entre el primero y el último de cada embalse
    return Object.entries(porEmbalse).map(([nombre, registros]) => {
      const ordenados = registros.sort(
        (a, b) => DateTime.fromISO(a.fecha_registro) - DateTime.fromISO(b.fecha_registro)
      )
      const primero = ordenados[0]
      const ultimo = ordenados[ordenados.length - 1]

      const volIni = primero.capacidad * (primero.volumen_porcentual / 100)
      const volFin = ultimo.capacidad * (ultimo.volumen_porcentual / 100)

      return {
        nombre,
        diferenciaPorcentaje: ultimo.volumen_porcentual - primero.volumen_porcentual,
        diferenciaVolumen: volFin - volIni,
      }
    })
  }

  // Obtenemos arrays con los 5 que más suben y 5 que más bajan
  const variaciones = calcularVariaciones()
  const embalsesQueMasCrecen = variaciones
    .filter(e => e.diferenciaPorcentaje > 0)
    .sort((a, b) => b.diferenciaPorcentaje - a.diferenciaPorcentaje)
    .slice(0, 5)

  const embalsesQueMasDecrecen = variaciones
    .filter(e => e.diferenciaPorcentaje < 0)
    .sort((a, b) => a.diferenciaPorcentaje - b.diferenciaPorcentaje)
    .slice(0, 5)

  // Dominio de valores Y para el gráfico
  const datosFiltrados = getHistorialFiltrado()
  const valoresY = datosFiltrados.map(d => d.CapacidadTotal)
  const minY = Math.min(...valoresY)
  const maxY = Math.max(...valoresY)
  const dominioY = [minY - 5, maxY + 5]

  return (
    <section className="resumen-embalses">
      <h2 className="titulo-seccion">Resumen del Estado de los Embalses</h2>

      {/* ▶ Tarjetas resumen principales */}
      <div className="cards-actual">
        <div className="card">
          <h3>Capacidad total (hm³)</h3>
          <p className="valor">{resumen.CapacidadTotal.toLocaleString()} hm³</p>
        </div>
        <div className="card">
          <h3>Porcentaje de Llenado (%)</h3>
          <p className="valor">{resumen.PorcentajeTotal.toFixed(2)} %</p>
        </div>
      </div>

      {/* ▶ Tarjetas con variaciones */}
      <div className="cards-actual">
        <div className="card">
          <h3>Embalses que más crecen</h3>
          <p className="valor-lista">
            {embalsesQueMasCrecen.map(e => (
              <span key={e.nombre}>
                <strong>{e.nombre}</strong>: +{e.diferenciaPorcentaje.toFixed(2)}% (
                +{e.diferenciaVolumen.toFixed(2)} hm³)
              </span>
            ))}
          </p>
        </div>
        <div className="card">
          <h3>Embalses que más decrecen</h3>
          <p className="valor-lista">
            {embalsesQueMasDecrecen.map(e => (
              <span key={e.nombre}>
                <strong>{e.nombre}</strong>: {e.diferenciaPorcentaje.toFixed(2)}% (
                {e.diferenciaVolumen.toFixed(2)} hm³)
              </span>
            ))}
          </p>
        </div>
      </div>

      {/* ▶ Filtros de fecha para ver evolución */}
      <div className="filtros-fecha">
        {[
          ['24h', '24 h'],
          ['7d', '1 semana'],
          ['15d', '15 días'],
          ['1m', '1 mes'],
          ['3m', '3 meses'],
          ['todo', 'Todo'],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setRango(key)}
            className={rango === key ? 'activo' : ''}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ▶ Gráfico de evolución histórica */}
      <div className="resumen-historico">
        <h3 className="titulo-seccion">Evolución histórica</h3>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={datosFiltrados}
              margin={{ top: 10, right: 30, left: 30, bottom: 20 }}
            >
              <XAxis
                dataKey="fecha_registro"
                tickFormatter={d =>
                  DateTime.fromISO(d, { zone: 'utc' })
                    .setZone('Europe/Madrid')
                    .toFormat('dd/LL')
                }
                tickMargin={10}
                tick={{ fontSize: 12 }}
                label={{
                  value: 'Fecha',
                  position: 'insideBottom',
                  dx: 420,
                  dy: 60,
                  offset: 40,
                }}
                interval="preserveStartEnd"
              />

              <YAxis
                domain={dominioY}
                tickFormatter={v => Math.round(v).toLocaleString()}
                allowDecimals={false}
                tickMargin={10}
                tick={{ fontSize: 12 }}
                label={{
                  value: 'Capacidad (hm³)',
                  angle: -90,
                  position: 'insideLeft',
                  dy: 0,
                  offset: -20,
                }}
              />

              <Tooltip content={<CustomTooltip />} />

              <Area
                type="monotone"
                dataKey="CapacidadTotal"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="#3b82f6"
                fillOpacity={0.2}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ▶ Promoción de grupo de Telegram */}
      <div className="bloque-telegram">
        <p>
          📢 ¿Quieres estar al tanto de las últimas alertas?
          <br />
          👉 <strong>Únete al grupo de Telegram</strong>
        </p>
        <img
          src={telegramQR}
          alt="Código QR Telegram"
          className="qr-telegram"
        />
      </div>
    </section>
  )
}

export default ResumenEmbalses
