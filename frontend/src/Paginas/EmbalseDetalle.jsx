import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { MapPin, Droplet, Settings } from 'lucide-react'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { DateTime } from 'luxon'

// Importamos las imágenes de cada embalse
import pinillaImagen from '../Iconos/pinilla.png'
import riosequilloImagen from '../Iconos/riosequillo.png'
import puentesViejasImagen from '../Iconos/puentes-viejas.png'
import elVillarImagen from '../Iconos/el-villar.png'
import elAtazarImagen from '../Iconos/el-atazar.png'
import pedrezuelaImagen from '../Iconos/pedrezuela.png'
import santillanaImagen from '../Iconos/santillana.png'
import navacerradaImagen from '../Iconos/navacerrada.png'
import navalmedioImagen from '../Iconos/navalmedio.png'
import laJarosaImagen from '../Iconos/la-jarosa.png'
import valmayorImagen from '../Iconos/valmayor.png'
import elPardoImagen from '../Iconos/el-pardo.png'
import sanJuanImagen from '../Iconos/san-juan.png'
import picadasImagen from '../Iconos/picadas.png'

// Estilos del detalle del embalse
import '../Estilos/EmbalseDetalle.css'

// Creamos el objeto con los datos detallados de cada embalse.
// Usamos como clave un slug que coincide con el parámetro de la URL.
// Este objeto nos permite cargar la ficha completa del embalse correspondiente.

