import React, { useState } from 'react';
import { Save, AlertCircle, Users, Package, Wrench, Fuel, Utensils, Tent, Droplets, Heart, PawPrint, ChevronLeft, ChevronRight } from 'lucide-react';
import './FormularioBrigadas.css';

const FormularioBrigadas = () => {
  const [brigada, setBrigada] = useState({
    nombre: '',
    cantidad_bomberos_activos: '',
    contacto_celular_comandante: '',
    encargado_logistica: '',
    contacto_celular_logistica: '',
    numero_emergencia_publico: ''
  });

  const [inventario, setInventario] = useState({
    epp: {},
    herramientas: {},
    logistica: {},
    alimentacion: {},
    campo: {},
    limpieza: {},
    medicamentos: {},
    rescate_animal: {}
  });

  const tallas = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const tallasBotas = ['37', '38', '39', '40', '41', '42', '43'];

  const recursosEPP = [
    { nombre: 'Camisa Forestal', requiere_talla: true },
    { nombre: 'Pantalón Forestal', requiere_talla: true },
    { nombre: 'Overol FR', requiere_talla: true },
    { nombre: 'Botas para Bomberos Forestales', requiere_talla: true, tallas_especiales: tallasBotas },
    { nombre: 'Guantes de Cuero', requiere_talla: true },
    { nombre: 'Esclavina', requiere_talla: false },
    { nombre: 'Linterna', requiere_talla: false },
    { nombre: 'Antiparra', requiere_talla: false },
    { nombre: 'Casco Forestal Ala Ancha', requiere_talla: false },
    { nombre: 'Máscara para Polvo y Partículas', requiere_talla: false },
    { nombre: 'Máscara Media Cara', requiere_talla: false }
  ];

  const recursosHerramientas = [
    'Linternas de Cabeza', 'Pilas AA', 'Pilas AAA', 'Azadón', 'Pala con Mango de Fibra',
    'Rastrillo Mango de Fibra', 'McLeod Mango de Fibra', 'Batefuego', 'Górgui',
    'Pulasky con Mango de Fibra', 'Quemador de Goteo', 'Mochila Forestale', 'Escobeta de Alambre'
  ];

  const recursosLogistica = [
    'Gasolina', 'Diésel', 'Amortiguadores', 'Prensa Disco', 'Rectificación de Frenos',
    'Llantas', 'Aceite de Motor', 'Grasa', 'Cambio de Aceite'
  ];

  const recursosAlimentacion = [
    'Alimentos y Bebidas', 'Agua', 'Rehidratantes', 'Barras Energizantes', 'Lata de Atún',
    'Lata de Frejol', 'Lata de Viandada', 'Lata de Chorizos', 'Refresco en Sobres',
    'Leche Polvo', 'Frutos Secos', 'Pastillas de Menta o Dulces', 'Alimentos No Perecederos'
  ];

  const recursosCampo = ['Colchoneta', 'Sleeping', 'Camping'];

  const recursosLimpieza = [
    'Shampoo Envase Pequeños o Sachet', 'Jaboncillos', 'Pasta Dental', 'Cepillo de Dientes',
    'Toallas Húmedas', 'Toallas Higiénicas', 'Papel Higiénico', 'Ace', 'Lavandina'
  ];

  const recursosMedicamentos = [
    'Agua Destilada 5 ML', 'Agua Oxigenada', 'Alcohol', 'Algodón', 'Amoxicilina 1 Gramo',
    'Bacitracina Neomicina Pomada', 'Branula 16', 'Ciprofloxacino 1 Gramo', 'Complejo B 10.000 U',
    'Dexametasona 4 MG', 'Diclofenaco 50 MGS', 'Diclofenaco 75 MGS', 'Equipo de Venoclisis',
    'Gasas', 'Gentamicina Colirio', 'Hidrocortisona 500 MGS Ampolla', 'Ibuprofeno 600 COMP',
    'Ibuprofeno 200 MGS Jarabe', 'Jeringas 5ML', 'Loratadina 10 MGS', 'Nafazolina Colirio',
    'Paracetamol 100 MGS Jarabe', 'Paracetamol 500 MGS', 'Povidona Yodada 100 ML',
    'Quemacuran Pomada', 'Refrianex Comprimidos', 'Rifamicina Spray', 'Sales de Rehidratación',
    'Sertal Compuesto', 'Suero Dextrosa 0,5 %', 'Suero Fisiológico', 'Tabletas Potabilizadoras de Agua',
    'Barbijos', 'Tanque Oxígeno', 'Fluidimed', 'Repelente', 'Talco para Pies',
    'Crema para Aescaldadura', 'Nebulizador'
  ];

  const recursosRescateAnimal = ['Alimentos para Animales'];

  const [pasoActual, setPasoActual] = useState(0);

  const pasos = [
    { id: 'brigada', label: 'Información Brigada', icono: Users, color: 'icon-blue' },
    { id: 'epp', label: 'EPP', icono: Package, color: 'icon-orange' },
    { id: 'herramientas', label: 'Herramientas', icono: Wrench, color: 'icon-gray' },
    { id: 'logistica', label: 'Logística', icono: Fuel, color: 'icon-blue' },
    { id: 'alimentacion', label: 'Alimentación', icono: Utensils, color: 'icon-green' },
    { id: 'campo', label: 'Equipo Campo', icono: Tent, color: 'icon-purple' },
    { id: 'limpieza', label: 'Limpieza', icono: Droplets, color: 'icon-cyan' },
    { id: 'medicamentos', label: 'Medicamentos', icono: Heart, color: 'icon-red' },
    { id: 'rescate', label: 'Rescate Animal', icono: PawPrint, color: 'icon-amber' }
  ];

  const actualizarInventario = (categoria, recurso, talla, valor) => {
    setInventario(prev => ({
      ...prev,
      [categoria]: {
        ...prev[categoria],
        [recurso]: {
          ...prev[categoria][recurso],
          [talla || 'cantidad']: parseInt(valor) || 0
        }
      }
    }));
  };

  const renderCampoTallas = (recurso, categoria, tallasCustom = tallas) => {
    return (
      <div className="tallas-grid">
        {tallasCustom.map(talla => (
          <div key={talla} className="talla-group">
            <label className="talla-label">{talla}</label>
            <input
              type="number"
              min="0"
              className="talla-input"
              placeholder="0"
              value={inventario[categoria]?.[recurso]?.[talla] || ''}
              onChange={(e) => actualizarInventario(categoria, recurso, talla, e.target.value)}
            />
          </div>
        ))}
      </div>
    );
  };

  const renderCampoSimple = (recurso, categoria) => {
    return (
      <div className="cantidad-container">
        <input
          type="number"
          min="0"
          className="cantidad-input"
          placeholder="Cantidad"
          value={inventario[categoria]?.[recurso]?.cantidad || ''}
          onChange={(e) => actualizarInventario(categoria, recurso, null, e.target.value)}
        />
      </div>
    );
  };

  const renderSeccionEPP = () => (
    <div className="resources-container">
      <div className="section-header">
        <Package className="icon-lg icon-orange" />
        <h3 className="section-title">Equipo de Protección Personal (EPP)</h3>
      </div>
      
      {recursosEPP.map(recurso => (
        <div key={recurso.nombre} className="resource-card">
          <h4 className="resource-title">{recurso.nombre}</h4>
          {recurso.requiere_talla ? 
            renderCampoTallas(recurso.nombre, 'epp', recurso.tallas_especiales) : 
            renderCampoSimple(recurso.nombre, 'epp')
          }
        </div>
      ))}
    </div>
  );

  const renderSeccionSimple = (titulo, recursos, categoria, IconComponent, iconColor) => (
    <div className="resources-container">
      <div className="section-header">
        <IconComponent className={`icon-lg ${iconColor}`} />
        <h3 className="section-title">{titulo}</h3>
      </div>
      
      <div className="resources-grid three-cols">
        {recursos.map(recurso => (
          <div key={recurso} className="resource-card">
            <h4 className="resource-title">{recurso}</h4>
            {renderCampoSimple(recurso, categoria)}
          </div>
        ))}
      </div>
    </div>
  );

  const siguientePaso = () => {
    if (pasoActual < pasos.length - 1) {
      setPasoActual(pasoActual + 1);
    }
  };

  const pasoAnterior = () => {
    if (pasoActual > 0) {
      setPasoActual(pasoActual - 1);
    }
  };

  const validarPasoActual = () => {
    if (pasoActual === 0) {
      // Validar información básica de la brigada
      return brigada.nombre.trim() !== '';
    }
    return true; // Para otros pasos, permitir continuar sin validación estricta
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const datosCompletos = {
      brigada,
      inventario
    };
    
    console.log('Datos del formulario:', datosCompletos);
    alert('Formulario enviado correctamente. Revisa la consola para ver el JSON completo.');
  };

  const navegacion = [
    { id: 'brigada', label: 'Información Brigada', icono: Users, color: 'icon-blue' },
    { id: 'epp', label: 'EPP', icono: Package, color: 'icon-orange' },
    { id: 'herramientas', label: 'Herramientas', icono: Wrench, color: 'icon-gray' },
    { id: 'logistica', label: 'Logística', icono: Fuel, color: 'icon-blue' },
    { id: 'alimentacion', label: 'Alimentación', icono: Utensils, color: 'icon-green' },
    { id: 'campo', label: 'Equipo Campo', icono: Tent, color: 'icon-purple' },
    { id: 'limpieza', label: 'Limpieza', icono: Droplets, color: 'icon-cyan' },
    { id: 'medicamentos', label: 'Medicamentos', icono: Heart, color: 'icon-red' },
    { id: 'rescate', label: 'Rescate Animal', icono: PawPrint, color: 'icon-amber' }
  ];

  return (
    <div className="formulario-container">
      <div className="container">
        {/* Header */}
        <div className="header">
          <div className="header-content">
            <div className="header-icon">
              <Users className="icon-xl icon-green" />
            </div>
            <div>
              <h1 className="header-title">Sistema de Brigadas Forestales</h1>
              <p className="header-subtitle">Gestión de recursos y equipamiento</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Indicador de progreso */}
          <div className="progress-container">
            <div className="progress-header">
              <span className="progress-title">Progreso del formulario:</span>
              
              <span className="progress-counter" style={{ marginLeft: '8px' }}>{pasoActual + 1} de {pasos.length}</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${((pasoActual + 1) / pasos.length) * 100}%` }}
              ></div>
            </div>
            <div className="current-step-info">
              {React.createElement(pasos[pasoActual].icono, { className: "icon" })}
              <span className="current-step-name">{pasos[pasoActual].label}</span>
            </div>
          </div>

          {/* Navegación por pestañas (solo visual) */}
          <div className="nav-container">
            <div className="nav-tabs">
              {navegacion.map((item, index) => {
                const IconComponent = item.icono;
                return (
                  <div
                    key={item.id}
                    className={`nav-tab ${index === pasoActual ? 'active' : ''} ${index < pasoActual ? 'completed' : ''}`}
                    style={{ opacity: index <= pasoActual ? 1 : 0.5 }}
                  >
                    <IconComponent className="icon" />
                    {item.label}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Contenido */}
          <div className="content-container">
            {pasoActual === 0 && (
              <div className="resources-container">
                <div className="section-header">
                  <Users className="icon-lg icon-blue" />
                  <h3 className="section-title">Información de la Brigada</h3>
                </div>
                
                <div className="form-grid two-cols">
                  <div className="form-group">
                    <label className="form-label">
                      Nombre de la Brigada *
                    </label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      value={brigada.nombre}
                      onChange={(e) => setBrigada({...brigada, nombre: e.target.value})}
                      placeholder="Ej: Brigada Central"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">
                      Cantidad de Bomberos Activos
                    </label>
                    <input
                      type="number"
                      min="0"
                      className="form-input"
                      value={brigada.cantidad_bomberos_activos}
                      onChange={(e) => setBrigada({...brigada, cantidad_bomberos_activos: e.target.value})}
                      placeholder="Ej: 25"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">
                      Celular del Comandante
                    </label>
                    <input
                      type="tel"
                      className="form-input"
                      value={brigada.contacto_celular_comandante}
                      onChange={(e) => setBrigada({...brigada, contacto_celular_comandante: e.target.value})}
                      placeholder="Ej: +591 70123456"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">
                      Encargado de Logística
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={brigada.encargado_logistica}
                      onChange={(e) => setBrigada({...brigada, encargado_logistica: e.target.value})}
                      placeholder="Nombre completo"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">
                      Celular de Logística
                    </label>
                    <input
                      type="tel"
                      className="form-input"
                      value={brigada.contacto_celular_logistica}
                      onChange={(e) => setBrigada({...brigada, contacto_celular_logistica: e.target.value})}
                      placeholder="Ej: +591 70123456"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">
                      Número de Emergencia Público
                    </label>
                    <input
                      type="tel"
                      className="form-input"
                      value={brigada.numero_emergencia_publico}
                      onChange={(e) => setBrigada({...brigada, numero_emergencia_publico: e.target.value})}
                      placeholder="Ej: 119"
                    />
                  </div>
                </div>
              </div>
            )}

            {pasoActual === 1 && renderSeccionEPP()}
            
            {pasoActual === 2 && 
              renderSeccionSimple('Herramientas', recursosHerramientas, 'herramientas', Wrench, 'icon-gray')}
            
            {pasoActual === 3 && 
              renderSeccionSimple('Logística y Vehículos', recursosLogistica, 'logistica', Fuel, 'icon-blue')}
            
            {pasoActual === 4 && 
              renderSeccionSimple('Alimentación y Bebidas', recursosAlimentacion, 'alimentacion', Utensils, 'icon-green')}
            
            {pasoActual === 5 && 
              renderSeccionSimple('Equipo de Campo', recursosCampo, 'campo', Tent, 'icon-purple')}
            
            {pasoActual === 6 && 
              renderSeccionSimple('Productos de Limpieza', recursosLimpieza, 'limpieza', Droplets, 'icon-cyan')}
            
            {pasoActual === 7 && 
              renderSeccionSimple('Medicamentos y Primeros Auxilios', recursosMedicamentos, 'medicamentos', Heart, 'icon-red')}
            
            {pasoActual === 8 && 
              renderSeccionSimple('Rescate Animal', recursosRescateAnimal, 'rescate_animal', PawPrint, 'icon-amber')}
          </div>

          {/* Navegación por pasos */}
          <div className="step-navigation">
            <div className="step-nav-left">
              <button
                type="button"
                onClick={pasoAnterior}
                disabled={pasoActual === 0}
                className="step-button step-button-prev"
              >
                <ChevronLeft className="icon" />
                Anterior
              </button>
            </div>
            
            <div className="step-nav-right">
              {pasoActual < pasos.length - 1 ? (
                <button
                  type="button"
                  onClick={siguientePaso}
                  disabled={!validarPasoActual()}
                  className="step-button step-button-next"
                >
                  Siguiente
                  <ChevronRight className="icon" />
                </button>
              ) : (
                <button
                  type="submit"
                  className="step-button step-button-submit"
                >
                  <Save className="icon" />
                  Enviar Formulario
                </button>
              )}
            </div>
          </div>
        </form>

        {/* Información adicional */}
        <div className="info-container">
          <div className="info-content">
            <AlertCircle className="icon icon-blue" />
            <div className="info-text">
              <p className="info-title">Instrucciones:</p>
              <ul className="info-list">
                <li>• Complete la información básica de la brigada en la primera sección</li>
                <li>• Para equipos con tallas, especifique las cantidades por cada talla</li>
                <li>• Use las pestañas superiores para navegar entre las diferentes categorías</li>
                <li>• Los campos con asterisco (*) son obligatorios</li>
                <li>• Los datos se guardarán al hacer clic en "Guardar Información"</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormularioBrigadas;