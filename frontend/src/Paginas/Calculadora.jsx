import React, { useState } from 'react';
import '../Estilos/Calculadora.css';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  Legend,
  ReferenceLine,
  LineChart,
  Line
} from 'recharts';

// Importamos los datos desde archivos JSON
import datosConsumoComunidades from '../Datos/consumo_medio_de_agua_de_los_hogares_por_comunidad_autonoma.json';
import datosMadrid from '../Datos/evolucion_embalsada_madrid.json';
import datosPoblacion from '../Datos/poblacion_madrid.json';
import datosWater from '../Datos/global_water_consumption.json';

// Función que devuelve 3 datos curiosos aleatorios
function getDatosCuriososAleatorios() {
  const mensajes = [
    'Una ducha de 10 minutos gasta aproximadamente 90 litros de agua.',
    'Una lavadora consume en promedio 60 litros por ciclo.',
    'Un lavavajillas eficiente puede usar solo 10 litros por lavado.',
    'Dejar el grifo abierto al lavarte los dientes puede gastar más de 10 litros por minuto.',
    'Una cisterna convencional descarga entre 6 y 12 litros por uso.',
    'Llenar una bañera puede requerir hasta 200 litros de agua.',
    'Un grifo que gotea puede desperdiciar más de 30 litros al día.'
  ];
  return mensajes.sort(() => 0.5 - Math.random()).slice(0, 3);
}