export const detallesEmbalses = {
  'pinilla': {
    dbId: 1,
    nombre: 'Embalse de Pinilla',
    rios: 'Río Lozoya', 
    capacidadMaxima: 38,
    ubicacion: 'Lozoya, Madrid',
    uso: 'Electricidad, Pesca, Navegación, Restauración',
    descripcion: `Construido en 1967, el embalse de Pinilla es uno de los principales abastecedores de agua del norte de la Comunidad de Madrid. Situado en el curso alto del río Lozoya, el embalse de Pinilla es, desde 1967, el embalse de cabecera de los cinco que regulan la cuenca de este río.

    Fue concebido como solución rápida y asequible a la urgente necesidad de incrementar la capacidad de suministro de agua a la región hasta que se pudieran llevar a cabo las presas de El Atazar y Pedrezuela.

    De este embalse se deriva el agua que llega a la estación de tratamiento de agua potable del mismo nombre ubicada a pie de presa.

    El resto se vierte al río y, tras un tramo de seis kilómetros, llega al embalse de Riosequillo.`,
    imagen: pinillaImagen,
    idAPI: 'pinilla'
  },
  'riosequillo': {
    dbId: 2,
    nombre: 'Embalse de Riosequillo',
    rios: 'Río Lozoya', 
    capacidadMaxima: 50,
    ubicacion: 'Buitrago del Lozoya, Madrid',
    uso: 'Abastecimiento, Electricidad, Pesca, Navegación, Baño, Picnic, Restauración',
    descripcion: `El embalse de Riosequillo fue inaugurado en 1958 para solventar los problemas de escasez de agua potable que provocó el aumento de la población en la ciudad de Madrid tras la Guerra Civil. 

    Situado aguas abajo del embalse de Pinilla, fue embalse de cabecera hasta que este último entró en servicio en 1967. Sus caudales vierten al embalse de Puentes Viejas. 

    Además, en 1991 se instaló una central hidroeléctrica cuyas turbinas son impulsadas por los caudales que se desaguan al río.`,
    imagen: riosequilloImagen,
    idAPI: 'riosequillo'
  },
  'puentes-viejas': {
    dbId: 3,
    nombre: 'Embalse de Puentes Viejas',
    rios: 'Río Lozoya',
    capacidadMaxima: 53,
    ubicacion: 'Puentes Viejas, Madrid',
    uso: 'Pesca, Navegación, Baño, Restauración',
    descripcion: `El embalse de Puentes Viejas se sitúa en tercer lugar siguiendo el curso del río Lozoya, inmediatamente aguas arriba del embalse de El Villar en el que vierte sus aguas.

    Su nombre proviene de la existencia de dos pontones a través de los cuales se podía cruzar el río. Hasta su entrada en servicio Madrid se abastecía de las aguas de los ríos Lozoya y Guadalix solo reguladas por el embalse de El Villar.

    Recogidos en el plan de obras de 1907, los trabajos de construcción de su presa se iniciaron entre 1913 y 1914 y se realizaron en dos fases. En la primera, finalizada en 1925, la presa alcanzó una altura de 43,5 metros, creándose un embalse de 22 héctometros cúbicos. La segunda se dedicó a su recrecimiento y, gracias a ella, puede embalsar hasta 53 héctometros cúbicos. 

    En 1991 se instaló una central hidroeléctrica cuyas turbinas son impulsadas por los caudales que se desaguan al río.`,
    imagen: puentesViejasImagen,
    idAPI: 'puentes-viejas'
  },
  'el-villar': {
    dbId: 4,
    nombre: 'Embalse de El Villar',
    rios: 'Río Lozoya', 
    capacidadMaxima: 23,
    ubicacion: 'Puentes Viejas, Madrid',
    uso: 'Abastecimiento, Electricidad, Pesca, Restauración',
    descripcion: `Situado en el curso bajo del río Lozoya, el embalse de El Villar supuso la solución real al problema del abastecimiento de agua a Madrid tras el fracaso de la presa del Pontón de la Oliva. Hasta su entrada en servicio, Madrid se abastecía de las aguas fluyentes (sin regulación) de los ríos Lozoya y Guadalix.

    Esta presa, la más antigua en funcionamiento de la Comunidad de Madrid, fue la más alta de España en su época.

    Parte del agua embalsada se deriva a través del canal de El Villar, y el resto se vierte al embalse de El Atazar, situado inmediatamente aguas abajo de la presa. 

    En 1991 se instaló una central hidroeléctrica cuyas turbinas son impulsadas por los caudales que se desaguan al río.`,
    imagen: elVillarImagen,
    idAPI: 'el-villar'
  },
  'el-atazar': {
    dbId: 5,
    nombre: 'Embalse de El Atazar',
    rios: 'Río Lozoya', 
    capacidadMaxima: 426,
    ubicacion: 'El Atazar, Madrid',
    uso: 'Abastecimiento, Riego, Electricidad, Pesca, Navegación, Picnic',
    descripcion: `La construcción de la presa de El Atazar responde al intento de satisfacer las necesidades de abastecimiento de agua de la población madrileña cuando, a finales de los años 50 del pasado siglo, se sufre un importante período de sequía que hace temer el agotamiento de las reservas.

    La construcción de la presa de El Atazar comenzó en 1965 y concluyó en 1972, siendo inaugurada el 10 de abril de ese año. La obra fue financiada por el Estado y su coste alcanzó los 6.000 millones de pesetas (más de 35 millones de euros actuales).

    La presa de El Atazar es una gran bóveda gruesa de doble curvatura que se eleva más de 120 metros por encima del cauce del río Lozoya. Dispone de un aliviadero de superficie, un doble desagüe de medio fondo y otros dos desagües de fondo.`,
    imagen: elAtazarImagen,
    idAPI: 'el-atazar'
  },
  'pedrezuela': {
    dbId: 6,
    nombre: 'Embalse de Pedrezuela',
    rios: 'Río Guadalix', 
    capacidadMaxima: 41,
    ubicacion: 'Pedrezuela, Madrid',
    uso: 'Abastecimiento, Riego, Pesca, Navegación, Restauración',
    descripcion: `Situado en el piedemonte de la sierra de Guadarrama, el embalse de Pedrezuela, anteriormente llamado embalse de El Vellón, se construyó en 1968, aguas arriba del azud de El Mesto para poder regular las aguas del cauce del Guadalix. 

    A los pies del embalse se construyó, en 2008, una central hidroeléctrica para aprovechar la energía de las aguas que se envían por el canal El Vellón que nace en esta minicentral.

    Con la construcción de esta presa quedó en desuso el azud de El Mesto, que da origen al canal de Guadalix. Aunque, en la actualidad, ninguna de estas dos instalaciones está siendo utilizada, ambas están en perfecto estado para ponerse en funcionamiento.`,
    imagen: pedrezuelaImagen,
    idAPI: 'pedrezuela'
  },
  'santillana': {
    dbId: 7,
    nombre: 'Embalse de Santillana',
    rios: 'Río Manzanares', 
    capacidadMaxima: 91,
    ubicacion: 'Manzanares el Real, Madrid',
    uso: 'Abastecimiento, Riego, Electricidad, Pesca',
    descripcion: `El embalse de Manzanares el Real, situado en el río Manzanares, toma el nombre del municipio más cercano a su ubicación. Construido en 1971 supuso el recrecimiento del anterior embalse de Santillana anegando la presa existente construida entre 1906 y 1920 y, con solo cinco metros más de altura, duplicó su capacidad de almacenamiento.

    Fue concebido como solución rápida y asequible a la urgente necesidad de incrementar la capacidad de suministro de agua a la región hasta que se pudieran llevar a cabo las presas de El Atazar y Pedrezuela.

    El embalse ocupa una superficie de casi once kilómetros cuadrados. Aunque la presa original divide el vaso en dos partes desiguales, con una más pequeña aguas abajo conocida como «espacio entrepresas», en la actualidad ambas zonas están comunicadas permanentemente a través de las escotaduras abiertas en la presa original.`,
    imagen: santillanaImagen,
    idAPI: 'santillana'
  },
  'navacerrada': {
    dbId: 8,
    nombre: 'Embalse de Navacerrada',
    rios: 'Río Navacerrada', 
    capacidadMaxima: 11,
    ubicacion: 'Navacerrada, Madrid',
    uso: 'Abastecimiento, Riego, Pesca',
    descripcion: `El embalse de Navacerrada está situado en el cauce del río Samburiel, conocido popularmente como «río Navacerrada», que es afluente del Manzanares y tiene una cuenca de veinte kilómetros cuadrados.

    Construido en 1969, recoge las aguas del río Samburiel y del embalse de Navalmedio a través de un trasvase. Con ellas se abastece a buena parte de los municipios de la sierra de Guadarrama.

    Su presa, de cuarenta y siete metros de altura y de gravedad de planta mixta, está realizada en hormigón vibrado. De perfil triangular, dispone de dos galerías horizontales paralelas al paramento de aguas arriba.

    En la parte central, con planta recta de 42 metros de longitud, se ubica el aliviadero compuesto por tres vanos con compuertas de 7 metros de ancho y 3 metros de alto cada uno.`,
    imagen: navacerradaImagen,
    idAPI: 'navacerrada'
  },
  'navalmedio': {
    dbId: 9,
    nombre: 'Embalse de Navalmedio',
    rios: 'Río Navalmedio', 
    capacidadMaxima: 0.7,
    ubicacion: 'Cercedilla, Madrid',
    uso: 'Abastecimiento',
    descripcion: `El embalse de Navalmedio se encuentra situado en el río, afluente del Guadarrama, que lleva su mismo nombre. Construido en 1969, regula una cuenca propia de unos nueve kilómetros cuadrados, pero su función principal es trasvasar las aguas del río Navalmedio al embalse de Navacerrada. 

    La construcción de su presa se realizó en paralelo a las de Navacerrada y La Jarosa, con las que comparte diseño. Dispone de dos elementos de cierre: la presa principal y otra de menor tamaño que evita el paso del agua por un collado situado en la margen izquierda. Las coronaciones de ambos muros están enlazadas por una carretera de acceso que discurre pegada al embalse. 

    La presa principal tiene 170 metros de longitud y 47 metros de altura y la presa de collado 225 metros de longitud y 7 metros de altura sobre el cauce. El aliviadero, situado sobre la presa, lo forman dos vanos de siete metros de anchura cerrados por compuertas.`,
    imagen: navalmedioImagen,
    idAPI: 'navalmedio'
  },
  'la-jarosa': {
    dbId: 10,
    nombre: 'Embalse de La Jarosa',
    rios: 'Arroyo de La Jarosa', 
    capacidadMaxima: 7,
    ubicacion: 'Guadarrama, Madrid',
    uso: 'Abastecimiento, Pesca, Restauración',
    descripcion: `Situado en el arroyo del mismo nombre, se construyó en 1969 como respuesta a las necesidades de los pueblos de la zona noroeste de la región, que veían muy limitadas sus posibilidades de desarrollo debido a la escasez de agua sobre todo en época estival. Regula una cuenca propia de unos dieciocho kilómetros cuadrados y recibe también aportaciones del río Cofio a través de un trasvase que parte del embalse de La Aceña.

    Su presa es idéntica en el diseño a las de Navacerrada y Navalmedio. Presenta la misma sección tipo e igual disposición de galerías, aliviadero y desagüe de fondo. Incluso los remates de coronación son iguales en los tres casos.

    En el embalse existen dos elementos de cierre: la presa principal, con 213 metros de longitud y 57 metros de altura, y otra de menor tamaño, con 8,6 metros de altura sobre el cauce, que sirve para evitar el paso del agua por un collado situado en la margen izquierda. `,
    imagen: laJarosaImagen,
    idAPI: 'la-jarosa'
  },
  'valmayor': {
    dbId: 11,
    nombre: 'Embalse de Valmayor',
    rios: 'Río Aulencia', 
    capacidadMaxima: 124,
    ubicacion: 'Valdemorillo, Madrid',
    uso: 'Abastecimiento, Riego, Pesca, Picnic',
    descripcion: `Construido en 1976, actualmente se lo considera el segundo embalse de la Comunidad de Madrid en cuanto a capacidad de almacenamiento.

    Aunque está ubicado en el río Aulencia, el embalse se alimenta fundamentalmente del río Guadarrama, cuyas aguas se aprovechan mediante el trasvase de Las Nieves.

    Desde febrero de 1995, fecha en que entró en servicio la impulsión desde el embalse de San Juan, este embalse recibe importantes aportes desde el río Alberche, que se incorporan al abastecimiento de la Comunidad de Madrid.`,
    imagen: valmayorImagen,
    idAPI: 'valmayor'
  },
  'el-pardo': {
    dbId: 12,
    nombre: 'Embalse de El Pardo',
    rios: 'Río Manzanares', 
    capacidadMaxima: 43,
    ubicacion: 'Fuencarral-El Pardo, Madrid',
    uso: 'Abastecimiento, Electricidad, Restauración',
    descripcion: `El embalse de El Pardo terminó de construirse en el año 1970. La presa integra un dique de tierra y alcanza una altura máxima sobre el cauce de 35 metros de altura. Su longitud en coronación es de 830 metros.

    La construcción del embalse evito las inundaciones que periódicamente el río Manzanares provocaban daños en Madrid. Alguna crecida incluso destruyó puentes, como el Puente Verde de la Florida en enero de 1906.

    Además, en marzo de 2025, el embalse de El Pardo experimentó una situación excepcional debido a las intensas precipitaciones provocadas por la borrasca Martinho. En apenas una semana, el volumen de agua embalsada aumentó más del 50%, pasando de 14 hm³ a 36 hm³, lo que supuso alcanzar el 88% de su capacidad total.`,
    imagen: elPardoImagen,
    idAPI: 'el-pardo'
  },
  'san-juan': {
    dbId: 13,
    nombre: 'Embalse de San Juan',
    rios: 'Río Alberche', 
    capacidadMaxima: 138,
    ubicacion: 'San Martín de Valdeiglesias, Madrid',
    uso: 'Abastecimiento, Riego, Electricidad, Pesca, Navegación, Baño, Picnic, Restauración',
    descripcion: `Construido en 1955, el embalse de San Juan fue diseñado para abastecer de agua y generar energía eléctrica para la zona suroeste de la Comunidad de Madrid. La presa es de tipo gravedad y presenta una altura máxima de 78 metros. Su construcción permitió la creación de un cuerpo de agua de 650 hectáreas de superficie, distribuidas a lo largo de un estrecho valle en las inmediaciones del puerto de San Juan.

    Además, suministra agua potable a la zona suroeste de la Comunidad de Madrid y contribuye a la producción de energía hidroeléctrica. Como curiosidad, es el único embalse de la Comunidad de Madrid donde está permitido el baño y las actividades acuáticas a motor.

    A su vez, bajo las aguas del embalse se encuentran sumergidos un puente romano de 126 metros de longitud y ocho arcos, una ermita y varios molinos, que son visibles solo cuando baja el nivel del agua en años de sequía.`,
    imagen: sanJuanImagen,
    idAPI: 'san-juan'
  },
  'picadas': {
    dbId: 14,
    nombre: 'Embalse de Picadas',
    rios: 'Río Alberche', 
    capacidadMaxima: 15,
    ubicacion: 'San Martín de Valdeiglesias, Madrid',
    uso: 'Abastecimiento, Riego, Electricidad, Pesca, Navegación',
    descripcion: `El embalse de Picadas es una destacada infraestructura hidráulica ubicada en el suroeste de la Comunidad de Madrid, en las primeras estribaciones de la Sierra de Gredos. Construido en 1952 sobre el cauce del río Alberche, este embalse forma parte de un complejo hidráulico junto con el embalse de San Juan, siendo gestionado por la Confederación Hidrográfica del Tajo.

    El embalse de Picadas se caracteriza por su forma alargada y estrecha, resultado del encajamiento del río Alberche en esta zona. Esta morfología permitió reducir los costes de construcción de la presa. Además, el embalse está conectado con el canal de Picadas, que transporta agua hasta la Estación de Tratamiento de Agua Potable de Majadahonda, abasteciendo a diversas zonas de la Comunidad de Madrid y la provincia de Toledo.`,
    imagen: picadasImagen,
    idAPI: 'picadas'
  }
}


