import React, { useState, useEffect, useRef } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import '../Estilos/Navbar.css'

// Importamos los png 
import iconoClaro from '../Iconos/modo-dia.png'
import iconoOscuro from '../Iconos/modo-noche.png'
import iconoBusqueda from '../Iconos/busqueda.png'
import iconoBandera from '../Iconos/banderaMadrid.png'

//import iconoBandera from '../Iconos/Logo2.png'

// Ponemos aquí la lista de embalses con su nombre y slug para las rutas
const embalsesDisponibles = [
  { nombre: 'Pinilla', slug: 'pinilla' },
  { nombre: 'El Villar', slug: 'el-villar' },
  { nombre: 'Puentes Viejas', slug: 'puentes-viejas' },
  { nombre: 'Riosequillo', slug: 'riosequillo' },
  { nombre: 'El Atazar', slug: 'el-atazar' },
  { nombre: 'Pedrezuela', slug: 'pedrezuela' },
  { nombre: 'Santillana', slug: 'santillana' },
  { nombre: 'Navacerrada', slug: 'navacerrada' },
  { nombre: 'Navalmedio', slug: 'navalmedio' },
  { nombre: 'La Jarosa', slug: 'la-jarosa' },
  { nombre: 'Valmayor', slug: 'valmayor' },
  { nombre: 'El Pardo', slug: 'el-pardo' },
  { nombre: 'San Juan', slug: 'san-juan' },
  { nombre: 'Picadas', slug: 'picadas' }
]

const Navbar = () => {
  // Establecemos el estado para modo oscuro
  const [darkMode, setDarkMode] = useState(false)

  // Guardamos lo que el usuario escribe en el buscador
  const [searchValue, setSearchValue] = useState('')

  // Almacenamos sugerencias filtradas en tiempo real
  const [suggestions, setSuggestions] = useState([])

  // Referencia al input para poder hacer blur desde JS
  const inputRef = useRef(null)

  // Nos permite redirigir programáticamente
  const navigate = useNavigate()

  // Alternamos entre modo claro y oscuro
  const toggleTheme = () => setDarkMode(!darkMode)

  // Cuando cambia el modo, aplicamos la clase correspondiente al body
  useEffect(() => {
    document.body.className = darkMode ? 'dark-mode' : 'light-mode'
  }, [darkMode])

  // Normalizamos el texto para comparación: sin tildes, minúsculas, sin espacios
  const normalizeInput = (text) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '')
      .trim()
  }

  // Hacemos el filtrado de sugerencias cuando el usuario escribe
  const handleSearchChange = (e) => {
    const val = e.target.value
    setSearchValue(val)

    const input = normalizeInput(val)
    if (input.length === 0) {
      setSuggestions([]) // Si está vacío, limpiamos sugerencias
      return
    }

    // Filtramos por coincidencia parcial al inicio de alguna palabra
    const filtered = embalsesDisponibles.filter(embalse => {
      const palabras = embalse.nombre
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, '')
        .split(/\s+/)

      return palabras.some(palabra =>
        palabra.replace(/[^a-z0-9]/g, '').startsWith(input)
      )
    })

    setSuggestions(filtered)
  }

  // Limpiamos el input y las sugerencias
  const handleClearSearch = () => {
    setSearchValue('')
    setSuggestions([])
    inputRef.current?.blur()
  }

  // Procesamos la búsqueda al pulsar enter o el icono
  const handleSearchSubmit = () => {
    const input = normalizeInput(searchValue)
    if (input === '') return

    inputRef.current?.blur()
    setSuggestions([])

    // Establecemos rutas especiales si el usuario escribe palabras clave
    const rutasEspeciales = {
      inicio: '/',
      alertas: '/alertas',
      calculadora: '/calculadora'
    }

    if (rutasEspeciales[input]) {
      navigate(rutasEspeciales[input])
      setSearchValue('')
      return
    }

    // Buscamos coincidencias con los nombres de embalses
    const embalseEncontrado = embalsesDisponibles.find(embalse =>
      normalizeInput(embalse.nombre).includes(input)
    )

    if (embalseEncontrado) {
      navigate(`/embalses/${embalseEncontrado.slug}`)
    } else {
      // Si no encontramos nada exacto, redirigimos a una búsqueda general
      navigate(`/embalses?search=${encodeURIComponent(searchValue.trim())}`)
    }

    setSearchValue('')
  }

  // Redirigimos directamente cuando el usuario hace clic en una sugerencia
  const handleSuggestionClick = (slug) => {
    navigate(`/embalses/${slug}`)
    setSearchValue('')
    setSuggestions([])
    inputRef.current?.blur()
  }

  return (
    <nav className="navbar">
      <div className="navbar__left">
        <div className="logo">
          {/* Mostramos el logo/imagen + texto */}
          <img src={iconoBandera} alt="Logo bandera" className="logo-img" />
          Embalses Madrid
        </div>
      </div>

      <ul className="navbar__center">
        {/* Creamos enlaces con NavLink para resaltar el activo */}
        <li><NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>Inicio</NavLink></li>
        <li><NavLink to="/embalses" className={({ isActive }) => (isActive ? 'active' : '')}>Embalses</NavLink></li>
        <li><NavLink to="/alertas" className={({ isActive }) => (isActive ? 'active' : '')}>Alertas</NavLink></li>
        <li><NavLink to="/calculadora" className={({ isActive }) => (isActive ? 'active' : '')}>Sobre el proyecto</NavLink></li>
      </ul>

      <div className="search-box">
        {/* Icono de lupa en la barra de bsqueda */}
        <img
          src={iconoBusqueda}
          alt="Buscar"
          className="search-logo"
          onClick={handleSearchSubmit}
        />
        {/* Input para buscar embalses */}
        <input
          ref={inputRef}
          type="text"
          placeholder="Buscar embalse..."
          value={searchValue}
          onChange={handleSearchChange}
          onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
        />
        {/* Botón para limpiar el campo de búsqueda */}
        {searchValue && (
          <button className="clear-button" onClick={handleClearSearch}>×</button>
        )}

        {/* Mostramos sugerencias si hay resultados */}
        {suggestions.length > 0 && (
          <ul className="autocomplete-list">
            {suggestions.map((embalse, index) => (
              <li
                key={index}
                className="autocomplete-item"
                onClick={() => handleSuggestionClick(embalse.slug)}
              >
                {embalse.nombre}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Botón para alternar entre el modo claro/oscuro */}
      <div className="theme-icon" onClick={toggleTheme} title="Cambiar tema">
        <img
          src={darkMode ? iconoClaro : iconoOscuro}
          alt="Tema"
          className="theme-img"
        />
      </div>
    </nav>
  )
}

export default Navbar