export default function Calculadora() {
  // Estados del formulario
  const [respuestas, setRespuestas] = useState({
    duchas: '', minutosDucha: '', lavavajillas: '', friegaMano: '',
    cisterna: '', lavadora: '', jardin: '', manos: '', grifoManos: '',
    cara: '', grifoCara: '', dientes: '', grifoDientes: '',
    vasos: '', cocinar: '', otrasVeces: '', otrasGrifo: ''
  });
  const [errores, setErrores] = useState({});
  const [mostrarResultado, setMostrarResultado] = useState(false);
  const [paso, setPaso] = useState(1);
  const [datosCuriosos, setDatosCuriosos] = useState(getDatosCuriososAleatorios());

  const isMobile = window.innerWidth <= 540;

  // Actualiza respuestas y borra errores si el campo es válido
  const handleChange = e => {
    const { name, value } = e.target;
    if (/^\d*$/.test(value)) {
      setRespuestas({ ...respuestas, [name]: value });
      setErrores({ ...errores, [name]: '' });
    }
  };

  // Valida que los campos del paso actual estén llenos
  const validarCampos = campos => {
    const nuevos = {};
    campos.forEach(c => {
      if (!respuestas[c]) nuevos[c] = 'Este campo no puede estar vacío.';
    });
    setErrores(nuevos);
    return Object.keys(nuevos).length === 0;
  };

  // Calculamos el consumo total de agua con las respuestas dadas
  const calcularConsumo = () => {
    const r = respuestas;
    const suma = 
      (r.duchas * r.minutosDucha * 9) +
      (r.cisterna * 7 * 6) +
      (r.lavavajillas * 10) +
      (r.friegaMano * 40) +
      (r.lavadora * 60) +
      (r.jardin * 80) +
      (r.manos * r.grifoManos * 6) +
      (r.cara * r.grifoCara * 6) +
      (r.dientes * r.grifoDientes * 6) +
      (r.vasos * 0.25) +
      (r.cocinar * 1) +
      (r.otrasVeces * r.otrasGrifo * 6);
    return Math.round(suma);
  };

  // Reinicia el formulario
  const reiniciarFormulario = () => {
    setRespuestas({
      duchas: '', minutosDucha: '', lavavajillas: '', friegaMano: '',
      cisterna: '', lavadora: '', jardin: '', manos: '', grifoManos: '',
      cara: '', grifoCara: '', dientes: '', grifoDientes: '',
      vasos: '', cocinar: '', otrasVeces: '', otrasGrifo: ''
    });
    setErrores({});
    setPaso(1);
    setMostrarResultado(false);
    setDatosCuriosos(getDatosCuriososAleatorios());
  };

  const totalLitros = calcularConsumo();
  const consumoDiario = Math.round(totalLitros / 7);
  const nivelConsumo =
    totalLitros < 1000 ? 'Bajo ✅' :
    totalLitros < 2000 ? 'Medio ⚠️' : 'Alto 🚨';

  // Agrupamos preguntas por paso del formulario
  const preguntasPorPaso = {
    1: [
      { name: 'duchas', label: '¿Cuántas veces te duchas a la semana?', placeholder: 'Ej: 7' },
      { name: 'minutosDucha', label: '¿Cuántos minutos dura tu ducha?', placeholder: 'Ej: 10' },
      { name: 'lavavajillas', label: '¿Cuántas veces usas el lavavajillas por semana?', placeholder: 'Ej: 3' },
      { name: 'friegaMano', label: '¿Cuántas veces friegas a mano por semana?', placeholder: 'Ej: 4' },
      { name: 'vasos', label: '¿Cuántos vasos de agua bebes al día?', placeholder: 'Ej: 8' }
    ],
    2: [
      { name: 'cisterna', label: '¿Cuántas veces tiras de la cisterna al día?', placeholder: 'Ej: 5' },
      { name: 'lavadora', label: '¿Cuántas veces pones la lavadora por semana?', placeholder: 'Ej: 3' },
      { name: 'manos', label: '¿Cuántas veces te lavas las manos al día?', placeholder: 'Ej: 5' },
      { name: 'grifoManos', label: '¿Cuántos segundos usas el grifo al lavarte las manos?', placeholder: 'Ej: 10' },
      { name: 'cocinar', label: '¿Cuántos litros usas al día para cocinar?', placeholder: 'Ej: 2' }
    ],
    3: [
      { name: 'cara', label: '¿Cuántas veces te lavas la cara al día?', placeholder: 'Ej: 2' },
      { name: 'grifoCara', label: '¿Cuántos segundos usas el grifo al lavarte la cara?', placeholder: 'Ej: 10' },
      { name: 'dientes', label: '¿Cuántas veces te lavas los dientes al día?', placeholder: 'Ej: 3' },
      { name: 'grifoDientes', label: '¿Cuántos segundos usas el grifo al lavarte los dientes?', placeholder: 'Ej: 20' },
      { name: 'otrasVeces', label: '¿Cuántas veces usas el grifo para otras tareas?', placeholder: 'Ej: 3' },
      { name: 'otrasGrifo', label: '¿Cuántos segundos dura ese uso?', placeholder: 'Ej: 30' }
    ]
  };

  // Campos a validar por paso
  const camposPorPaso = {
    1: ['duchas', 'minutosDucha', 'lavavajillas', 'friegaMano', 'vasos'],
    2: ['cisterna', 'lavadora', 'manos', 'grifoManos', 'cocinar'],
    3: ['cara', 'grifoCara', 'dientes', 'grifoDientes', 'otrasVeces', 'otrasGrifo']
  };

  // Procesamos datos para gráficos a partir de los archivos JSON
  const dataMadrid = datosMadrid.map(d => ({
    semana: d.Fecha.slice(0, 10),
    Capacidad: d.Suma_Agua_Actual
  }));

  const dataPoblacion = datosPoblacion.map(d => ({
    Año: d.Año,
    total: d.PoblacionTotal,
    hombres: d.PoblacionHombre,
    mujeres: d.PoblacionMujer
  }));

  const selectedCountries = ['Spain','USA','China','India','Brazil','Russia','Australia','Germany','Mexico'];
  const countryColors = {
    Spain: '#d32f2f', USA: '#1976d2', China: '#fbc02d', India: '#388e3c',
    Brazil: '#f57c00', Russia: '#7b1fa2', Australia: '#0288d1',
    Germany: '#689f38', Mexico: '#512da8'
  };
  const years = Array.from(new Set(datosWater.map(d=>d.Year))).sort((a,b)=>a-b);
  const pivot = years.map(year=>{
    const entry = { year };
    selectedCountries.forEach(c=>{
      const rec = datosWater.find(d=>d.Year===year && d.Country===c);
      entry[c] = rec ? rec['Per Capita Water Use (Liters per Day)'] : null;
    });
    return entry;
  });

  // Tooltip personalizado para los gráficos
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const sorted = [...payload].sort((a,b)=> (b.value||0)-(a.value||0));
      return (
        <div className="custom-tooltip">
          <p className="label">{label}</p>
          {sorted.map(e=>(
            <p key={e.name} style={{ color: e.stroke, margin:0 }}>
              {e.name}: {e.value.toFixed(2)} L/día
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
  <>
    {/* Encabezado de la sección de introducción */}
    <div className="calculadora-page">
      <h1 className="titulo-calculadora">Sobre el Proyecto</h1>
    </div>

    {/* Introducción y grafica de consumo por país */}
    <div className="graficas-side-by-side">
      {/* Tarjeta con texto explicativo */}
      <div className="intro-card">
        <p>
          Este proyecto nace de la necesidad de ofrecer información clara y accesible sobre la evolución de los recursos hídricos en la Comunidad de Madrid, donde el equilibrio entre el nivel de los embalses y la creciente demanda plantea retos de sostenibilidad a corto y largo plazo.
        </p>
        <p>
          El gráfico muestra el consumo diario de agua per cápita en varios países entre el año 2000 y 2024. Esta comparación internacional permite comprender cómo factores como el clima, la densidad de población o los hábitos culturales influyen en el uso del agua.
        </p>
        <p>
          En el caso de España, el consumo medio se sitúa entre 280 y 300 litros por persona y día, con picos estivales que reflejan el aumento de temperatura y el turismo. Estas variaciones ponen de manifiesto la importancia de promover hábitos de ahorro especialmente en los meses de más calor.
        </p>
      </div>

      {/* Gráfico de consumo per cápita por país */}
      <div className="grafica-container">
        <h2>Consumo diario de agua per cápita por país (2000–2024)</h2>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={pivot} margin={{ top:0, right:20, left:-25, bottom:30 }}>
            <XAxis dataKey="year" type="number" domain={['dataMin','dataMax']} allowDecimals={false} />
            <YAxis domain={[100,450]} ticks={[100,200,300,450]} tickFormatter={v=>v.toLocaleString()} />
            <Tooltip content={<CustomTooltip />} />
            {/* Oculta leyenda si es móvil */}
            {!isMobile && (
              <Legend verticalAlign="top" align="center" height={36} />
            )}
            {/* Línea por cada país */}
            {selectedCountries.map(pais=>(
              <Line
                key={pais}
                type="monotone"
                dataKey={pais}
                name={pais}
                stroke={countryColors[pais]}
                dot={false}
                strokeWidth={2}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
        <p className="fuente">
          Fuente: Kaggle. Consumo diario de agua per cápita por país (2000–2024).
        </p>
      </div>
    </div>

    {/* Gráfico de población + contexto histórico */}
    <div className="graficas-side-by-side">
      {/* Gráfico de población por año */}
      <div className="grafica-container">
        <h2>Población de la Comunidad de Madrid (1857–2024)</h2>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={dataPoblacion} margin={{ top:20,right:20,left:0,bottom:-30 }}>
            <XAxis
              dataKey="Año"
              type="category"
              height={60}
              angle={window.innerWidth <= 540 ? -45 : 0}
              textAnchor={window.innerWidth <= 540 ? 'end' : 'middle'}
              tickFormatter={(val, i) => {
                if (window.innerWidth <= 540) {
                  return i % 10 === 0 ? val : '';
                }
                return val;
              }}
            />
            <YAxis domain={[0,'dataMax']} tickFormatter={v=>v.toLocaleString()} width={80} />
            <Tooltip formatter={v=>v.toLocaleString()} />
            <Legend verticalAlign="top" wrapperStyle={{display: window.innerWidth <= 540 ? 'none' : 'block'}} />
            <Line type="monotone" dataKey="total" name="Total" stroke="#ffa726" dot={false} />
            <Line type="monotone" dataKey="hombres" name="Hombres" stroke="#42a5f5" dot={false} />
            <Line type="monotone" dataKey="mujeres" name="Mujeres" stroke="#ec407a" dot={false} />
          </LineChart>
        </ResponsiveContainer>
        <p className="fuente">
          Fuente: Instituto de Estadística de la Comunidad de Madrid.
        </p>
      </div>

      {/* Texto histórico sobre la evolución de la infraestructura hídrica */}
      <div class="intro-card">
        <p>
          El gráfico muestra cómo la población madrileña creció de menos de 500.000 en 1857 a más de 7 millones en 2024, multiplicando por catorce la demanda de agua para usos domésticos, agrícolas e industriales.
        </p>
        <p>
          Frente a esta demanda, en el siglo XIX se impulsó el Canal de Isabel II (1851) y se levantó el embalse del Pontón de la Oliva (1857). 
        </p>
        <p>
          Con el fuerte crecimiento demográfico entre 1960 y 1980, se llevaron a cabo obras como la ampliación del embalse de Santillana (1969) y la construcción de El Atazar (1972), que permitieron responder a la mayor demanda de agua y reforzar la seguridad del suministro.
        </p>
        <p>
          Aunque el crecimiento poblacional se ha moderado, cada nuevo habitante incrementa la demanda sobre los recursos hídricos, lo que exige planificar nuevas infraestructuras y fomentar el ahorro para equilibrar capacidad y consumo.
        </p>
      </div>
    </div>

    {/* Explicación sobre embalses + gráfico de agua embalsada */}
    <div className="graficas-side-by-side">
      {/* Información sobre fuentes de agua y contexto de uso */}
      <div class="intro-card">
        <p>
          La Comunidad de Madrid se abastece principalmente de los ríos Lozoya, Jarama y Guadarrama, a través de una red de embalses gestionada por el Canal de Isabel II. También se reutilizan aguas depuradas y se aprovechan acuíferos, especialmente en periodos secos.
        </p>
        <p>
          El gráfico muestra la evolución semanal del agua embalsada en Madrid (1988–2025), con subidas tras épocas de lluvias y caídas en veranos secos como 1992, 2005 o 2017. En los meses más secos, los niveles han llegado a acercarse a los 350 hm³, rozando situaciones críticas.
        </p>
        <p>
          Es importante tener en cuenta que, como se ha visto en el gráfico anterior, aunque el nivel de agua embalsada actual sea similar al de años anteriores, hoy la población es mucho mayor y la demanda de agua también lo es. Por tanto, el mismo volumen disponible supone una presión mayor sobre el sistema, lo que refuerza la necesidad de una gestión eficiente y una planificación adaptada al contexto actual.
        </p>
      </div>

      {/* Gráfico de área con niveles de agua embalsada */}
      <div className="grafica-container">
        <h2>Agua embalsada (hm³) en la Comunidad de Madrid (1988–2025)</h2>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={dataMadrid} margin={{ top: 20, right: 10, left: -20, bottom: -30 }}>
            <XAxis
              dataKey="semana"
              angle={-60}
              textAnchor="end"
              interval={0}
              height={80}
              tickFormatter={(val,i) => {
                const yr = new Date(val).getFullYear();
                return i === 0 || i === dataMadrid.length - 1 || i % 260 === 0 ? yr : '';
              }}
              tickLine={false}
            />
            <YAxis domain={[200,1200]} ticks={[200,400,600,800,1000,1200]} tickFormatter={v => v.toLocaleString()} />
            <Tooltip formatter={v => `${v.toLocaleString()} hm³`} />
            <Area type="monotone" dataKey="Capacidad" stroke="#4caf50" fill="#a5d6a7" />
          </AreaChart>
        </ResponsiveContainer>
        <p className="fuente">
          Fuente: Boletín Hidrológico Semanal, MITECO. Agua embalsada de Madrid (1988–2025).
        </p>
      </div>
    </div>

    {/* Sección llamada a la acción para usar la calculadora */}
    <div className="cta-section">
      <h2>¿Quieres conocer tu huella hídrica?</h2>
      <h3>Estima tu gasto de agua con la calculadora de consumo</h3>
    </div>

    {/* Aquí arranca la calculadora interactiva */}
    <div className="calculadora-page">
      <h1 className="titulo-calculadora">Calculadora de Consumo de Agua</h1>
      <div className="calculadora-container">
        <p className="intro">
          Esta calculadora te ayuda a estimar tu consumo semanal de agua en el hogar...
        </p>

        {/* Formulario de preguntas dividido en pasos */}
        {!mostrarResultado ? (
          <div className="formulario">
            {preguntasPorPaso[paso].map(({ name, label, placeholder }) => (
              <label key={name}>
                {label}
                <input
                  type="number"
                  name={name}
                  value={respuestas[name]}
                  onChange={handleChange}
                  min="0"
                  placeholder={placeholder}
                  className={errores[name] ? 'input-error' : ''}
                />
                {errores[name] && <span className="mensaje-error">{errores[name]}</span>}
              </label>
            ))}

            {/* Navegación entre pasos del formulario */}
            <div className="botones-finales">
              {paso > 1 && (
                <button className="button" onClick={() => setPaso(paso - 1)}>
                  Volver
                </button>
              )}
              <button
                className="button"
                onClick={() => {
                  if (validarCampos(camposPorPaso[paso])) {
                    paso < 3 ? setPaso(paso + 1) : setMostrarResultado(true);
                  }
                }}
              >
                {paso < 3 ? 'Siguiente' : 'Calcular'}
              </button>
            </div>
          </div>
        ) : (
          // Vista de resultados tras completar la calculadora
          <div className="resultado">
            <h2>Resultado Estimado</h2>
            <p>Consumo semanal: <strong>{totalLitros} L</strong></p>
            <p>Consumo diario: <strong>{consumoDiario} L</strong></p>
            <p>Nivel de consumo: <strong>{nivelConsumo}</strong></p>

            {/* Lista de datos curiosos sobre el agua */}
            <h2>Datos curiosos</h2>
            <div className="datos-curiosos">
              {datosCuriosos.map((d, i) => (
                <p key={i}>{d}</p>
              ))}
            </div>

            {/* Comparativa del consumo con datos reales por comunidad */}
            <h2 className="titulo-grafica">Consumo medio por comunidad (INE)</h2>
            <div style={{ position: 'relative', width: '100%', height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={datosConsumoComunidades.Respuesta.Datos.Metricas[0].Datos.map(d => ({
                    comunidad: d.Parametro,
                    '2020': d.Valor,
                    '2022': datosConsumoComunidades.Respuesta.Datos.Metricas[1].Datos.find(
                      x => x.Parametro === d.Parametro
                    ).Valor
                  }))}
                  margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="comunidad" angle={-60} textAnchor="end" />
                  <YAxis
                    domain={[0, Math.max(250, consumoDiario + 10)]}
                    label={{ value: 'L/hab/día', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    payload={[
                      { value: '2020', type: 'square', color: '#90caf9' },
                      { value: '2022', type: 'square', color: '#1976d2' },
                      { value: 'Tu consumo', type: 'line', color: 'red', strokeDasharray: '3 3' }
                    ]}
                  />
                  <Bar dataKey="2020" fill="#90caf9" />
                  <Bar dataKey="2022" fill="#1976d2" />
                  <ReferenceLine y={consumoDiario} stroke="red" strokeDasharray="3 3" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Botón para reiniciar el formulario */}
            <button className="button" onClick={reiniciarFormulario}>
              Volver a calcular
            </button>
          </div>
        )}
      </div>
    </div>
  </>
);}