// Componente principal de detalle del embalse seleccionado
export default function EmbalseDetalle(){
  const { id: slug } = useParams()
  const embalse = detallesEmbalses[slug]

  // Creamos estados para los datos generales del embalse
  const [datosEmbalse, setDatosEmbalse] = useState({ capacidadActual: 0, porcentaje: 0 })
  const [climaActual, setClimaActual]   = useState(null)
  const [predicciones, setPredicciones] = useState([])
  const [mapaUrl, setMapaUrl]           = useState(null)

  // Creamos estados para el historial y el filtro de rango de fechas
  const [historialEmbalse, setHistorialEmbalse] = useState([])
  const [rango, setRango]                       = useState('todo')

  // Hacemos la petición para cargar los datos actuales del embalse
  useEffect(() => {
    if (!embalse) return
    fetch(`http://127.0.0.1:5000/embalses/${embalse.dbId}`)  
      .then(r => r.json())
      .then(d =>
        setDatosEmbalse({
          capacidadActual: d.capacidad,
          porcentaje:      d.volumen_porcentual
        })
      )
  }, [embalse])

  // Obtenemos el clima actual y predicción para el embalse
  useEffect(() => {
    if (!embalse) return
    fetch(`http://127.0.0.1:5000/embalses/tiempo/${embalse.dbId}`)
      .then(r => r.json())
      .then(d => {
        setClimaActual(d.climaActual)
        setPredicciones(d.predicciones)
      })
  }, [embalse])

  // Conectamos con el backend para acceder al mapa meteorológico (Windy)
  useEffect(() => {
    if (!embalse) return
    fetch(`http://127.0.0.1:5000/embalses/${embalse.dbId}/mapa`)
      .then(r => r.json())
      .then(({ windyUrl }) => setMapaUrl(windyUrl))
  }, [embalse])

  // Cargamos el historial de volumen del embalse y filtramos por nombre (slug)
  useEffect(() => {
    if (!embalse) return
    fetch('http://127.0.0.1:5000/historialembalses')
      .then(r => r.json())
      .then(data => {
        const filtrado = data.filter(item => {
          const itemSlug = item.nombre
            .toLowerCase()
            .normalize('NFD').replace(/[̀-\u036f]/g, '')
            .replace(/\s+/g, '-')
          return itemSlug === slug
        })
        setHistorialEmbalse(filtrado)
      })
  }, [embalse, slug])

  // Si el embalse no existe, mostramos mensaje
  if (!embalse) return <div>Embalse no encontrado</div>

  const { nombre, ubicacion, uso, descripcion, imagen, capacidadMaxima, rios } = embalse
  const { capacidadActual, porcentaje } = datosEmbalse

  // Mostramos información detallada en el grafico
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
      const p = payload[0].payload
      const vol = p.capacidad.toLocaleString('es-ES', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
      const pct = p.volumen_porcentual.toFixed(2)
      const fecha = DateTime.fromISO(label, { zone: 'utc' })
        .setZone('Europe/Madrid')
        .toLocaleString(DateTime.DATETIME_MED_WITH_SECONDS)

      return (
        <div className="custom-tooltip">
          <p style={{ margin: 0, fontWeight: 600 }}>{fecha}</p>
          <p style={{ margin: 0 }}>
            Volumen: {vol} hm³ | Nivel: {pct}%
          </p>
        </div>
      )
    }
    return null
  }

  // Filtramos los datos del historial según el rango seleccionado
  const getHistorialFiltrado = () => {
    if (rango === 'todo') return [...historialEmbalse].reverse()

    const ahora = DateTime.now()
    let desde
    switch (rango) {
      case '24h': desde = ahora.minus({ hours: 24 }); break
      case '7d':  desde = ahora.minus({ days: 7 }); break
      case '15d': desde = ahora.minus({ days: 15 }); break
      case '1m':  desde = ahora.minus({ months: 1 }); break
      case '3m':  desde = ahora.minus({ months: 3 }); break
      default:    desde = DateTime.fromISO('1970-01-01')
    }

    return historialEmbalse
      .filter(h =>
        DateTime.fromISO(h.fecha_registro).diff(desde, 'hours').hours > 0
      )
      .reverse()
  }

  // Preparamos los valores para el eje Y del gráfico
  const datosFiltrados = getHistorialFiltrado()
  const yVals = datosFiltrados.map(d => d.capacidad)
  const minY = Math.min(...yVals, capacidadActual)
  const maxY = Math.max(...yVals, capacidadActual)
  const dominioY = [Math.max(0, minY - 1), maxY + 1]

  // Mostramos toda la interfaz de detalle del embalse
  return (
  <div className="tarjeta-container">
    {/* Mostramos lso datos generales del embalse */}
    <div className="tarjeta-embalse">
      <h2>{nombre}</h2>
      <img src={imagen} alt={nombre} className="img-embalse" />
      <div className="info-item">
        <MapPin className="icon" />
        <strong>Ubicación:</strong> {ubicacion}
      </div>
      <h3>Información general</h3>
      <div className="info-item">
        <Droplet className="icon" />
        <strong>Río que abastece:</strong> {rios}
      </div>
      <div className="info-item">
        <Droplet className="icon" />
        <strong>Capacidad Máxima:</strong> {capacidadMaxima} hm³
      </div>
      <div className="barra">
        <div className="progreso" style={{ width: `${porcentaje}%` }} />
      </div>
      <p className="porcentaje-texto">
  {capacidadActual.toLocaleString()} hm³ ({porcentaje.toFixed(2)}%)
</p>

<div className="uso-bloque-con-lineas">
  <hr className="uso-linea" />
  <div className="info-item uso-principal">
    <div className="uso-header">
      <Settings className="icon" />
      <strong>Uso principal:</strong>
    </div>
  </div>
  <ul className="uso-lista">
    {uso.split(',').map((u, i) => (
      <li key={i}>{u.trim()}</li>
    ))}
  </ul>
  <hr className="uso-linea" />
</div>

<p className="descripcion">{descripcion}</p>
    </div>

    {/* Mostramos el clima actual y la prediccion por horas */}
    {climaActual && (
      <div className="tarjeta-clima app-style">
        <div className="clima-ubicacion">
          <MapPin className="ubi-icon" /> {ubicacion}
        </div>
        <div className="clima-header">
          <div className="temp-grande">
            {Math.round(climaActual.temperatura)}
            <span>°C</span>
          </div>
          <div className="icono-clima">
            <img src={climaActual.icono} alt={climaActual.descripcion} />
          </div>
        </div>
        <div className="clima-body">
          <p className="resumen">{climaActual.descripcion}</p>
          <p className="presionyhumedad">
            Presión {climaActual.presion} hPa · Humedad {climaActual.humedad}%
          </p>
        </div>
        <div className="sensacionTermica">
          <span>
            Sensación Térmica: {Math.round(climaActual.sensacionTermica)}°C
          </span>
        </div>
        <div className="clima-amanecer">
          <span>
            ☀️ Amanecer{' '}
            {DateTime.fromFormat(climaActual.amanecer, 'HH:mm', { zone: 'utc' })
              .plus({ hours: 2 })
              .toFormat('HH:mm')}
          </span>
          <span>
            🌙 Anochecer{' '}
            {DateTime.fromFormat(climaActual.atardecer, 'HH:mm', { zone: 'utc' })
              .plus({ hours: 2 })
              .toFormat('HH:mm')}
          </span>
        </div>
        <div className="pronostico-horas">
          {predicciones.map(p => {
            const hora = new Date(p.fecha).getHours()
              .toString()
              .padStart(2, '0');
            return (
              <div key={p.fecha} className="hora-item">
                <span className="hora">{hora}h</span>
                <img src={p.icono} alt={p.descripcion} />
                <span className="temp">{Math.round(p.temperatura)}°</span>
              </div>
            );
          })}
        </div>
      </div>
    )}

    {/* Mostramos el mapa de windy con precipitaciones */}
    {mapaUrl && (
      <div className="tarjeta-mapa">
        <iframe title="Mapa precipitaciones" src={mapaUrl} allowFullScreen />
      </div>
    )}

    {/* Mostramos la gráfica y el estado histórico del embalse */}
    <div className="resumen-seccion">
      <h2 className="titulo-seccion">Estado actual: {nombre}</h2>
      <div className="datosactual">
        <div className="datos">
          <h3>Capacidad total (hm³)</h3>
          <p className="valor">{capacidadActual.toLocaleString()} hm³</p>
        </div>
        <div className="datos">
          <h3>Porcentaje de Llenado (%)</h3>
          <p className="valor">{porcentaje.toFixed(2)} %</p>
        </div>
      </div>

      {/* Mostramos los botones de filtro para el gráfico */}
      <div className="resumen-historico">
        <h3 className="titulo-seccion">
          Evolución histórica del {nombre}
        </h3>
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

        {/* utilizamos rechars para el gráfico */}
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
                  dx: 320,
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
                dataKey="capacidad"
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
    </div>
  </div>
);}