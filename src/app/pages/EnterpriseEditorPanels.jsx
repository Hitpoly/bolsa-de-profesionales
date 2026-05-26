import React, { useState } from 'react';
import { Camera, Loader2, Play, Trash2, Sparkles, ChevronDown, ChevronRight, Image } from 'lucide-react';

const AccordionItem = ({ id, title, isOpen, toggleAccordion, children }) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      <button
        onClick={() => toggleAccordion(id)}
        className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors"
      >
        <span className="text-[11px] font-black text-gray-700 uppercase tracking-wider">{title}</span>
        {isOpen ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
      </button>
      {isOpen && (
        <div className="p-4 border-t border-gray-100 bg-slate-50/30 space-y-4">
          {children}
        </div>
      )}
    </div>
  );
};

const DEFAULT_PRICING = {
  titulo: "Planes de Marketing en Redes Sociales.",
  subtitulo: "Elige el plan que mejor se adapte a tus objetivos y lleva tu negocio al siguiente nivel.",
  imagen: "/images/baner.jpg",
  mobileImage: "/images/bannerMobile.png",
  planes: [
    {
      titulo: "Plan Básico",
      precioReal: "450",
      precioDescuento: "369",
      tipoContrato: "Trimestral",
      to: "https://formarkcrm.hitpoly.com/registros/formulario-de-servicios?idSetter=6",
      descripcion: "Ideal para pequeñas empresas que inician en redes. Empieza a generar presencia y atraer seguidores.",
      beneficios: [
        "Investigación de mercado",
        "Gestión de Facebook/Instagram",
        "8 Publicaciones con estrategia Carruseles/Estaticas",
        "14 historias",
        "Informes detallados",
        "Asesoría continua"
      ]
    },
    {
      titulo: "Plan Pro",
      precioReal: "720",
      precioDescuento: "580",
      tipoContrato: "Trimestral",
      to: "https://formarkcrm.hitpoly.com/registros/formulario-de-servicios?idSetter=6",
      descripcion: "Perfecto para empresas en crecimiento que quieren mejorar su visibilidad e interacción en redes.",
      beneficios: [
        "Investigación de mercado",
        "Gestión de Facebook/Instagram",
        "15 Publicaciones con estrategia Reels/Carruseles/Estaticas",
        "28 historias",
        "Respuesta a la interación",
        "1 campaña publicitaria pagada",
        "Análisis de interacción (Boot)",
        "Informes detallados",
        "Asesoría continua"
      ]
    },
    {
      titulo: "Plan Premium",
      precioReal: "980",
      precioDescuento: "838",
      tipoContrato: "Trimestral",
      to: "https://formarkcrm.hitpoly.com/registros/formulario-de-servicios?idSetter=6",
      descripcion: "Para empresas que buscan resultados rápidos, mayor interacción y campañas publicitarias efectivas.",
      beneficios: [
        "Investigación de mercado",
        "Gestión de 3 redes sociales principales",
        "18 Publicaciones con estrategia Reels/Carruseles/Estaticas",
        "Historias diarias",
        "Respuesta a la interación (Boot)",
        "3 campañas pagadas",
        "Análisis de interacción",
        "Informes detallados",
        "Asesoría continua"
      ]
    },
    {
      titulo: "Plan Ultra",
      precioReal: "1580",
      precioDescuento: "1120",
      tipoContrato: "Trimestral",
      to: "https://formarkcrm.hitpoly.com/registros/formulario-de-servicios?idSetter=6",
      descripcion: "Para marcas grandes que requieren una estrategia avanzada en redes y un gran impacto de marca.",
      beneficios: [
        "Investigación de mercado",
        "Gestión de 4 redes sociales principales",
        "25 Publicaciones Reels/Carruseles/Estaticas",
        "Historias Diarias",
        "Respuesta a la interación (Humano)",
        "Campañas pagadas (Personalizado) max. 6 campañas",
        "Análisis de interacción",
        "Informes detallados",
        "Asesoría continua"
      ]
    }
  ],
  acordeon: [
    {
      id: "panel1",
      title: "Financia tu éxito: Paga hasta en 3 cuotas sin intereses",
      content: "Invertir en tu crecimiento nunca fue tan fácil. Si calificas, puedes pagar tu plan en hasta 3 cómodas cuotas sin intereses. ¡Haz despegar tu marca sin afectar tu flujo de caja!"
    },
    {
      id: "panel2",
      title: "Un equipo élite trabajando para ti",
      content: "No solo contratas un servicio, accedes a un equipo de especialistas en marketing digital. Estrategas, diseñadores, editores, redactores, traffickers y community managers alineados con un solo objetivo: hacer crecer tu marca de manera efectiva y rentable."
    },
    {
      id: "panel3",
      title: "Elige cómo pagar: aceptamos múltiples métodos",
      content: "Facilitamos tu compra con los métodos de pago más utilizados. Paga con Binance, Mercado Pago, transferencias bancarias, Western Union y más. Seguridad y comodidad para que inicies sin preocupaciones."
    },
    {
      id: "panel4",
      title: "Asesoría estratégica gratuita antes de comprar",
      content: "No te preocupes si no sabes qué plan elegir. Recibe una asesoría 100% gratuita y personalizada para asegurarte de tomar la mejor decisión según las necesidades de tu negocio. ¡Déjanos guiarte hacia el éxito!"
    }
  ],
  imagenes: [
    {
      src: "/images/pagaAhora.jpg"
    }
  ],
  llamadoAlaAccionProps: {
    title: "¿Listo para llevar tu marca a nuevas alturas?",
    icon: "check",
    firstButton: {
      text: "Empezar ahora",
      to: "https://formarkcrm.hitpoly.com/registros/formulario-de-servicios?idSetter=6"
    }
  }
};

