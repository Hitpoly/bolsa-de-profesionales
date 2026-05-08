import React, { useState, useEffect } from 'react';
import { Building2, Globe, FileText, MapPin, Phone, Mail, Plus, Trash2, Save, ExternalLink, Sparkles, ChevronRight, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useSystem } from '../data/SystemContext';

interface CompanyEditorProps {
  company: any;
  onSave: () => void;
  onClose: () => void;
}

const CompanyEditor: React.FC<CompanyEditorProps> = ({ company, onSave, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    descripcion: '',
    nit_rut: '',
    sitio_web: '',
    direccion: '',
    telefono: '',
    email_contacto: '',
    // Campos de datos_empresa
    rubro: '',
    empleados: '',
    objetivo_principal: '',
    presupuesto_marketing: '',
    ingreso_anual_estimado: '',
    ano_fundacion: '',
    ciudad: '',
    codigo_postal: '',
    documento_fiscal: ''
  });

  const [socialLinks, setSocialLinks] = useState<{platform: string, url: string}[]>([]);

  useEffect(() => {
    if (company) {
      setFormData({
        descripcion: company.descripcion || '',
        nit_rut: company.nit_rut || '',
        sitio_web: company.sitio_web || '',
        direccion: company.direccion || '',
        telefono: company.telefono || '',
        email_contacto: company.email_contacto || '',
        rubro: company.rubro || '',
        empleados: company.empleados || '',
        objetivo_principal: company.objetivo_principal || '',
        presupuesto_marketing: company.presupuesto_marketing || '',
        ingreso_anual_estimado: company.ingreso_anual_estimado || '',
        ano_fundacion: company.ano_fundacion || '',
        ciudad: company.ciudad || '',
        codigo_postal: company.codigo_postal || '',
        documento_fiscal: company.documento_fiscal || ''
      });
      cargarSocialLinks();
    }
  }, [company]);

  const cargarSocialLinks = async () => {
    try {
      const res = await axios.post('https://apiweb.hitpoly.com/ajax/bolsaController.php', {
        accion: 'getSocialLinks',
        owner_id: company.id,
        owner_type: 'enterprise'
      });
      if (res.data.success) {
        setSocialLinks(res.data.data || []);
      }
    } catch (e) {
      // Error silencioso
    }
  };

  const { setHeaderData, setMobileActions } = useSystem();

  useEffect(() => {
    setHeaderData({
      title: 'Perfil de Empresa',
      subtitle: 'Información corporativa y presencia de tu marca',
      icon: 'building',
      color: '#7c3aed'
    });
    return () => {
      setHeaderData({
        title: 'Bolsa de Empleo',
        subtitle: 'Oportunidades y talento profesional',
        icon: 'briefcase',
        color: '#0a66c2'
      });
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const addSocialLink = () => {
    setSocialLinks([...socialLinks, { platform: 'linkedin', url: '' }]);
  };

  const removeSocialLink = (index: number) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index));
  };

  const updateSocialLink = (index: number, field: string, value: string) => {
    const newLinks = [...socialLinks];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setSocialLinks(newLinks);
  };

  const [showSuccess, setShowSuccess] = useState(false);

  const handleSave = React.useCallback(async () => {
    setLoading(true);
    setShowSuccess(false);
    try {
      const payload = {
        accion: 'updateEnterpriseProfile',
        empresa_id: company.id,
        step_data: {
          ...formData,
          social_links: socialLinks
        }
      };

      const res = await axios.post('https://apiweb.hitpoly.com/ajax/bolsaController.php', payload);
      
      if (res.data.success) {
        setShowSuccess(true);
        onSave(); // Refrescar contextos sin redirigir
        
        setTimeout(() => {
          setShowSuccess(false);
        }, 3000);
      } else {
        alert('Error al guardar: ' + (res.data.error || 'Respuesta fallida'));
      }
    } catch (e) {
      alert('Error de conexión.');
    } finally {
      setLoading(false);
    }
  }, [company.id, formData, socialLinks, onSave]);

  const companyActions = React.useMemo(() => [
    {
      id: 'save_company',
      icon: loading ? 'loader' : (showSuccess ? 'check' : 'save') as any,
      title: loading ? 'Guardando...' : (showSuccess ? 'Guardado' : 'Publicar'),
      onClick: handleSave,
      disabled: loading,
      color: showSuccess ? '#10b981' : '#7c3aed'
    }
  ], [loading, showSuccess, handleSave]);

  useEffect(() => {
    setMobileActions(companyActions);
    return () => setMobileActions([]);
  }, [companyActions, setMobileActions]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-2 text-gray-900">
                <Sparkles className="w-6 h-6 text-purple-600" />
                Información Corporativa
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-widest">Descripción Corporativa</label>
                <textarea 
                  name="descripcion"
                  rows={4}
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-[#0a66c2]/10 outline-none transition-all resize-none text-sm text-gray-700"
                  placeholder="Resumen de la actividad empresarial..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-widest">NIT / RUT</label>
                  <div className="relative">
                    <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="text" 
                      name="nit_rut"
                      value={formData.nit_rut}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50/50 focus:bg-white outline-none transition-all text-sm text-gray-700"
                      placeholder="Identificación fiscal"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-widest">Sitio Web</label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="url" 
                      name="sitio_web"
                      value={formData.sitio_web}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50/50 focus:bg-white outline-none transition-all text-sm text-gray-700"
                      placeholder="https://ejemplo.com"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-widest">Dirección Física</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="text" 
                      name="direccion"
                      value={formData.direccion}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50/50 focus:bg-white outline-none transition-all text-sm text-gray-700"
                      placeholder="Ubicación de la sede principal"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-widest">Teléfono</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        type="tel" 
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleInputChange}
                        className="w-full pl-12 pr-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50/50 focus:bg-white outline-none transition-all text-sm text-gray-700"
                        placeholder="Contacto telefónico"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-widest">Email Corporativo</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        type="email" 
                        name="email_contacto"
                        value={formData.email_contacto}
                        onChange={handleInputChange}
                        className="w-full pl-12 pr-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50/50 focus:bg-white outline-none transition-all text-sm text-gray-700"
                        placeholder="correo@empresa.com"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Redes Sociales</h3>
              <button 
                onClick={addSocialLink}
                className="p-1.5 bg-blue-50 text-[#0a66c2] rounded-md hover:bg-blue-100 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {socialLinks.length === 0 && (
                <div className="text-center py-6 border-2 border-dashed border-gray-100 rounded-lg">
                  <p className="text-xs text-gray-400 font-medium">Sin enlaces vinculados</p>
                </div>
              )}
              {socialLinks.map((link, index) => (
                <div key={index} className="flex gap-2 animate-in zoom-in-95 duration-200">
                  <select 
                    value={link.platform}
                    onChange={(e) => updateSocialLink(index, 'platform', e.target.value)}
                    className="px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-[10px] font-bold outline-none"
                  >
                    <option value="linkedin">LinkedIn</option>
                    <option value="instagram">Instagram</option>
                    <option value="facebook">Facebook</option>
                    <option value="twitter">Twitter</option>
                    <option value="github">GitHub</option>
                    <option value="portfolio">Portfolio</option>
                    <option value="web">Web</option>
                  </select>
                  <input 
                    type="url"
                    value={link.url}
                    onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
                    placeholder="URL..."
                    className="flex-1 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-xs outline-none focus:bg-white transition-all"
                  />
                  <button 
                    onClick={() => removeSocialLink(index)}
                    className="p-1.5 text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CompanyEditor;
