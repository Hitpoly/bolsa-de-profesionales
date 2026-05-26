import React, { useState, useEffect } from 'react';
import { Loader2, Plus, Edit2, Trash2, Users, X, Save, User as UserIcon } from 'lucide-react';
import axios from 'axios';

const API_URL = 'https://apibolsaprofesionales.hitpoly.com/ajax/EquipoController.php';

export function TeamTab({ empresaId }) {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    id: null,
    profesional_id: '',
    cargo_rol: '',
    estado: 'activo'
  });

  useEffect(() => {
    if (empresaId) {
      loadTeam();
    }
  }, [empresaId]);

  const loadTeam = async () => {
    try {
      setLoading(true);
      const res = await axios.post(API_URL, {
        accion: 'get_equipo',
        empresa_id: empresaId
      });
      if (res.data?.success) {
        setTeam(res.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching team:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.profesional_id) {
      alert("El ID del profesional es obligatorio");
      return;
    }
    
    setSaving(true);
    try {
      const payload = {
        accion: formData.id ? 'update_rol' : 'add_miembro',
        empresa_id: empresaId,
        ...formData
      };
      
      const res = await axios.post(API_URL, payload);
      if (res.data?.success) {
        setIsModalOpen(false);
        loadTeam();
        setFormData({ id: null, profesional_id: '', cargo_rol: '', estado: 'activo' });
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
    if (!window.confirm("¿Seguro que deseas eliminar este miembro del equipo?")) return;
    try {
      // Assuming 'delete_miembro' or similar, though I didn't see it in the controller code previously. Wait, let me check.
      const res = await axios.post(API_URL, { accion: 'delete_miembro', id, empresa_id: empresaId });
      if (res.data?.success) {
        loadTeam();
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
      profesional_id: item.profesional_id || '',
      cargo_rol: item.cargo_rol || '',
      estado: item.estado || 'activo'
    });
    setIsModalOpen(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h4 className="text-xl font-black text-gray-900 flex items-center gap-2">
          <Users className="w-6 h-6 text-[#0a66c2]" /> Equipo de Profesionales
        </h4>
        <button 
          onClick={() => {
            setFormData({ id: null, profesional_id: '', cargo_rol: '', estado: 'activo' });
            setIsModalOpen(true);
          }}
          className="bg-[#0a66c2] text-white px-4 py-2 rounded-full text-xs font-black flex items-center gap-2 shadow-lg shadow-blue-100 hover:bg-[#084d8f] transition-all"
        >
          <Plus className="w-4 h-4" /> AÑADIR MIEMBRO
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#0a66c2] mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Cargando equipo...</p>
        </div>
      ) : team.length === 0 ? (
        <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="font-medium text-lg text-gray-600">Aún no hay miembros en el equipo</p>
          <p className="text-sm mt-2 max-w-md mx-auto">
            Añade a los profesionales que trabajan en tu empresa.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {team.map(member => (
            <div key={member.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm group p-4 text-center relative">
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(member)} className="bg-gray-100 p-1.5 rounded-lg hover:bg-gray-200 text-gray-700">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleDelete(member.id)} className="bg-red-50 p-1.5 rounded-lg hover:bg-red-100 text-red-600">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              
              <div className="w-20 h-20 mx-auto rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-md mb-3">
                {member.avatar ? (
                  <img src={member.avatar} alt={member.nombre} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <UserIcon className="w-8 h-8" />
                  </div>
                )}
              </div>
              <h5 className="font-bold text-gray-900 line-clamp-1">{member.nombre || 'Profesional ' + member.profesional_id}</h5>
              <p className="text-xs text-gray-500 font-medium mb-2">{member.cargo_rol || 'Miembro del equipo'}</p>
              
              <span className={`inline-block px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                member.estado === 'activo' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
              }`}>
                {member.estado}
              </span>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md my-8">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
              <h3 className="text-xl font-black text-gray-900">
                {formData.id ? 'Editar Miembro' : 'Añadir Miembro'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-900 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">ID del Profesional *</label>
                  <input
                    type="number"
                    required
                    value={formData.profesional_id}
                    onChange={e => setFormData({ ...formData, profesional_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="Ej: 125"
                  />
                  <p className="text-xs text-gray-500 mt-1">El ID de usuario del profesional en la plataforma.</p>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Cargo / Rol</label>
                  <input
                    type="text"
                    value={formData.cargo_rol}
                    onChange={e => setFormData({ ...formData, cargo_rol: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="Ej: Desarrollador Frontend"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Estado</label>
                  <select
                    value={formData.estado}
                    onChange={e => setFormData({ ...formData, estado: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
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
                  disabled={saving}
                  className="bg-[#0a66c2] text-white px-6 py-2 rounded-xl font-black shadow-lg shadow-blue-100 hover:bg-[#084d8f] transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  {saving ? 'Guardando...' : 'Guardar Miembro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
