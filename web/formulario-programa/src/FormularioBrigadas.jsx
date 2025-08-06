import React, { useState, useEffect } from 'react';
import { Save, AlertCircle, Users, Package, Wrench, Fuel, Utensils, Tent, Droplets, Heart, PawPrint, ChevronLeft, ChevronRight, Loader, Check, X } from 'lucide-react';
import './FormularioBrigadas.css'; // Asegúrate de tener un archivo CSS para estilos
const FormularioBrigadas = ({ brigadaId = null, onSuccess = () => {} }) => {
  // Estados principales
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Datos de la API
  const [tallas, setTallas] = useState([]);
  const [tiposRecursos, setTiposRecursos] = useState({});
  const [, setBrigadaExistente] = useState(null);
  // Estado del formulario
  const [brigada, setBrigada] = useState({
    nombre: '',
    cantidad_bomberos_activos: '',
    contacto_celular_comandante: '',
    encargado_logistica: '',
    contacto_celular_logistica: '',
    numero_emergencia_publico: ''
  });

  const [inventario, setInventario] = useState({});
  const [pasoActual, setPasoActual] = useState(0);

  // Configuración de pasos
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

  // Mapeo de categorías API a pasos
  const categoriaMap = {
    'EPP': 'epp',
    'HERRAMIENTAS': 'herramientas',
    'LOGISTICA': 'logistica',
    'ALIMENTACION': 'alimentacion',
    'CAMPO': 'campo',
    'LIMPIEZA': 'limpieza',
    'MEDICAMENTOS': 'medicamentos',
    'RESCATE_ANIMAL': 'rescate_animal'
  } [brigadaId];

  // API Base URL (ajustar según tu configuración)
  const API_BASE = 'http://localhost:3000/api'; // Cambiar por tu URL base

  // Funciones API
  const apiCall = async (endpoint, options = {}) => {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API Error ${endpoint}:`, error);
      throw error;
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        setError(null);

        // Cargar tallas
        const tallasData = await apiCall('/tallas');
        setTallas(tallasData);

        // Cargar tipos de recursos
        const tiposData = await apiCall('/tipos-recursos?activo=true');
        const tiposPorCategoria = tiposData.reduce((acc, tipo) => {
          const categoria = categoriaMap[tipo.categoria];
          if (categoria) {
            if (!acc[categoria]) acc[categoria] = [];
            acc[categoria].push(tipo);
          }
          return acc;
        }, {});
        setTiposRecursos(tiposPorCategoria);

        // Si es edición, cargar brigada existente
        if (brigadaId) {
          const brigadaData = await apiCall(`/brigadas/${brigadaId}`);
          setBrigada(brigadaData);
          setBrigadaExistente(brigadaData);

          // Cargar inventario existente
          const inventarioData = await apiCall(`/inventario/brigada/${brigadaId}`);
          setInventario(procesarInventarioAPI(inventarioData));
        }

      } catch (err) {
        setError(`Error al cargar datos: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [brigadaId, categoriaMap]);

  // Procesar inventario de la API al formato del formulario
  const procesarInventarioAPI = (inventarioAPI) => {
    const inventarioFormato = {};

    Object.entries(inventarioAPI).forEach(([categoria, items]) => {
      inventarioFormato[categoria] = {};
      
      items.forEach(item => {
        const nombreRecurso = item.tipo_recurso_nombre;
        
        if (!inventarioFormato[categoria][nombreRecurso]) {
          inventarioFormato[categoria][nombreRecurso] = {};
        }

        if (item.talla_codigo) {
          inventarioFormato[categoria][nombreRecurso][item.talla_codigo] = item.cantidad || 0;
        } else {
          inventarioFormato[categoria][nombreRecurso].cantidad = item.cantidad || 0;
        }
      });
    });

    return inventarioFormato;
  };

  // Actualizar inventario
  const actualizarInventario = (categoria, recurso, talla, valor) => {
    setInventario(prev => ({
      ...prev,
      [categoria]: {
        ...prev[categoria],
        [recurso]: {
          ...prev[categoria]?.[recurso],
          [talla || 'cantidad']: parseInt(valor) || 0
        }
      }
    }));
  };

  // Navegación
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
      return brigada.nombre.trim() !== '';
    }
    return true;
  };

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      // 1. Guardar/actualizar brigada
      let brigadaGuardada;
      if (brigadaId) {
        brigadaGuardada = await apiCall(`/brigadas/${brigadaId}`, {
          method: 'PUT',
          body: JSON.stringify(brigada)
        });
      } else {
        brigadaGuardada = await apiCall('/brigadas', {
          method: 'POST',
          body: JSON.stringify(brigada)
        });
      }

      const brigadaIdFinal = brigadaGuardada.id;

      // 2. Guardar inventario
      await guardarInventario(brigadaIdFinal);

      setSuccess('Brigada guardada exitosamente');
      onSuccess(brigadaGuardada);

    } catch (err) {
      setError(`Error al guardar: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Guardar inventario por categorías
  const guardarInventario = async (brigadaIdParam) => {
    const categorias = Object.keys(inventario);

    for (const categoria of categorias) {
      const recursos = inventario[categoria];
      
      for (const [nombreRecurso, datos] of Object.entries(recursos)) {
        // Encontrar el tipo de recurso
        const tipoRecurso = tiposRecursos[categoria]?.find(t => t.nombre === nombreRecurso);
        if (!tipoRecurso) continue;

        if (tipoRecurso.requiere_talla) {
          // Guardar por cada talla
          for (const [talla, cantidad] of Object.entries(datos)) {
            if (talla !== 'cantidad' && cantidad > 0) {
              const tallaObj = tallas.find(t => t.codigo === talla);
              if (tallaObj) {
                await apiCall('/inventario/epp', {
                  method: 'POST',
                  body: JSON.stringify({
                    brigada_id: brigadaIdParam,
                    tipo_recurso_id: tipoRecurso.id,
                    talla_id: tallaObj.id,
                    cantidad: cantidad
                  })
                });
              }
            }
          }
        } else {
          // Guardar cantidad simple
          if (datos.cantidad > 0) {
            const endpoint = `/inventario/${categoria.replace('_', '-')}`;
            await apiCall(endpoint, {
              method: 'POST',
              body: JSON.stringify({
                brigada_id: brigadaIdParam,
                tipo_recurso_id: tipoRecurso.id,
                cantidad: datos.cantidad
              })
            });
          }
        }
      }
    }
  };

  // Renderizado de campos
  const renderCampoTallas = (recurso, categoria) => {
    const tipoRecurso = tiposRecursos[categoria]?.find(t => t.nombre === recurso);
    if (!tipoRecurso) return null;

    return (
      <div className="tallas-grid">
        {tallas.map(talla => (
          <div key={talla.codigo} className="talla-group">
            <label className="talla-label">{talla.codigo}</label>
            <input
              type="number"
              min="0"
              className="talla-input"
              placeholder="0"
              value={inventario[categoria]?.[recurso]?.[talla.codigo] || ''}
              onChange={(e) => actualizarInventario(categoria, recurso, talla.codigo, e.target.value)}
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

  const renderSeccionInventario = (categoria, titulo, IconComponent, iconColor) => {
    const recursos = tiposRecursos[categoria] || [];

    if (recursos.length === 0) {
      return (
        <div className="resources-container">
          <div className="section-header">
            <IconComponent className={`icon-lg ${iconColor}`} />
            <h3 className="section-title">{titulo}</h3>
          </div>
          <div className="empty-state">
            <p>No hay recursos disponibles en esta categoría</p>
          </div>
        </div>
      );
    }

    return (
      <div className="resources-container">
        <div className="section-header">
          <IconComponent className={`icon-lg ${iconColor}`} />
          <h3 className="section-title">{titulo}</h3>
        </div>
        
        <div className={`resources-grid ${categoria === 'epp' ? 'one-col' : 'three-cols'}`}>
          {recursos.map(recurso => (
            <div key={recurso.id} className="resource-card">
              <h4 className="resource-title">{recurso.nombre}</h4>
              {recurso.requiere_talla ? 
                renderCampoTallas(recurso.nombre, categoria) : 
                renderCampoSimple(recurso.nombre, categoria)
              }
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Estados de carga
  if (loading) {
    return (
      <div className="loading-container">
        <Loader className="icon-spin" />
        <p>Cargando datos...</p>
      </div>
    );
  }

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
              <h1 className="header-title">
                {brigadaId ? 'Editar Brigada Forestal' : 'Nueva Brigada Forestal'}
              </h1>
              <p className="header-subtitle">Gestión de recursos y equipamiento</p>
            </div>
          </div>
        </div>

        {/* Mensajes */}
        {error && (
          <div className="alert alert-error">
            <X className="icon" />
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <Check className="icon" />
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Indicador de progreso */}
          <div className="progress-container">
            <div className="progress-header">
              <span className="progress-title">Progreso del formulario:</span>
              <span className="progress-counter">{pasoActual + 1} de {pasos.length}</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${((pasoActual + 1) / pasos.length) * 100}%` }}
              />
            </div>
            <div className="current-step-info">
              {React.createElement(pasos[pasoActual].icono, { className: "icon" })}
              <span className="current-step-name">{pasos[pasoActual].label}</span>
            </div>
          </div>

          {/* Navegación por pestañas */}
          <div className="nav-container">
            <div className="nav-tabs">
              {pasos.map((item, index) => {
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

          {/* Navegación por pasos */}
          <div className="step-navigation">
            <div className="step-nav-left">
              <button
                type="button"
                onClick={pasoAnterior}
                disabled={pasoActual === 0 || saving}
                className="step-button step-button-prev"
              >
                <ChevronLeft className="icon" />
                Anterior
              </button>
            </div>
            
            <div className="step-info-container">
              <span className="step-info">
                Paso {pasoActual + 1} de {pasos.length}: {pasos[pasoActual].label}
              </span>
            </div>

            <div className="step-nav-right">
              {pasoActual < pasos.length - 1 ? (
                <button
                  type="button"
                  onClick={siguientePaso}
                  disabled={!validarPasoActual() || saving}
                  className="step-button step-button-next"
                >
                  Siguiente
                  <ChevronRight className="icon" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={saving || !validarPasoActual()}
                  className="step-button step-button-submit"
                >
                  {saving ? <Loader className="icon icon-spin" /> : <Save className="icon" />}
                  {saving ? 'Guardando...' : 'Guardar Brigada'}
                </button>
              )}
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
                    <label className="form-label">Nombre de la Brigada *</label>
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
                    <label className="form-label">Cantidad de Bomberos Activos</label>
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
                    <label className="form-label">Celular del Comandante</label>
                    <input
                      type="tel"
                      className="form-input"
                      value={brigada.contacto_celular_comandante}
                      onChange={(e) => setBrigada({...brigada, contacto_celular_comandante: e.target.value})}
                      placeholder="Ej: +591 70123456"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Encargado de Logística</label>
                    <input
                      type="text"
                      className="form-input"
                      value={brigada.encargado_logistica}
                      onChange={(e) => setBrigada({...brigada, encargado_logistica: e.target.value})}
                      placeholder="Nombre completo"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Celular de Logística</label>
                    <input
                      type="tel"
                      className="form-input"
                      value={brigada.contacto_celular_logistica}
                      onChange={(e) => setBrigada({...brigada, contacto_celular_logistica: e.target.value})}
                      placeholder="Ej: +591 70123456"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Número de Emergencia Público</label>
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

            {pasoActual === 1 && renderSeccionInventario('epp', 'Equipo de Protección Personal (EPP)', Package, 'icon-orange')}
            {pasoActual === 2 && renderSeccionInventario('herramientas', 'Herramientas', Wrench, 'icon-gray')}
            {pasoActual === 3 && renderSeccionInventario('logistica', 'Logística y Vehículos', Fuel, 'icon-blue')}
            {pasoActual === 4 && renderSeccionInventario('alimentacion', 'Alimentación y Bebidas', Utensils, 'icon-green')}
            {pasoActual === 5 && renderSeccionInventario('campo', 'Equipo de Campo', Tent, 'icon-purple')}
            {pasoActual === 6 && renderSeccionInventario('limpieza', 'Productos de Limpieza', Droplets, 'icon-cyan')}
            {pasoActual === 7 && renderSeccionInventario('medicamentos', 'Medicamentos y Primeros Auxilios', Heart, 'icon-red')}
            {pasoActual === 8 && renderSeccionInventario('rescate_animal', 'Rescate Animal', PawPrint, 'icon-amber')}
          </div>

          {/* Navegación por pasos */}
          <div className="step-navigation">
            <div className="step-nav-left">
              <button
                type="button"
                onClick={pasoAnterior}
                disabled={pasoActual === 0 || saving}
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
                  disabled={!validarPasoActual() || saving}
                  className="step-button step-button-next"
                >
                  Siguiente
                  <ChevronRight className="icon" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={saving || !validarPasoActual()}
                  className="step-button step-button-submit"
                >
                  {saving ? <Loader className="icon icon-spin" /> : <Save className="icon" />}
                  {saving ? 'Guardando...' : 'Guardar Brigada'}
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
                <li>• Para equipos con tallas, especifique las cantidades por cada talla disponible</li>
                <li>• Los recursos se cargan dinámicamente desde la base de datos</li>
                <li>• Los campos con asterisco (*) son obligatorios</li>
                <li>• Los datos se guardan automáticamente al completar el formulario</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .formulario-container {
          
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
        }

        .header {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          margin-bottom: 2rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .header-content {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .header-title {
          font-size: 2rem;
          font-weight: 700;
          color: #1f2937;
          margin: 0;
        }

        .header-subtitle {
          color: #6b7280;
          margin: 0.5rem 0 0 0;
        }

        .alert {
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .alert-error {
          background: #fee2e2;
          color: #dc2626;
          border: 1px solid #fecaca;
        }

        .alert-success {
          background: #d1fae5;
          color: #065f46;
          border: 1px solid #a7f3d0;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          background: white;
          border-radius: 12px;
          margin: 2rem 0;
        }

        .progress-container {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 1rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .progress-title {
          font-weight: 600;
          color: #374151;
        }

        .progress-counter {
          color: #6b7280;
          font-size: 0.875rem;
        }

        .progress-bar {
          height: 8px;
          background: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 1rem;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #10b981, #059669);
          transition: width 0.3s ease;
        }

        .current-step-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #374151;
          font-weight: 500;
        }

        .nav-container {
          background: white;
          border-radius: 12px;
          padding: 1rem;
          margin-bottom: 1rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .nav-tabs {
          display: flex;
          gap: 0.5rem;
          overflow-x: auto;
          padding-bottom: 0.5rem;
        }

        .nav-tab {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 500;
          color: #6b7280;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          min-width: fit-content;
          transition: all 0.2s ease;
        }

        .nav-tab.active {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }

        .nav-tab.completed {
          background: #10b981;
          color: white;
          border-color: #10b981;
        }

        .content-container {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          margin-bottom: 1rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .resources-container {
          margin-bottom: 2rem;
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .section-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0;
        }

        .form-grid {
          display: grid;
          gap: 1.5rem;
        }

        .two-cols {
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        }

        .three-cols {
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        }

        .one-col {
          grid-template-columns: 1fr;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-label {
          font-weight: 500;
          color: #374151;
        }

        .form-input {
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.2s ease;
        }

        .form-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .resources-grid {
          display: grid;
          gap: 1.5rem;
        }

        .resource-card {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 1rem;
        }

        .resource-title {
          font-weight: 500;
          color: #374151;
          margin: 0 0 1rem 0;
          font-size: 0.875rem;
        }

        .tallas-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
          gap: 0.5rem;
        }

        .talla-group {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
        }

        .talla-label {
          font-size: 0.75rem;
          font-weight: 500;
          color: #6b7280;
        }

        .talla-input, .cantidad-input {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          text-align: center;
          font-size: 0.875rem;
        }

        .cantidad-container {
          display: flex;
          justify-content: center;
        }

        .cantidad-input {
          max-width: 100px;
        }

        .empty-state {
          background: #f9fafb;
          border: 1px dashed #d1d5db;
          border-radius: 8px;
          padding: 2rem;
          text-align: center;
          color: #6b7280;
        }

        .step-navigation {
          display: flex;
          justify-content: space-between;
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .step-nav-left, .step-nav-right {
          display: flex;
          gap: 1rem;
        }

        .step-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
        }

        .step-button-prev {
          background: #f3f4f6;
          color: #374151;
        }

        .step-button-prev:hover:not(:disabled) {
          background: #e5e7eb;
        }

        .step-button-next {
          background: #3b82f6;
          color: white;
        }

        .step-button-next:hover:not(:disabled) {
          background: #2563eb;
        }

        .step-button-submit {
          background: #10b981;
          color: white;
        }

        .step-button-submit:hover:not(:disabled) {
          background: #059669;
        }

        .step-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .info-container {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .info-content {
          display: flex;
          gap: 1rem;
        }

        .info-text {
          flex: 1;
        }

        .info-title {
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 0.5rem 0;
        }

        .info-list {
          margin: 0;
          padding-left: 1.25rem;
          color: #4b5563;
        }

        .info-list li {
          margin-bottom: 0.25rem;
        }

        /* Iconos */
        .icon {
          width: 1rem;
          height: 1rem;
        }

        .icon-lg {
          width: 1.5rem;
          height: 1.5rem;
        }

        .icon-xl {
          width: 2rem;
          height: 2rem;
        }

        .icon-spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Colores de iconos */
        .icon-blue {
          color: #3b82f6;
        }

        .icon-orange {
          color: #f97316;
        }

        .icon-gray {
          color: #6b7280;
        }

        .icon-green {
          color: #10b981;
        }

        .icon-purple {
          color: #8b5cf6;
        }

        .icon-cyan {
          color: #06b6d4;
        }

        .icon-red {
          color: #ef4444;
        }

        .icon-amber {
          color: #f59e0b;
        }
      `}</style>
    </div>
  );
};

export default FormularioBrigadas;