export const EnterpriseEditorPanels = ({
  enterpriseData,
  setEnterpriseData,
  handleImageKitUpload,
  uploadingImage,
  renderImageUpload,
  enterpriseTab = 'landing'
}) => {
  const [openAccordion, setOpenAccordion] = useState('info');
  const toggleAccordion = (id) => setOpenAccordion(prev => prev === id ? null : id);

  // Auto-initialize pricing data if missing
  React.useEffect(() => {
    if (enterpriseData && (!enterpriseData.page_data || !enterpriseData.page_data.pricing)) {
      setEnterpriseData(prev => {
        const page_data = prev.page_data || {};
        if (!page_data.pricing) {
          return {
            ...prev,
            page_data: {
              ...page_data,
              pricing: DEFAULT_PRICING
            }
          };
        }
        return prev;
      });
    }
  }, [enterpriseData, setEnterpriseData]);

  // Helper to ensure path exists
  const updateNestedState = (path, value) => {
    setEnterpriseData(prev => {
      const newState = { ...prev };
      
      // Auto-mapear con los datos principales del servicio para evitar duplicidad (solo si editamos portada de landing)
      if (enterpriseTab === 'landing') {
        if (path === 'portada_props.title') {
          newState.title = value;
          if (!newState.slug) {
            newState.slug = value.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
          }
        }
        if (path === 'portada_props.subtitle') {
          newState.description = value;
        }
        if (path === 'portada_props.imgSrc') {
          newState.image = value;
        }
      }

      if (!newState.page_data) newState.page_data = {};
      
      let current = newState.page_data;
      const keys = path.split('.');
      const lastKey = keys.pop();
      
      for (const key of keys) {
        if (isNaN(key)) {
          if (!current[key]) current[key] = {};
          current = current[key];
        } else {
          const idx = parseInt(key, 10);
          if (!current[idx]) current[idx] = {};
          current = current[idx];
        }
      }
      
      current[lastKey] = value;
      return newState;
    });
  };

  const getNestedState = (path, defaultValue = '') => {
    if (!enterpriseData?.page_data) return defaultValue;
    const keys = path.split('.');
    let current = enterpriseData.page_data;
    for (const key of keys) {
      if (current[key] === undefined) return defaultValue;
      current = current[key];
    }
    return current;
  };

  // Precios Editor Layout
  if (enterpriseTab === 'prices') {
    return (
      <div className="space-y-4 animate-in fade-in duration-200 pb-20">
        
        <AccordionItem id="price_banner" isOpen={openAccordion === 'price_banner'} toggleAccordion={toggleAccordion} title="1. Banner de Precios">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[9px] font-bold text-gray-400 uppercase font-black">Título de Banner</label>
              <input type="text" value={getNestedState('pricing.titulo')} onChange={(e) => updateNestedState('pricing.titulo', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-bold text-gray-400 uppercase font-black">Descripción de Banner</label>
              <textarea value={getNestedState('pricing.subtitulo')} onChange={(e) => updateNestedState('pricing.subtitulo', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium outline-none min-h-[60px]" />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-bold text-gray-400 uppercase font-black">Imagen de Banner (Desktop)</label>
              {renderImageUpload("Imagen de Banner", getNestedState('pricing.imagen'), (url) => updateNestedState('pricing.imagen', url))}
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-bold text-gray-400 uppercase font-black">Imagen de Banner (Móvil)</label>
              {renderImageUpload("Imagen Móvil", getNestedState('pricing.mobileImage'), (url) => updateNestedState('pricing.mobileImage', url))}
            </div>
          </div>
        </AccordionItem>

        <AccordionItem id="price_plans" isOpen={openAccordion === 'price_plans'} toggleAccordion={toggleAccordion} title="2. Planes de Precios">
          <div className="space-y-4">
            <button 
              onClick={() => {
                const current = getNestedState('pricing.planes', []);
                if (current.length >= 4) {
                  alert('Puedes crear un máximo de 4 planes.');
                  return;
                }
                updateNestedState('pricing.planes', [...current, { titulo: 'Nuevo Plan', precioReal: '100', precioDescuento: '80', tipoContrato: 'Mensual', to: '', descripcion: '', beneficios: [] }]);
              }}
              className="text-[9px] font-black text-cyan-600 uppercase hover:scale-105 transition-all"
            >
              + AGREGAR PLAN (MÁX. 4)
            </button>
            
            {(getNestedState('pricing.planes', [])).map((plan, idx) => (
              <div key={idx} className="p-4 bg-white rounded-2xl border border-gray-200 space-y-3 relative group/item shadow-sm">
                <button
                  onClick={() => {
                    const items = [...getNestedState('pricing.planes', [])];
                    items.splice(idx, 1);
                    updateNestedState('pricing.planes', items);
                  }}
                  className="absolute top-3 right-3 text-red-500 opacity-0 group-hover/item:opacity-100 transition-opacity bg-white p-1 rounded-full border border-gray-100 shadow-sm"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <div className="space-y-1">
                  <span className="text-[9px] font-black uppercase text-cyan-600 tracking-wider">Plan #{idx + 1}</span>
                  <input type="text" value={plan.titulo} onChange={(e) => {
                    const items = [...getNestedState('pricing.planes', [])];
                    items[idx].titulo = e.target.value;
                    updateNestedState('pricing.planes', items);
                  }} className="w-full bg-slate-50 border-0 rounded-lg px-2.5 py-1.5 text-xs outline-none font-bold" placeholder="Nombre del Plan" />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className="text-[8px] font-bold text-gray-400 uppercase font-black">Precio Real</label>
                    <input type="text" value={plan.precioReal} onChange={(e) => {
                      const items = [...getNestedState('pricing.planes', [])];
                      items[idx].precioReal = e.target.value;
                      updateNestedState('pricing.planes', items);
                    }} className="w-full bg-slate-50 border-0 rounded-lg px-2 py-1 text-xs outline-none font-mono" placeholder="450" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-bold text-gray-400 uppercase font-black">Oferta</label>
                    <input type="text" value={plan.precioDescuento} onChange={(e) => {
                      const items = [...getNestedState('pricing.planes', [])];
                      items[idx].precioDescuento = e.target.value;
                      updateNestedState('pricing.planes', items);
                    }} className="w-full bg-slate-50 border-0 rounded-lg px-2 py-1 text-xs outline-none font-mono" placeholder="369" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-bold text-gray-400 uppercase font-black">Contrato</label>
                    <input type="text" value={plan.tipoContrato} onChange={(e) => {
                      const items = [...getNestedState('pricing.planes', [])];
                      items[idx].tipoContrato = e.target.value;
                      updateNestedState('pricing.planes', items);
                    }} className="w-full bg-slate-50 border-0 rounded-lg px-2 py-1 text-xs outline-none font-bold" placeholder="Trimestral" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[8px] font-bold text-gray-400 uppercase font-black">Descripción</label>
                  <textarea value={plan.descripcion} onChange={(e) => {
                    const items = [...getNestedState('pricing.planes', [])];
                    items[idx].descripcion = e.target.value;
                    updateNestedState('pricing.planes', items);
                  }} className="w-full bg-slate-50 border-0 rounded-lg px-2 py-1.5 text-xs outline-none resize-none min-h-[50px]" placeholder="Breve resumen del plan..." />
                </div>

                <div className="space-y-1">
                  <label className="text-[8px] font-bold text-gray-400 uppercase font-black font-mono">Enlace Botón (to)</label>
                  <input type="text" value={plan.to} onChange={(e) => {
                    const items = [...getNestedState('pricing.planes', [])];
                    items[idx].to = e.target.value;
                    updateNestedState('pricing.planes', items);
                  }} className="w-full bg-slate-50 border-0 rounded-lg px-2 py-1 text-xs outline-none font-mono" placeholder="https://..." />
                </div>

                {/* Beneficios del Plan */}
                <div className="pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[9px] font-bold text-gray-500 uppercase font-black">Beneficios incluidos</span>
                    <button onClick={() => {
                      const items = [...getNestedState('pricing.planes', [])];
                      const ben = items[idx].beneficios || [];
                      items[idx].beneficios = [...ben, 'Nuevo beneficio'];
                      updateNestedState('pricing.planes', items);
                    }} className="text-[8px] font-black text-cyan-600 uppercase hover:underline">+ AGREGAR BENEFICIO</button>
                  </div>
                  
                  <div className="space-y-1.5">
                    {(plan.beneficios || []).map((ben, bIdx) => (
                      <div key={bIdx} className="flex items-center gap-1.5 relative group/ben">
                        <input type="text" value={ben} onChange={(e) => {
                          const items = [...getNestedState('pricing.planes', [])];
                          items[idx].beneficios[bIdx] = e.target.value;
                          updateNestedState('pricing.planes', items);
                        }} className="flex-1 bg-slate-50 border-0 rounded-md px-2 py-1 text-xs outline-none" />
                        <button onClick={() => {
                          const items = [...getNestedState('pricing.planes', [])];
                          items[idx].beneficios.splice(bIdx, 1);
                          updateNestedState('pricing.planes', items);
                        }} className="text-red-500 p-1 hover:bg-red-50 rounded"><Trash2 className="w-3 h-3" /></button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </AccordionItem>

        <AccordionItem id="price_faq" isOpen={openAccordion === 'price_faq'} toggleAccordion={toggleAccordion} title="3. Acordeón Informativo">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <span className="text-[10px] font-bold text-gray-700">Paneles Informativos</span>
              <button onClick={() => {
                const current = getNestedState('pricing.acordeon', []);
                updateNestedState('pricing.acordeon', [...current, { id: `panel${Date.now()}`, title: 'Nuevo Panel', content: '' }]);
              }} className="text-[9px] font-black text-cyan-600 uppercase hover:underline">+ AGREGAR</button>
            </div>
            
            <div className="space-y-2">
              {(getNestedState('pricing.acordeon', [])).map((panel, idx) => (
                <div key={idx} className="p-3 bg-white rounded-xl border border-gray-200 space-y-2 relative group/item shadow-sm">
                  <button onClick={() => {
                    const items = [...getNestedState('pricing.acordeon', [])];
                    items.splice(idx, 1);
                    updateNestedState('pricing.acordeon', items);
                  }} className="absolute top-2 right-2 text-red-500 opacity-0 group-hover/item:opacity-100 transition-opacity bg-white p-1 rounded-full border border-gray-100"><Trash2 className="w-3.5 h-3.5" /></button>
                  <input type="text" value={panel.title} onChange={(e) => {
                    const items = [...getNestedState('pricing.acordeon', [])];
                    items[idx].title = e.target.value;
                    updateNestedState('pricing.acordeon', items);
                  }} className="w-[90%] bg-transparent border-b border-dashed border-gray-300 font-bold text-xs py-0.5 outline-none" placeholder="Título del Panel" />
                  <textarea value={panel.content} onChange={(e) => {
                    const items = [...getNestedState('pricing.acordeon', [])];
                    items[idx].content = e.target.value;
                    updateNestedState('pricing.acordeon', items);
                  }} className="w-full bg-transparent text-[11px] font-medium text-gray-500 py-1 outline-none resize-none" rows={2} placeholder="Contenido informativo..." />
                </div>
              ))}
            </div>
          </div>
        </AccordionItem>

        <AccordionItem id="price_images" isOpen={openAccordion === 'price_images'} toggleAccordion={toggleAccordion} title="4. Imágenes del Acordeón">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[9px] font-bold text-gray-400 uppercase font-black">Imagen Reutilizable</label>
              {renderImageUpload("Imagen Lateral", getNestedState('pricing.imagenes.0.src'), (url) => {
                const current = getNestedState('pricing.imagenes', [{ src: '' }]);
                const copy = [...current];
                if (!copy[0]) copy[0] = { src: '' };
                copy[0].src = url;
                updateNestedState('pricing.imagenes', copy);
              })}
            </div>
          </div>
        </AccordionItem>

        <AccordionItem id="price_cta" isOpen={openAccordion === 'price_cta'} toggleAccordion={toggleAccordion} title="5. Llamado a la Acción (CTA)">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[9px] font-bold text-gray-400 uppercase font-black font-black">Título CTA</label>
              <input type="text" value={getNestedState('pricing.llamadoAlaAccionProps.title')} onChange={(e) => updateNestedState('pricing.llamadoAlaAccionProps.title', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-bold text-gray-400 uppercase font-black font-black">Icono CTA</label>
              <input type="text" value={getNestedState('pricing.llamadoAlaAccionProps.icon') || 'check'} onChange={(e) => updateNestedState('pricing.llamadoAlaAccionProps.icon', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none font-mono" placeholder="check, star, rocket..." />
            </div>
            
            <div className="p-3 bg-white rounded-xl border border-gray-100 space-y-2 shadow-sm">
              <span className="text-[10px] font-bold text-gray-700">Botón de Acción</span>
              <div className="flex gap-2">
                <input type="text" value={getNestedState('pricing.llamadoAlaAccionProps.firstButton.text')} onChange={(e) => updateNestedState('pricing.llamadoAlaAccionProps.firstButton.text', e.target.value)} className="flex-1 bg-slate-50 border-0 rounded-md px-2 py-1 text-xs outline-none font-bold text-cyan-600" placeholder="Texto" />
                <input type="text" value={getNestedState('pricing.llamadoAlaAccionProps.firstButton.to')} onChange={(e) => updateNestedState('pricing.llamadoAlaAccionProps.firstButton.to', e.target.value)} className="flex-[2] bg-slate-50 border-0 rounded-md px-2 py-1 text-xs outline-none font-mono" placeholder="URL" />
              </div>
            </div>
          </div>
        </AccordionItem>

      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-200 pb-20">
      
      <AccordionItem id="info" isOpen={openAccordion === 'info'} toggleAccordion={toggleAccordion} title="1. Configuración Básica">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[9px] font-bold text-gray-400 uppercase">Título del Servicio Corporativo</label>
            <input type="text" value={enterpriseData.title} onChange={(e) => setEnterpriseData(prev => ({ ...prev, title: e.target.value }))} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold outline-none" />
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-bold text-gray-400 uppercase">Slug amigable (para URL)</label>
            <input type="text" value={enterpriseData.slug} onChange={(e) => setEnterpriseData(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '') }))} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-mono outline-none" />
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-bold text-gray-400 uppercase">Descripción Corta</label>
            <textarea value={enterpriseData.description} onChange={(e) => setEnterpriseData(prev => ({ ...prev, description: e.target.value }))} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium outline-none min-h-[60px]" />
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-bold text-gray-400 uppercase">Imagen de Referencia</label>
            {renderImageUpload("Imagen de Referencia", enterpriseData.image, (url) => setEnterpriseData(prev => ({ ...prev, image: url })))}
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-bold text-gray-400 uppercase">Estado del Servicio</label>
            <select value={enterpriseData.estado || 'activo'} onChange={(e) => setEnterpriseData(prev => ({ ...prev, estado: e.target.value }))} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold outline-none">
              <option value="activo">Activo (Visible)</option>
              <option value="inactivo">Inactivo (Oculto)</option>
            </select>
          </div>
        </div>
      </AccordionItem>


      <AccordionItem id="portada" isOpen={openAccordion === 'portada'} toggleAccordion={toggleAccordion} title="2. Portada (Hero Section)">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[9px] font-bold text-gray-400 uppercase">Título de Portada</label>
            <input type="text" value={getNestedState('portada_props.title')} onChange={(e) => updateNestedState('portada_props.title', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold outline-none" />
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-bold text-gray-400 uppercase">Subtítulo de Portada</label>
            <textarea value={getNestedState('portada_props.subtitle')} onChange={(e) => updateNestedState('portada_props.subtitle', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium outline-none min-h-[60px]" />
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-bold text-gray-400 uppercase">Imagen de Portada</label>
            {renderImageUpload("Imagen Principal Landing", getNestedState('portada_props.imgSrc'), (url) => updateNestedState('portada_props.imgSrc', url))}
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-bold text-gray-400 uppercase">Texto Alternativo Imagen (Alt)</label>
            <input type="text" value={getNestedState('portada_props.imgAlt')} onChange={(e) => updateNestedState('portada_props.imgAlt', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none" />
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-bold text-gray-400 uppercase">URL Botón Principal (Formulario)</label>
            <input type="text" value={getNestedState('portada_props.to')} onChange={(e) => updateNestedState('portada_props.to', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none font-mono" />
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-bold text-gray-400 uppercase">URL Botón Secundario (WhatsApp)</label>
            <input type="text" value={getNestedState('portada_props.href')} onChange={(e) => updateNestedState('portada_props.href', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none font-mono" />
          </div>
        </div>
      </AccordionItem>

      <AccordionItem id="nav" isOpen={openAccordion === 'nav'} toggleAccordion={toggleAccordion} title="3. Menú de Navegación">
        <div className="space-y-4">
          <button 
            onClick={() => {
              const current = getNestedState('menu_items', []);
              updateNestedState('menu_items', [...current, { label: 'Nuevo Item', sectionId: 'seccio1' }]);
            }}
            className="text-[9px] font-black text-cyan-600 uppercase hover:scale-105 transition-all"
          >
            + AGREGAR ITEM
          </button>
          
          {(getNestedState('menu_items', [])).map((item, idx) => (
            <div key={idx} className="p-3 bg-white rounded-xl border border-gray-100 space-y-2 relative group/item">
              <button
                onClick={() => {
                  const items = [...getNestedState('menu_items', [])];
                  items.splice(idx, 1);
                  updateNestedState('menu_items', items);
                }}
                className="absolute top-2 right-2 text-red-500 opacity-0 group-hover/item:opacity-100 transition-opacity"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <div className="flex gap-2">
                <div className="flex-1 space-y-1">
                  <label className="text-[8px] font-bold text-gray-400 uppercase">Label</label>
                  <input type="text" value={item.label} onChange={(e) => {
                    const items = [...getNestedState('menu_items', [])];
                    items[idx].label = e.target.value;
                    updateNestedState('menu_items', items);
                  }} className="w-full bg-slate-50 border-0 rounded-md px-2 py-1 text-xs outline-none font-bold" />
                </div>
                <div className="flex-1 space-y-1">
                  <label className="text-[8px] font-bold text-gray-400 uppercase">Section ID</label>
                  <input type="text" value={item.sectionId} onChange={(e) => {
                    const items = [...getNestedState('menu_items', [])];
                    items[idx].sectionId = e.target.value;
                    updateNestedState('menu_items', items);
                  }} className="w-full bg-slate-50 border-0 rounded-md px-2 py-1 text-xs outline-none font-mono" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </AccordionItem>

      <AccordionItem id="video" isOpen={openAccordion === 'video'} toggleAccordion={toggleAccordion} title="4. Sección Vídeo">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[9px] font-bold text-gray-400 uppercase">Título de Sección</label>
            <input type="text" value={getNestedState('section_video_props.title')} onChange={(e) => updateNestedState('section_video_props.title', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none font-bold" />
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-bold text-gray-400 uppercase">Subtítulo</label>
            <textarea value={getNestedState('section_video_props.subtitle')} onChange={(e) => updateNestedState('section_video_props.subtitle', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none font-medium min-h-[50px]" />
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-bold text-gray-400 uppercase">URL de Embed (YouTube / Vimeo)</label>
            <input type="text" value={getNestedState('section_video_props.videoUrl')} onChange={(e) => updateNestedState('section_video_props.videoUrl', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none font-mono" />
          </div>
          <div className="flex gap-2">
            <div className="flex-1 space-y-2">
              <label className="text-[9px] font-bold text-gray-400 uppercase">Texto Link</label>
              <input type="text" value={getNestedState('section_video_props.linkText')} onChange={(e) => updateNestedState('section_video_props.linkText', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none" />
            </div>
            <div className="flex-1 space-y-2">
              <label className="text-[9px] font-bold text-gray-400 uppercase">URL Link</label>
              <input type="text" value={getNestedState('section_video_props.linkUrl')} onChange={(e) => updateNestedState('section_video_props.linkUrl', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none font-mono" />
            </div>
          </div>
        </div>
      </AccordionItem>

      <AccordionItem id="accordion1" isOpen={openAccordion === 'accordion1'} toggleAccordion={toggleAccordion} title="5. Acordeón Inteligente">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[9px] font-bold text-gray-400 uppercase">Título Principal</label>
            <input type="text" value={getNestedState('acordeon_inteligente_props.title')} onChange={(e) => updateNestedState('acordeon_inteligente_props.title', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none font-bold" />
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-bold text-gray-400 uppercase">Subtítulo</label>
            <textarea value={getNestedState('acordeon_inteligente_props.subtitle')} onChange={(e) => updateNestedState('acordeon_inteligente_props.subtitle', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none font-medium min-h-[50px]" />
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-bold text-gray-400 uppercase">URL de Vídeo (Opcional)</label>
            <input type="text" value={getNestedState('acordeon_inteligente_props.videoUrl')} onChange={(e) => updateNestedState('acordeon_inteligente_props.videoUrl', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none font-mono" />
          </div>
          <div className="space-y-2">
            {renderImageUpload("Imagen Alternativa", getNestedState('acordeon_inteligente_props.imgSrc'), (url) => updateNestedState('acordeon_inteligente_props.imgSrc', url))}
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-bold text-gray-400 uppercase">Texto Alternativo Imagen</label>
            <input type="text" value={getNestedState('acordeon_inteligente_props.imgAlt')} onChange={(e) => updateNestedState('acordeon_inteligente_props.imgAlt', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none" />
          </div>

          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-gray-700">Paneles del Acordeón</span>
              <button onClick={() => {
                const current = getNestedState('acordeon_inteligente_props.panelsData', []);
                updateNestedState('acordeon_inteligente_props.panelsData', [...current, { id: `panel${Date.now()}`, title: 'Nuevo', content: '' }]);
              }} className="text-[9px] font-black text-cyan-600 uppercase hover:underline">+ AGREGAR</button>
            </div>
            
            <div className="space-y-2">
              {(getNestedState('acordeon_inteligente_props.panelsData', [])).map((panel, idx) => (
                <div key={idx} className="p-3 bg-white rounded-xl border border-gray-100 space-y-2 relative group/item">
                  <button onClick={() => {
                    const items = [...getNestedState('acordeon_inteligente_props.panelsData', [])];
                    items.splice(idx, 1);
                    updateNestedState('acordeon_inteligente_props.panelsData', items);
                  }} className="absolute top-2 right-2 text-red-500 opacity-0 group-hover/item:opacity-100 transition-opacity"><Trash2 className="w-3.5 h-3.5" /></button>
                  <input type="text" value={panel.title} onChange={(e) => {
                    const items = [...getNestedState('acordeon_inteligente_props.panelsData', [])];
                    items[idx].title = e.target.value;
                    updateNestedState('acordeon_inteligente_props.panelsData', items);
                  }} className="w-[90%] bg-transparent border-b border-dashed border-gray-300 font-bold text-xs py-0.5 outline-none" placeholder="Título Panel" />
                  <textarea value={panel.content} onChange={(e) => {
                    const items = [...getNestedState('acordeon_inteligente_props.panelsData', [])];
                    items[idx].content = e.target.value;
                    updateNestedState('acordeon_inteligente_props.panelsData', items);
                  }} className="w-full bg-transparent text-[11px] font-medium text-gray-500 py-1 outline-none resize-none" rows={2} placeholder="Contenido" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </AccordionItem>

      <AccordionItem id="accordion2" isOpen={openAccordion === 'accordion2'} toggleAccordion={toggleAccordion} title="6. Acordeón + Imagen">
         <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[9px] font-bold text-gray-400 uppercase">Título Principal</label>
            <input type="text" value={getNestedState('acordeon_inteligente_imagen_props.title')} onChange={(e) => updateNestedState('acordeon_inteligente_imagen_props.title', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none font-bold" />
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-bold text-gray-400 uppercase">Subtítulo</label>
            <textarea value={getNestedState('acordeon_inteligente_imagen_props.subtitle')} onChange={(e) => updateNestedState('acordeon_inteligente_imagen_props.subtitle', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none font-medium min-h-[50px]" />
          </div>
          <div className="space-y-2">
            {renderImageUpload("Imagen Principal", getNestedState('acordeon_inteligente_imagen_props.imgSrc'), (url) => updateNestedState('acordeon_inteligente_imagen_props.imgSrc', url))}
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-bold text-gray-400 uppercase">Texto Alternativo Imagen</label>
            <input type="text" value={getNestedState('acordeon_inteligente_imagen_props.imgAlt')} onChange={(e) => updateNestedState('acordeon_inteligente_imagen_props.imgAlt', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none" />
          </div>

          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-gray-700">Paneles del Acordeón</span>
              <button onClick={() => {
                const current = getNestedState('acordeon_inteligente_imagen_props.panelsData', []);
                updateNestedState('acordeon_inteligente_imagen_props.panelsData', [...current, { id: `panel${Date.now()}`, title: 'Nuevo', content: '' }]);
              }} className="text-[9px] font-black text-cyan-600 uppercase hover:underline">+ AGREGAR</button>
            </div>
            
            <div className="space-y-2">
              {(getNestedState('acordeon_inteligente_imagen_props.panelsData', [])).map((panel, idx) => (
                <div key={idx} className="p-3 bg-white rounded-xl border border-gray-100 space-y-2 relative group/item">
                  <button onClick={() => {
                    const items = [...getNestedState('acordeon_inteligente_imagen_props.panelsData', [])];
                    items.splice(idx, 1);
                    updateNestedState('acordeon_inteligente_imagen_props.panelsData', items);
                  }} className="absolute top-2 right-2 text-red-500 opacity-0 group-hover/item:opacity-100 transition-opacity"><Trash2 className="w-3.5 h-3.5" /></button>
                  <input type="text" value={panel.title} onChange={(e) => {
                    const items = [...getNestedState('acordeon_inteligente_imagen_props.panelsData', [])];
                    items[idx].title = e.target.value;
                    updateNestedState('acordeon_inteligente_imagen_props.panelsData', items);
                  }} className="w-[90%] bg-transparent border-b border-dashed border-gray-300 font-bold text-xs py-0.5 outline-none" placeholder="Título Panel" />
                  <textarea value={panel.content} onChange={(e) => {
                    const items = [...getNestedState('acordeon_inteligente_imagen_props.panelsData', [])];
                    items[idx].content = e.target.value;
                    updateNestedState('acordeon_inteligente_imagen_props.panelsData', items);
                  }} className="w-full bg-transparent text-[11px] font-medium text-gray-500 py-1 outline-none resize-none" rows={2} placeholder="Contenido" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </AccordionItem>

      <AccordionItem id="cards" isOpen={openAccordion === 'cards'} toggleAccordion={toggleAccordion} title="7. Cartas de Resultados">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[9px] font-bold text-gray-400 uppercase">Título Principal</label>
            <input type="text" value={getNestedState('cartas_resultados_props.title')} onChange={(e) => updateNestedState('cartas_resultados_props.title', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none font-bold" />
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-bold text-gray-400 uppercase">Subtítulo</label>
            <textarea value={getNestedState('cartas_resultados_props.subtitle')} onChange={(e) => updateNestedState('cartas_resultados_props.subtitle', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none font-medium min-h-[50px]" />
          </div>

          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-gray-700">Tarjetas de Beneficio</span>
              <button onClick={() => {
                const current = getNestedState('cartas_resultados_props.benefits', []);
                updateNestedState('cartas_resultados_props.benefits', [...current, { image: '', title: 'Nuevo', description: '', linkUrl: '' }]);
              }} className="text-[9px] font-black text-cyan-600 uppercase hover:underline">+ AGREGAR</button>
            </div>
            
            <div className="space-y-3">
              {(getNestedState('cartas_resultados_props.benefits', [])).map((card, idx) => (
                <div key={idx} className="p-3 bg-white rounded-xl border border-gray-100 space-y-2 relative group/item">
                  <button onClick={() => {
                    const items = [...getNestedState('cartas_resultados_props.benefits', [])];
                    items.splice(idx, 1);
                    updateNestedState('cartas_resultados_props.benefits', items);
                  }} className="absolute top-2 right-2 text-red-500 opacity-0 group-hover/item:opacity-100 transition-opacity z-10 bg-white rounded-full p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                  
                  {renderImageUpload(`Imagen Carta ${idx + 1}`, card.image, (url) => {
                    const items = [...getNestedState('cartas_resultados_props.benefits', [])];
                    items[idx].image = url;
                    updateNestedState('cartas_resultados_props.benefits', items);
                  })}
                  
                  <input type="text" value={card.title} onChange={(e) => {
                    const items = [...getNestedState('cartas_resultados_props.benefits', [])];
                    items[idx].title = e.target.value;
                    updateNestedState('cartas_resultados_props.benefits', items);
                  }} className="w-full bg-transparent border-b border-dashed border-gray-300 font-bold text-xs py-0.5 outline-none mt-2" placeholder="Título" />
                  
                  <textarea value={card.description} onChange={(e) => {
                    const items = [...getNestedState('cartas_resultados_props.benefits', [])];
                    items[idx].description = e.target.value;
                    updateNestedState('cartas_resultados_props.benefits', items);
                  }} className="w-full bg-transparent text-[11px] font-medium text-gray-500 py-1 outline-none resize-none" rows={2} placeholder="Descripción" />
                  
                  <input type="text" value={card.linkUrl || ''} onChange={(e) => {
                    const items = [...getNestedState('cartas_resultados_props.benefits', [])];
                    items[idx].linkUrl = e.target.value;
                    updateNestedState('cartas_resultados_props.benefits', items);
                  }} className="w-full bg-slate-50 border-0 rounded-md px-2 py-1 text-xs outline-none font-mono" placeholder="URL Enlace (opcional)" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </AccordionItem>

      <AccordionItem id="steps" isOpen={openAccordion === 'steps'} toggleAccordion={toggleAccordion} title="8. Pasos / Flujos con Imagen">
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-gray-700">Secciones de Flujo</span>
            <button onClick={() => {
              const current = getNestedState('seccion_cuerpo_imagen_data', []);
              updateNestedState('seccion_cuerpo_imagen_data', [...current, { imgSrc: '', imgAlt: '', title: 'Nuevo Paso', subtitle: '', iconText: 'Paso X', order: 'text-first', linkUrl: '', linkText: '' }]);
            }} className="text-[9px] font-black text-cyan-600 uppercase hover:underline">+ AGREGAR</button>
          </div>
          
          <div className="space-y-3">
            {(getNestedState('seccion_cuerpo_imagen_data', [])).map((paso, idx) => (
              <div key={idx} className="p-3 bg-white rounded-xl border border-gray-100 space-y-2 relative group/item">
                <button onClick={() => {
                  const items = [...getNestedState('seccion_cuerpo_imagen_data', [])];
                  items.splice(idx, 1);
                  updateNestedState('seccion_cuerpo_imagen_data', items);
                }} className="absolute top-2 right-2 text-red-500 opacity-0 group-hover/item:opacity-100 transition-opacity z-10 bg-white p-1 rounded-full"><Trash2 className="w-3.5 h-3.5" /></button>
                
                <div className="flex items-center justify-between">
                  <label className="text-[9px] font-bold text-gray-400 uppercase">Orden Visual</label>
                  <select value={paso.order || 'text-first'} onChange={(e) => {
                    const items = [...getNestedState('seccion_cuerpo_imagen_data', [])];
                    items[idx].order = e.target.value;
                    updateNestedState('seccion_cuerpo_imagen_data', items);
                  }} className="bg-slate-50 border-0 rounded-md text-xs font-bold px-2 py-1 outline-none">
                    <option value="text-first">Texto a la Izquierda</option>
                    <option value="text-last">Texto a la Derecha</option>
                  </select>
                </div>

                {renderImageUpload(`Imagen Paso ${idx + 1}`, paso.imgSrc, (url) => {
                  const items = [...getNestedState('seccion_cuerpo_imagen_data', [])];
                  items[idx].imgSrc = url;
                  updateNestedState('seccion_cuerpo_imagen_data', items);
                })}
                
                <input type="text" value={paso.imgAlt || ''} onChange={(e) => {
                  const items = [...getNestedState('seccion_cuerpo_imagen_data', [])];
                  items[idx].imgAlt = e.target.value;
                  updateNestedState('seccion_cuerpo_imagen_data', items);
                }} className="w-full bg-slate-50 border-0 rounded-md px-2 py-1 text-xs outline-none mt-1" placeholder="Texto Alternativo Imagen" />
                
                <input type="text" value={paso.iconText || ''} onChange={(e) => {
                  const items = [...getNestedState('seccion_cuerpo_imagen_data', [])];
                  items[idx].iconText = e.target.value;
                  updateNestedState('seccion_cuerpo_imagen_data', items);
                }} className="w-[90%] bg-transparent border-b border-dashed border-gray-300 font-black text-[10px] uppercase text-cyan-600 py-0.5 outline-none mt-2" placeholder="Etiqueta Superior (ej. Paso 1)" />

                <input type="text" value={paso.title || ''} onChange={(e) => {
                  const items = [...getNestedState('seccion_cuerpo_imagen_data', [])];
                  items[idx].title = e.target.value;
                  updateNestedState('seccion_cuerpo_imagen_data', items);
                }} className="w-full bg-transparent border-b border-dashed border-gray-300 font-bold text-xs py-0.5 outline-none" placeholder="Título" />
                
                <textarea value={paso.subtitle || ''} onChange={(e) => {
                  const items = [...getNestedState('seccion_cuerpo_imagen_data', [])];
                  items[idx].subtitle = e.target.value;
                  updateNestedState('seccion_cuerpo_imagen_data', items);
                }} className="w-full bg-transparent text-[11px] font-medium text-gray-500 py-1 outline-none resize-none" rows={2} placeholder="Descripción" />
                
                <div className="flex gap-2">
                  <div className="flex-1 space-y-1">
                    <label className="text-[8px] font-bold text-gray-400 uppercase">Texto Link</label>
                    <input type="text" value={paso.linkText || ''} onChange={(e) => {
                      const items = [...getNestedState('seccion_cuerpo_imagen_data', [])];
                      items[idx].linkText = e.target.value;
                      updateNestedState('seccion_cuerpo_imagen_data', items);
                    }} className="w-full bg-slate-50 border-0 rounded-md px-2 py-1 text-xs outline-none" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <label className="text-[8px] font-bold text-gray-400 uppercase">URL Link</label>
                    <input type="text" value={paso.linkUrl || ''} onChange={(e) => {
                      const items = [...getNestedState('seccion_cuerpo_imagen_data', [])];
                      items[idx].linkUrl = e.target.value;
                      updateNestedState('seccion_cuerpo_imagen_data', items);
                    }} className="w-full bg-slate-50 border-0 rounded-md px-2 py-1 text-xs outline-none font-mono" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </AccordionItem>

      <AccordionItem id="team" isOpen={openAccordion === 'team'} toggleAccordion={toggleAccordion} title="9. Equipo / Testimonios">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[9px] font-bold text-gray-400 uppercase">Título de Sección</label>
            <input type="text" value={getNestedState('datos_testimonios.titulo')} onChange={(e) => updateNestedState('datos_testimonios.titulo', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none font-bold" />
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-bold text-gray-400 uppercase">Texto 'Ver Más'</label>
            <input type="text" value={getNestedState('datos_testimonios.verMasTexto')} onChange={(e) => updateNestedState('datos_testimonios.verMasTexto', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none" />
          </div>

          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-gray-700">Miembros / Testimonios</span>
              <button onClick={() => {
                const current = getNestedState('datos_testimonios.datos', []);
                updateNestedState('datos_testimonios.datos', [...current, { nombre: 'Nuevo', cargo: '', descripcion: '', imgSrc: '', enlace: '' }]);
              }} className="text-[9px] font-black text-cyan-600 uppercase hover:underline">+ AGREGAR</button>
            </div>
            
            <div className="space-y-3">
              {(getNestedState('datos_testimonios.datos', [])).map((item, idx) => (
                <div key={idx} className="p-3 bg-white rounded-xl border border-gray-100 space-y-2 relative group/item">
                  <button onClick={() => {
                    const items = [...getNestedState('datos_testimonios.datos', [])];
                    items.splice(idx, 1);
                    updateNestedState('datos_testimonios.datos', items);
                  }} className="absolute top-2 right-2 text-red-500 opacity-0 group-hover/item:opacity-100 transition-opacity z-10 bg-white p-1 rounded-full"><Trash2 className="w-3.5 h-3.5" /></button>
                  
                  {renderImageUpload(`Foto / Avatar ${idx + 1}`, item.imgSrc, (url) => {
                    const items = [...getNestedState('datos_testimonios.datos', [])];
                    items[idx].imgSrc = url;
                    updateNestedState('datos_testimonios.datos', items);
                  })}
                  
                  <div className="flex gap-2 mt-2">
                    <input type="text" value={item.nombre} onChange={(e) => {
                      const items = [...getNestedState('datos_testimonios.datos', [])];
                      items[idx].nombre = e.target.value;
                      updateNestedState('datos_testimonios.datos', items);
                    }} className="flex-1 bg-transparent border-b border-dashed border-gray-300 font-bold text-xs py-0.5 outline-none" placeholder="Nombre" />
                    <input type="text" value={item.cargo} onChange={(e) => {
                      const items = [...getNestedState('datos_testimonios.datos', [])];
                      items[idx].cargo = e.target.value;
                      updateNestedState('datos_testimonios.datos', items);
                    }} className="flex-1 bg-transparent border-b border-dashed border-gray-300 text-xs py-0.5 outline-none" placeholder="Cargo / Empresa" />
                  </div>
                  
                  <textarea value={item.descripcion} onChange={(e) => {
                    const items = [...getNestedState('datos_testimonios.datos', [])];
                    items[idx].descripcion = e.target.value;
                    updateNestedState('datos_testimonios.datos', items);
                  }} className="w-full bg-transparent text-[11px] font-medium text-gray-500 py-1 outline-none resize-none" rows={2} placeholder="Descripción / Testimonio" />

                  <input type="text" value={item.enlace || ''} onChange={(e) => {
                    const items = [...getNestedState('datos_testimonios.datos', [])];
                    items[idx].enlace = e.target.value;
                    updateNestedState('datos_testimonios.datos', items);
                  }} className="w-full bg-slate-50 border-0 rounded-md px-2 py-1 text-xs outline-none font-mono" placeholder="Enlace Perfil (Opcional)" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </AccordionItem>

      <AccordionItem id="additional_cards" isOpen={openAccordion === 'additional_cards'} toggleAccordion={toggleAccordion} title="10. Beneficios Adicionales">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[9px] font-bold text-gray-400 uppercase">Título Principal</label>
            <input type="text" value={getNestedState('adicionales_cartas_resultados_props.title')} onChange={(e) => updateNestedState('adicionales_cartas_resultados_props.title', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none font-bold" />
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-bold text-gray-400 uppercase">Subtítulo</label>
            <textarea value={getNestedState('adicionales_cartas_resultados_props.subtitle')} onChange={(e) => updateNestedState('adicionales_cartas_resultados_props.subtitle', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none font-medium min-h-[50px]" />
          </div>

          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-gray-700">Tarjetas Extra</span>
              <button onClick={() => {
                const current = getNestedState('adicionales_cartas_resultados_props.benefits', []);
                updateNestedState('adicionales_cartas_resultados_props.benefits', [...current, { image: '', title: 'Nuevo', description: '', linkUrl: '' }]);
              }} className="text-[9px] font-black text-cyan-600 uppercase hover:underline">+ AGREGAR</button>
            </div>
            
            <div className="space-y-3">
              {(getNestedState('adicionales_cartas_resultados_props.benefits', [])).map((card, idx) => (
                <div key={idx} className="p-3 bg-white rounded-xl border border-gray-100 space-y-2 relative group/item">
                  <button onClick={() => {
                    const items = [...getNestedState('adicionales_cartas_resultados_props.benefits', [])];
                    items.splice(idx, 1);
                    updateNestedState('adicionales_cartas_resultados_props.benefits', items);
                  }} className="absolute top-2 right-2 text-red-500 opacity-0 group-hover/item:opacity-100 transition-opacity z-10 bg-white rounded-full p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                  
                  {renderImageUpload(`Imagen Carta Extra ${idx + 1}`, card.image, (url) => {
                    const items = [...getNestedState('adicionales_cartas_resultados_props.benefits', [])];
                    items[idx].image = url;
                    updateNestedState('adicionales_cartas_resultados_props.benefits', items);
                  })}
                  
                  <input type="text" value={card.title} onChange={(e) => {
                    const items = [...getNestedState('adicionales_cartas_resultados_props.benefits', [])];
                    items[idx].title = e.target.value;
                    updateNestedState('adicionales_cartas_resultados_props.benefits', items);
                  }} className="w-full bg-transparent border-b border-dashed border-gray-300 font-bold text-xs py-0.5 outline-none mt-2" placeholder="Título" />
                  
                  <textarea value={card.description} onChange={(e) => {
                    const items = [...getNestedState('adicionales_cartas_resultados_props.benefits', [])];
                    items[idx].description = e.target.value;
                    updateNestedState('adicionales_cartas_resultados_props.benefits', items);
                  }} className="w-full bg-transparent text-[11px] font-medium text-gray-500 py-1 outline-none resize-none" rows={2} placeholder="Descripción" />
                  
                  <input type="text" value={card.linkUrl || ''} onChange={(e) => {
                    const items = [...getNestedState('adicionales_cartas_resultados_props.benefits', [])];
                    items[idx].linkUrl = e.target.value;
                    updateNestedState('adicionales_cartas_resultados_props.benefits', items);
                  }} className="w-full bg-slate-50 border-0 rounded-md px-2 py-1 text-xs outline-none font-mono" placeholder="URL Enlace (opcional)" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </AccordionItem>

      <AccordionItem id="faqs" isOpen={openAccordion === 'faqs'} toggleAccordion={toggleAccordion} title="11. Preguntas Frecuentes (FAQs)">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[9px] font-bold text-gray-400 uppercase">Título FAQs</label>
            <input type="text" value={getNestedState('seccion_con_titulo_y_acordeon_props.title')} onChange={(e) => updateNestedState('seccion_con_titulo_y_acordeon_props.title', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none font-bold" />
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-bold text-gray-400 uppercase">Subtítulo FAQs</label>
            <textarea value={getNestedState('seccion_con_titulo_y_acordeon_props.subtitle')} onChange={(e) => updateNestedState('seccion_con_titulo_y_acordeon_props.subtitle', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none font-medium min-h-[50px]" />
          </div>

          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-gray-700">Preguntas</span>
              <button onClick={() => {
                const current = getNestedState('seccion_con_titulo_y_acordeon_props.questions', []);
                updateNestedState('seccion_con_titulo_y_acordeon_props.questions', [...current, { question: 'Nueva Pregunta?', answer: '' }]);
              }} className="text-[9px] font-black text-cyan-600 uppercase hover:underline">+ AGREGAR</button>
            </div>
            
            <div className="space-y-2">
              {(getNestedState('seccion_con_titulo_y_acordeon_props.questions', [])).map((faq, idx) => (
                <div key={idx} className="p-3 bg-white rounded-xl border border-gray-100 space-y-2 relative group/item">
                  <button onClick={() => {
                    const items = [...getNestedState('seccion_con_titulo_y_acordeon_props.questions', [])];
                    items.splice(idx, 1);
                    updateNestedState('seccion_con_titulo_y_acordeon_props.questions', items);
                  }} className="absolute top-2 right-2 text-red-500 opacity-0 group-hover/item:opacity-100 transition-opacity"><Trash2 className="w-3.5 h-3.5" /></button>
                  <input type="text" value={faq.question} onChange={(e) => {
                    const items = [...getNestedState('seccion_con_titulo_y_acordeon_props.questions', [])];
                    items[idx].question = e.target.value;
                    updateNestedState('seccion_con_titulo_y_acordeon_props.questions', items);
                  }} className="w-[90%] bg-transparent border-b border-dashed border-gray-300 font-bold text-xs py-0.5 outline-none" placeholder="Pregunta" />
                  <textarea value={faq.answer} onChange={(e) => {
                    const items = [...getNestedState('seccion_con_titulo_y_acordeon_props.questions', [])];
                    items[idx].answer = e.target.value;
                    updateNestedState('seccion_con_titulo_y_acordeon_props.questions', items);
                  }} className="w-full bg-transparent text-[11px] font-medium text-gray-500 py-1 outline-none resize-none" rows={2} placeholder="Respuesta" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </AccordionItem>

      <AccordionItem id="cta" isOpen={openAccordion === 'cta'} toggleAccordion={toggleAccordion} title="12. Llamado a la Acción (CTA)">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[9px] font-bold text-gray-400 uppercase">Título Final</label>
            <input type="text" value={getNestedState('llamado_ala_accion_props.title')} onChange={(e) => updateNestedState('llamado_ala_accion_props.title', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none font-bold" />
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-bold text-gray-400 uppercase">Subtítulo Final</label>
            <textarea value={getNestedState('llamado_ala_accion_props.subtitle')} onChange={(e) => updateNestedState('llamado_ala_accion_props.subtitle', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none font-medium min-h-[50px]" />
          </div>
          
          <div className="p-3 bg-white rounded-xl border border-gray-100 space-y-2">
            <span className="text-[10px] font-bold text-gray-700">Botón Primario</span>
            <div className="flex gap-2">
              <input type="text" value={getNestedState('llamado_ala_accion_props.firstButton.text')} onChange={(e) => updateNestedState('llamado_ala_accion_props.firstButton.text', e.target.value)} className="flex-1 bg-slate-50 border-0 rounded-md px-2 py-1 text-xs outline-none font-bold text-cyan-600" placeholder="Texto" />
              <input type="text" value={getNestedState('llamado_ala_accion_props.firstButton.to')} onChange={(e) => updateNestedState('llamado_ala_accion_props.firstButton.to', e.target.value)} className="flex-[2] bg-slate-50 border-0 rounded-md px-2 py-1 text-xs outline-none font-mono" placeholder="URL" />
            </div>
          </div>
          
          <div className="p-3 bg-white rounded-xl border border-gray-100 space-y-2">
            <span className="text-[10px] font-bold text-gray-700">Botón Secundario</span>
            <div className="flex gap-2">
              <input type="text" value={getNestedState('llamado_ala_accion_props.secondButton.text')} onChange={(e) => updateNestedState('llamado_ala_accion_props.secondButton.text', e.target.value)} className="flex-1 bg-slate-50 border-0 rounded-md px-2 py-1 text-xs outline-none font-bold text-gray-600" placeholder="Texto" />
              <input type="text" value={getNestedState('llamado_ala_accion_props.secondButton.to')} onChange={(e) => updateNestedState('llamado_ala_accion_props.secondButton.to', e.target.value)} className="flex-[2] bg-slate-50 border-0 rounded-md px-2 py-1 text-xs outline-none font-mono" placeholder="URL" />
            </div>
          </div>
        </div>
      </AccordionItem>

    </div>
  );
};
