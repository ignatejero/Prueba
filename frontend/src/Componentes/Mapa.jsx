import 'mapbox-gl/dist/mapbox-gl.css';
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import embalseIcon from '../Iconos/embalse.png';
import '../Estilos/Mapa.css';

// Establecemos el token de acceso de Mapbox
mapboxgl.accessToken = 'pk.eyJ1IjoiaWduYXRlaiIsImEiOiJjbTlrMjk4bHkwZmN5MmpzZHc4YXBmeW54In0.PWM_bTJ5yLL_HtS9Sbp9Yw';

const Mapa = () => {
  // Referencia al contenedor del mapa
  const mapaContainer = useRef(null);

  // Guardamos la instancia del mapa en el estado
  const [map, setMap] = useState(null);

  // Controlamos si se muestra o no la leyenda
  const [mostrarLeyenda, setMostrarLeyenda] = useState(true);

  // Indicamos si estamos en vista 3D o no
  const [is3D, setIs3D] = useState(false);

  useEffect(() => {
    // Creamos el mapa con estilo "outdoors" centrado en Madrid
    const mapInstance = new mapboxgl.Map({
      container: mapaContainer.current,
      style: 'mapbox://styles/mapbox/outdoors-v11',
      center: [-3.7038, 40.7168],
      zoom: 8.25,
      projection: 'mercator',
    });
    setMap(mapInstance);

    mapInstance.on('load', async () => {
      // Activamos la niebla para efecto atmosférico
      mapInstance.setFog({});

      // Añadimos controles de navegación en la esquina superior derecha
      mapInstance.addControl(
        new mapboxgl.NavigationControl({ showCompass: true }),
        'top-right'
      );

      // Ponemos una capa para resaltar los ríos
      mapInstance.addLayer({
        id: 'river-highlight',
        type: 'line',
        source: 'composite',
        'source-layer': 'waterway',
        paint: {
          'line-color': '#00BFFF',
          'line-width': 2,
          'line-opacity': 0.8,
        },
      });

      // Añadimos relleno a embalses (zonas de agua clasificadas como 'reservoir')
      mapInstance.addLayer({
        id: 'reservoir-fill',
        type: 'fill',
        source: 'composite',
        'source-layer': 'water',
        filter: ['==', ['get', 'class'], 'reservoir'],
        paint: {
          'fill-color': '#326ca5',
          'fill-opacity': 0.7,
          'fill-outline-color': '#0A74DA',
        },
      });

      // Añadimos efecto glow alrededor de los embalses
      mapInstance.addLayer({
        id: 'reservoir-glow',
        type: 'line',
        source: 'composite',
        'source-layer': 'water',
        filter: ['==', ['get', 'class'], 'reservoir'],
        paint: {
          'line-color': '#1E90FF',
          'line-width': 12,
          'line-blur': 6,
          'line-opacity': 0.25,
        },
      });

      // Añadimos un contorno para la Comunidad de Madrid con archivo GeoJSON
      mapInstance.addSource('madrid', {
        type: 'geojson',
        data: '/geojson/Madrid.geojson',
      });
      mapInstance.addLayer({
        id: 'madrid-outline',
        type: 'line',
        source: 'madrid',
        paint: {
          'line-color': '#e60026',
          'line-width': 3,
        },
      });

      // Añadimos elevación y cielo para el modo 3D
      mapInstance.addSource('mapbox-dem', {
        type: 'raster-dem',
        url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
        tileSize: 512,
        maxzoom: 14,
      });
      mapInstance.addLayer({
        id: 'sky',
        type: 'sky',
        paint: {
          'sky-type': 'atmosphere',
          'sky-atmosphere-sun': [0.0, 0.0],
          'sky-atmosphere-sun-intensity': 15,
        },
      });

      // Añadimos edificios 3D debajo de las etiquetas
      const layers = mapInstance.getStyle().layers;
      let labelLayerId;
      for (const layer of layers) {
        if (layer.type === 'symbol' && layer.layout && layer.layout['text-field']) {
          labelLayerId = layer.id;
          break;
        }
      }

      mapInstance.addLayer(
        {
          id: 'edificios-3d',
          source: 'composite',
          'source-layer': 'building',
          filter: ['==', ['get', 'extrude'], 'true'], // Mostramos solo edificios extruidos
          type: 'fill-extrusion',
          paint: {
            'fill-extrusion-color': '#d8cfc3',
            'fill-extrusion-height': ['to-number', ['get', 'height']],
            'fill-extrusion-base': ['to-number', ['get', 'min_height']],
            'fill-extrusion-opacity': 0.9,
          },
        },
        labelLayerId
      );

      // Función para generar slugs desde nombres
      const slugify = (nombre) =>
        nombre
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/\s+/g, '-')
          .replace(/[^\w-]+/g, '')
          .replace(/--+/g, '-');

      try {
        // Pedimos los datos de embalses desde la API
        const res = await fetch('https://octopus-app-p7ahd.ondigitalocean.app/embalses');
        const embalses = await res.json();

        // Para cada embalse, ponemos un marcador en el mapa
        embalses.forEach((e) => {
          const [lng, lat] = e.ubicacion_geo.coordinates;
          const slug = slugify(e.nombre);

          const el = document.createElement('div');
          el.className = 'embalse-marcador';
          el.style.backgroundImage = `url(${embalseIcon})`;

          const popup = new mapboxgl.Popup({ offset: 15 }).setHTML(
            `<div class="popup-embalse">
              <h4>${e.nombre}</h4>
              <p><strong>Capacidad:</strong> ${e.capacidad} hm³</p>
              <p><strong>Volumen:</strong> ${e.volumen_porcentual} %</p>
              <a href="/embalses/${slug}" class="popup-link">Ver ficha detallada</a>
            </div>`
          );

          new mapboxgl.Marker({ element: el, anchor: 'bottom' })
            .setLngLat([lng, lat])
            .setPopup(popup)
            .addTo(mapInstance);
        });
      } catch (err) {
        console.error('Error cargando embalses:', err);
      }
    });

    // Redimensionamos el mapa después de montarlo
    setTimeout(() => mapInstance.resize(), 200);

    // Limpiamos el mapa al desmontar el componente
    return () => mapInstance.remove();
  }, []);

  // Cambiamos entre vista 2D y 3D
  const toggle3D = () => {
    if (!map) return;

    if (!is3D) {
      map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.2 });
      map.setProjection('globe');
      map.easeTo({ pitch: 60, bearing: 0, duration: 1000 });
    } else {
      map.setTerrain(null);
      map.setProjection('mercator');
      map.easeTo({ pitch: 0, bearing: 0, duration: 1000 });
    }

    setIs3D((prev) => !prev);
  };

  // Restablecemos la vista inicial del mapa
  const resetVista = () => {
    if (!map) return;

    map.setTerrain(null);
    map.setProjection('mercator');
    map.easeTo({
      center: [-3.7038, 40.7168],
      zoom: 8.25,
      pitch: 0,
      bearing: 0,
      duration: 1000,
    });

    setIs3D(false);
  };

  return (
    <section className="seccion-mapa">
      <h1>Consulta los Embalses de la Comunidad de Madrid</h1>

      <div className="mapa-card">
        <div ref={mapaContainer} className="mapa-div">
          {/* Botones sobre el mapa */}
          <div className="botonera-superpuesta">
            <button
              className="leyenda-boton"
              onClick={() => setMostrarLeyenda((m) => !m)}
            >
              {mostrarLeyenda ? 'Ocultar Leyenda' : 'Mostrar Leyenda'}
            </button>
            <button className="reset-vista-boton" onClick={resetVista}>
              Resetear Vista
            </button>
            <button className="toggle-2d3d-boton" onClick={toggle3D}>
              {is3D ? 'Vista 2D' : 'Vista 3D'}
            </button>
          </div>

          {/* Mostramos la leyenda si está activada */}
          {mostrarLeyenda && (
            <div className="leyenda-panel">
              <div>
                <img src={embalseIcon} alt="Embalse" /> Embalses
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Mapa;
