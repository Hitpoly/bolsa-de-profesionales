import React, { useState } from 'react';
import { Sparkles, BookOpen, Globe, Heart, Coffee } from 'lucide-react';
import axios from 'axios';

const API_HOLDING = 'https://apiweb.hitpoly.com/ajax/bolsaController.php';

export function ShowcaseConfig({ profile, userId }) {
  const [config, setConfig] = useState({
    experience_ids: profile?.bolsa_config?.experience_ids || [],
    employment_ids: profile?.bolsa_config?.employment_ids || [],
    education_ids: profile?.bolsa_config?.education_ids || [],
    languages_ids: profile?.bolsa_config?.languages_ids || [],
    links_ids: profile?.bolsa_config?.links_ids || [],
    travel_ids: profile?.bolsa_config?.travel_ids || [],
    hobbies_ids: profile?.bolsa_config?.hobbies_ids || [],
    interests_ids: profile?.bolsa_config?.interests_ids || []
  });
  
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggleItem = (field, id) => {
    setConfig((prev) => {
      const current = [...prev[field]];
      const idx = current.indexOf(id);
      if (idx >= 0) current.splice(idx, 1); else current.push(id);
      return { ...prev, [field]: current };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await axios.post(API_HOLDING, {
        action: 'saveStep',
        user_id: userId,
        step_data: { bolsa_config: config }
      });
      if (res.data.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (e) { alert('Error al guardar'); }
    finally { setSaving(false); }
  };

  const sections = [
    { key: 'experience_ids', label: 'Experiencia Laboral', items: profile?.experiencia_laboral || [], icon: BookOpen },
    { key: 'employment_ids', label: 'Empleos', items: profile?.empleo || [], icon: Briefcase },
    { key: 'education_ids', label: 'Educación', items: profile?.educacion || [], icon: GraduationCap },
    { key: 'languages_ids', label: 'Idiomas', items: profile?.idiomas || [], icon: Globe },
    { key: 'links_ids', label: 'Enlaces', items: profile?.social_links || [], icon: LinkIcon },
    { key: 'travel_ids', label: 'Viajes', items: profile?.viajes || [], icon: Plane },
    { key: 'hobbies_ids', label: 'Pasatiempos', items: profile?.hobbies || [], icon: Heart },
    { key: 'interests_ids', label: 'Intereses', items: profile?.intereses || [], icon: Coffee }
  ];

  return (
    <div className="space-y-6 animate-in fade-in">
      {sections.map(section => (
        <div key={section.key} className="bg-white p-6 md:p-8 rounded-xl border border-gray-200 shadow-sm">
          <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <section.icon className="w-5 h-5 text-[#0a66c2]" />
            {section.label}
          </h4>
          {section.items.length === 0 ? (
            <p className="text-sm text-gray-400 italic">No hay elementos en esta categoría</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {section.items.map((item) => {
                const itemId = item.id;
                const isSelected = config[section.key].includes(itemId);
                return (
                  <button
                    key={itemId}
                    onClick={() => toggleItem(section.key, itemId)}
                    className={`text-left p-3 rounded-lg border transition-all text-sm
                      ${isSelected 
                        ? 'bg-[#0a66c2] text-white border-[#0a66c2]' 
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                  >
                    <div className="font-medium">{item.job_title || item.institution_name || item.idioma || item.label}</div>
                    {item.company_name && <div className="text-xs opacity-75">{item.company_name}</div>}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ))}

      {/* Botón Guardar */}
      <div className="flex items-center justify-between">
        <div>
          {saved && (
            <span className="text-sm text-green-600 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Configuración guardada
            </span>
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-[#0a66c2] text-white rounded-full font-bold hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <SaveIcon className="w-4 h-4" />}
          {saving ? 'Guardando...' : 'Guardar Escaparate'}
        </button>
      </div>
    </div>
  );
}

// Iconos que no están en lucide-react o personalizados
function Briefcase(props) { return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>; }
function GraduationCap(props) { return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5a3 3 0 0 0 6 0v-5"/></svg>; }
function Plane(props) { return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.8 19.7a2 2 0 0 1-1.8-.2l4-3.5a2 2 0 0 0-1.1-3V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v7a2 2 0 0 0 1.1 3l4 3.5a2 2 0 0 0 1.8.2z"/><path d="M2 12h20"/></svg>; }
function LinkIcon(props) { return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-3 3a5 5 0 0 0 7.07 7.07z"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 7.07 7.07l3-3a5 5 0 0 0-7.07-7.07z"/></svg>; }
function CheckCircle2(props) { return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/></svg>; }
function SaveIcon(props) { return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 7"/></svg>; }
function Loader2(props) { return <svg {...props} className={`animate-spin ${props.className || ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-9-9 9 9 0 0 1 9 9z"/><path d="M21 3v6h-6"/></svg>; }
