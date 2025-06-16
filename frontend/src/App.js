import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './Componentes/Navbar'
import Mapa from './Componentes/Mapa'
import ResumenEmbalses from './Componentes/ResumenEmbalses'
import Footer from './Componentes/Footer'

import Embalses from './Paginas/Embalses'
import Alertas from './Paginas/Alertas'
import Calculadora from './Paginas/Calculadora'
import EmbalseDetalle from './Paginas/EmbalseDetalle' 

import './Estilos/App.css'

function App() {
  return (
    <div className="App">
      <Navbar />

      <main className="App-main">
        <Routes>
          <Route
            path="/"
            element={
              <div className="App-content">
                <div className="App-mapa">
                  <Mapa />
                </div>
                <div className="App-resumen">
                  <ResumenEmbalses />
                </div>
              </div>
            }
          />
          <Route path="/embalses" element={<Embalses />} />
          <Route path="/embalses/:id" element={<EmbalseDetalle />} /> 
          <Route path="/alertas" element={<Alertas />} />
          <Route path="/calculadora" element={<Calculadora />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
