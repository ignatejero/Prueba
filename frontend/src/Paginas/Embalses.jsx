// Importamos React y hooks necesarios
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import '../Estilos/Embalses.css'

// Importamos las imágenes locales de los embalses
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

// Datos base locales: nombre, imagen e ID de cada embalse
const sampleData = [
  { id: 'pinilla', nombre: 'Pinilla', img: pinillaImagen, dbId: 1 },
  { id: 'riosequillo', nombre: 'Riosequillo', img: riosequilloImagen, dbId: 2 },
  { id: 'puentes-viejas', nombre: 'Puentes Viejas', img: puentesViejasImagen, dbId: 3 },
  { id: 'el-villar', nombre: 'El Villar', img: elVillarImagen, dbId: 4 },
  { id: 'el-atazar', nombre: 'El Atazar', img: elAtazarImagen, dbId: 5 },
  { id: 'pedrezuela', nombre: 'Pedrezuela', img: pedrezuelaImagen, dbId: 6 },
  { id: 'santillana', nombre: 'Santillana', img: santillanaImagen, dbId: 7 },
  { id: 'navacerrada', nombre: 'Navacerrada', img: navacerradaImagen, dbId: 8 },
  { id: 'navalmedio', nombre: 'Navalmedio', img: navalmedioImagen, dbId: 9 },
  { id: 'la-jarosa', nombre: 'La Jarosa', img: laJarosaImagen, dbId: 10 },
  { id: 'valmayor', nombre: 'Valmayor', img: valmayorImagen, dbId: 11 },
  { id: 'el-pardo', nombre: 'El Pardo', img: elPardoImagen, dbId: 12 },
  { id: 'san-juan', nombre: 'San Juan', img: sanJuanImagen, dbId: 13 },
  { id: 'picadas', nombre: 'Picadas', img: picadasImagen, dbId: 14 },
]

export default function Embalses() {
  // Estado para almacenar los embalses (con datos enriquecidos desde la API)
  const [embalses, setEmbalses] = useState(sampleData)

  useEffect(() => {
    // Hacemos fetch a la API desplgada en digitalocean
    fetch('https://octopus-app-p7ahd.ondigitalocean.app/embalses')
      .then(res => res.json())
      .then(data => {
        // Mezclamos los datos locales con el volumen actual desde la API
        const enriquecidos = sampleData.map(e => {
          const desdeAPI = data.find(d => d.id === e.dbId) // Busca por ID de base de datos
          return {
            ...e,
            porcentaje: desdeAPI?.volumen_porcentual ?? 0, // Si no encuentra, deja 0%
          }
        })
        setEmbalses(enriquecidos)
      })
      .catch(err => console.error('Error al obtener embalses:', err))
  }, [])

  return (
    <div className="embalses-page">
      <h1>Listado de Embalses</h1>

      {/* Grid de tarjetas */}
      <div className="embalses-grid">
        {embalses.map(e => (
          <Link
            to={`/embalses/${e.id}`} // Cada embalse lleva a su página
            key={e.id}
            className="embalse-card"
            style={{ backgroundImage: `url(${e.img})` }} // Imagen de fondo en cada tarjeta de embalses
          >
            {/* Capa con el nombre */}
            <div className="embalse-overlay">
              <h3>{e.nombre}</h3>
            </div>

            {/* Barra de progreso de llenado */}
            <div className="barraembalse">
              <div
                className="progresoembalse"
                style={{ width: `${e.porcentaje}%` }} // Se rellena la barra proporcional al volumen
              />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
