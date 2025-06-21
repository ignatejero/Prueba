import React, { useState, useEffect } from 'react';
import '../Estilos/Footer.css';
import telegramIcon from '../Iconos/telegram.png';
import banderaIcon from '../Iconos/banderaMadrid.png';
import modoDarkIcon from '../Iconos/modo-noche.png';
import modoLightIcon from '../Iconos/modo-dia.png';

const Footer = () => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
  }, [darkMode]);

  return (
    <footer className="footer">
      {/* Toggle por encima de todo */}
      <div className="footer-theme-toggle-above">
        <img
          src={darkMode ? modoLightIcon : modoDarkIcon}
          alt="Cambiar tema"
          className="theme-toggle"
          onClick={() => setDarkMode(!darkMode)}
        />
      </div>

      <div className="footer-container">
        {/* Institucional */}
        <div className="footer-column">
          <h4>
            <img src={banderaIcon} alt="Bandera Madrid" className="footer-bandera" />
            Embalses CAM
          </h4>
          <p className="footer-attribution">
            Datos proporcionados por{' '}
            <a href="https://www.miteco.gob.es/" target="_blank" rel="noopener noreferrer">
            <strong>Ministerio para la Transición Ecológica</strong>
            </a>{' '}
            y{' '}
            <a href="https://www.chtajo.es/" target="_blank" rel="noopener noreferrer">
            <strong>SAIH Confederaciones</strong>
            </a>
          </p>
          <p><strong>Jose Ignacio Tejero Ruiz © 2025</strong></p>
        </div>

        {/* Navegación */}
        <div className="footer-column">
          <h4>Navegación</h4>
          <ul>
            <li><a href="/"><strong>Inicio</strong></a></li>
            <li><a href="/embalses"><strong>Embalses</strong></a></li>
            <li><a href="/alertas"><strong>Alertas</strong></a></li>
            <li><a href="/calculadora"><strong>Sobre el proyecto</strong></a></li>
          </ul>
        </div>

        {/* Contacto */}
        <div className="footer-column">
          <h4>Contacto</h4>
          <p>
            <a href="https://t.me/EMBALSES_CAM" target="_blank" rel="noopener noreferrer">
              <img src={telegramIcon} alt="Telegram" className="telegram-icon" />
              <strong>@EMBALSES_CAM</strong>
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
