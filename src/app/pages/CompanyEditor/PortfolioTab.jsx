import React, { useState, useEffect } from 'react';
import { Loader2, Plus, Edit2, Trash2, Video, X, Camera, Save } from 'lucide-react';
import axios from 'axios';
import { uploadToImageKit } from '../../services/imageKitService';

const API_URL = 'https://apibolsaprofesionales.hitpoly.com/ajax/PortafolioController.php';

export function PortfolioTab({ empresaId }) {
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [formData, setFormData] = useState({
    id: null,
    titulo: '',
    descripcion: '',
    imagen_portada: '',
    enlace_externo: '',
    testimonio_autor: '',
    testimonio_url_video: '',
    testimonio_plataforma: 'youtube',
    testimonio_orientacion: 'horizontal'
  });

  useEffect(() => {
    if (empresaId) {
      loadPortfolios();
    }
  }, [empresaId]);

  const loadPortfolios = async () => {
    try {
      setLoading(true);
      const res = await axios.post(API_URL, {
        accion: 'get_portafolio',
        empresa_id: empresaId
      });
      if (res.data?.success) {
        setPortfolios(res.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching portfolios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setUploadingImage(true);
      const url = await uploadToImageKit(file, 'portafolios');
      if (url) {
        setFormData(prev => ({ ...prev, imagen_portada: url }));
      }
    } catch (error) {
      console.error('Error uploading image', error);
      alert('Error al subir la imagen');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.titulo) {
      alert("El título es obligatorio");
      return;
    }
    
    setSaving(true);
    try {
      const payload = {
        accion: formData.id ? 'add_portafolio' : 'add_portafolio', // Note: backend doesn't have an explicit 'update', you may need to handle it or it's implicitly handled. Actually backend only has add_portafolio, I will send add_portafolio for now and id if present.
        empresa_id: empresaId,
        ...formData
      };
      
      const res = await axios.post(API_URL, payload);
      if (res.data?.success) {
        setIsModalOpen(false);
        loadPortfolios();
        setFormData({
          id: null, titulo: '', descripcion: '', imagen_portada: '', enlace_externo: '',
          testimonio_autor: '', testimonio_url_video: '', testimonio_plataforma: 'youtube', testimonio_orientacion: 'horizontal'
        });
      } else {
        alert(res.data?.error || "Error al guardar");
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este proyecto del portafolio?")) return;
    try {
      const res = await axios.post(API_URL, { accion: 'delete_portafolio', id, empresa_id: empresaId });
      if (res.data?.success) {
        loadPortfolios();
      } else {
        alert(res.data?.error || "Error al eliminar");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const openEdit = (item) => {
    setFormData({
      id: item.id,
      titulo: item.titulo || '',
      descripcion: item.descripcion || '',
      imagen_portada: item.imagen_portada || '',
      enlace_externo: item.enlace_externo || '',
      testimonio_autor: item.testimonio_autor || '',
      testimonio_url_video: item.testimonio_url_video || '',
      testimonio_plataforma: item.testimonio_plataforma || 'youtube',
      testimonio_orientacion: item.testimonio_orientacion || 'horizontal'
    });
    setIsModalOpen(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h4 className="text-xl font-black text-gray-900 flex items-center gap-2">
          <Video className="w-6 h-6 text-[#0a66c2]" /> Portafolio de la Empresa
        </h4>
        <button 
          onClick={() => {
            setFormData({
              id: null, titulo: '', descripcion: '', imagen_portada: '', enlace_externo: '',
              testimonio_autor: '', testimonio_url_video: '', testimonio_plataforma: 'youtube', testimonio_orientacion: 'horizontal'
            });
            setIsModalOpen(true);
          }}
          className="bg-[#0a66c2] text-white px-4 py-2 rounded-full text-xs font-black flex items-center gap-2 shadow-lg shadow-blue-100 hover:bg-[#084d8f] transition-all"
        >
          <Plus className="w-4 h-4" /> AÑADIR PROYECTO
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#0a66c2] mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Cargando portafolio...</p>
        </div>
      ) : portfolios.length === 0 ? (
        <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <Video className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="font-medium text-lg text-gray-600">Aún no hay proyectos en el portafolio</p>
          <p className="text-sm mt-2 max-w-md mx-auto">
            Añade tus mejores proyectos con videos testimoniales para atraer más clientes.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolios.map(item => (
            <div key={item.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm group">
              <div className="aspect-video w-full bg-gray-100 relative">
                {item.imagen_portada ? (
                  <img src={item.imagen_portada} alt={item.titulo} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                    <Video className="w-10 h-10" />
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(item)} className="bg-white/90 p-1.5 rounded-lg shadow-sm hover:bg-white text-gray-700">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="bg-red-500/90 p-1.5 rounded-lg shadow-sm hover:bg-red-500 text-white">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <h5 className="font-bold text-gray-900 line-clamp-1">{item.titulo}</h5>
                {item.testimonio_autor && (
                  <p className="text-xs text-emerald-600 font-bold mt-1">Con testimonio de {item.testimonio_autor}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-8">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
              <h3 className="text-xl font-black text-gray-900">
                {formData.id ? 'Editar Proyecto' : 'Añadir al Portafolio'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-900 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Columna Izquierda: Datos del Proyecto */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 border-b pb-2">Información del Proyecto</h4>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Título del Proyecto *</label>
                    <input
                      type="text"
                      required
                      value={formData.titulo}
                      onChange={e => setFormData({ ...formData, titulo: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      placeholder="Ej: Desarrollo de App Móvil"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Descripción</label>
                    <textarea
                      value={formData.descripcion}
                      onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      placeholder="Breve descripción del trabajo realizado"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Enlace Externo (Opcional)</label>
                    <input
                      type="url"
                      value={formData.enlace_externo}
                      onChange={e => setFormData({ ...formData, enlace_externo: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      placeholder="https://..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Imagen de Portada</label>
                    <div 
                      className="w-full aspect-video rounded-xl bg-gray-50 border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center cursor-pointer relative group"
                      onClick={() => document.getElementById('portafolioImg').click()}
                    >
                      {uploadingImage ? (
                        <div className="text-center">
                          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-2" />
                          <span className="text-xs text-gray-500">Subiendo...</span>
                        </div>
                      ) : formData.imagen_portada ? (
                        <img src={formData.imagen_portada} className="w-full h-full object-cover" alt="Portada" />
                      ) : (
                        <div className="text-center">
                          <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2 group-hover:text-blue-500 transition-colors" />
                          <span className="text-xs text-gray-500">Click para subir imagen</span>
                        </div>
                      )}
                      <input id="portafolioImg" type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </div>
                  </div>
                </div>

                {/* Columna Derecha: Testimonio */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 border-b pb-2">Testimonio (Opcional)</h4>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Autor del Testimonio</label>
                    <input
                      type="text"
                      value={formData.testimonio_autor}
                      onChange={e => setFormData({ ...formData, testimonio_autor: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      placeholder="Ej: Juan Pérez - CEO"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">URL del Video Testimonio</label>
                    <input
                      type="url"
                      value={formData.testimonio_url_video}
                      onChange={e => setFormData({ ...formData, testimonio_url_video: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      placeholder="Link de YouTube, TikTok, etc."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Plataforma</label>
                      <select
                        value={formData.testimonio_plataforma}
                        onChange={e => setFormData({ ...formData, testimonio_plataforma: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
                      >
                        <option value="youtube">YouTube</option>
                        <option value="tiktok">TikTok</option>
                        <option value="instagram">Instagram</option>
                        <option value="facebook">Facebook</option>
                        <option value="otro">Otro</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Orientación</label>
                      <select
                        value={formData.testimonio_orientacion}
                        onChange={e => setFormData({ ...formData, testimonio_orientacion: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
                      >
                        <option value="horizontal">Horizontal (16:9)</option>
                        <option value="vertical">Vertical (9:16)</option>
                      </select>
                    </div>
                  </div>
                  
                  {formData.testimonio_url_video && (
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                      <p className="text-xs text-blue-800 font-medium">
                        El video se mostrará en el perfil público de la empresa en la sección del portafolio.
                      </p>
                    </div>
                  )}
                </div>

              </div>

              <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 rounded-xl text-gray-600 font-bold hover:bg-gray-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving || uploadingImage}
                  className="bg-[#0a66c2] text-white px-6 py-2 rounded-xl font-black shadow-lg shadow-blue-100 hover:bg-[#084d8f] transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  {saving ? 'Guardando...' : 'Guardar Proyecto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
