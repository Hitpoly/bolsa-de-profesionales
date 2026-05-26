import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Save, User, Globe, BookOpen, Languages, Heart, History, Info, Camera, Image as ImageIcon, Upload, Eye, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useSystem } from '../../data/SystemContext';
import { useNavigate } from 'react-router';
import { uploadToImageKit } from '../../services/imageKitService';

const API_HOLDING = 'https://apibolsaprofesionales.hitpoly.com/ajax/bolsaController.php';

const CustomSpecialtySelect = ({ value, icon, options, onChange, onCustomSelect }) => {
  const [open, setOpen] = useState(false);
  const selectRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (selectRef.current && !selectRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayLabel = value || "Selecciona tu especialidad...";

  return (
    <div className="relative group w-full" ref={selectRef}>
      <div 
        className="w-full flex items-center justify-between px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 cursor-pointer focus:border-blue-500"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          {icon ? (
            icon.startsWith('<svg') ? (
              <div className="w-5 h-5 text-gray-500 flex-shrink-0" dangerouslySetInnerHTML={{ __html: icon }} />
            ) : (
              <img src={icon} className="w-5 h-5 object-contain flex-shrink-0" alt="" />
            )
          ) : (
             <div className="w-5 h-5 flex-shrink-0" />
          )}
          <span className="truncate">{displayLabel}</span>
        </div>
        <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      
      {open && (
        <div className="absolute top-full mt-1 left-0 w-full z-50 max-h-60 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg">
          {options.map(item => (
            <div 
              key={item.id}
              className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => { onChange(item.nombre, item.icono); setOpen(false); }}
            >
              {item.icono && item.icono.startsWith('<svg') ? (
                 <div className="w-5 h-5 text-gray-500 flex-shrink-0" dangerouslySetInnerHTML={{ __html: item.icono }} />
              ) : (
                 <div className="w-5 h-5 bg-gray-100 rounded flex-shrink-0" />
              )}
              <span className="text-sm text-gray-700 truncate">{item.nombre}</span>
            </div>
          ))}
          <div 
            className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors border-t border-gray-100"
            onClick={() => { onCustomSelect(); setOpen(false); }}
          >
            <div className="w-5 h-5 flex items-center justify-center text-gray-400 font-bold flex-shrink-0">+</div>
            <span className="text-sm text-gray-700 truncate">Otra (Personalizada)</span>
          </div>
        </div>
      )}
    </div>
  );
};

export function ProfessionalForm({ profile, userId, saveRef, onSavingChange, onSavedChange }) {
  const { setHeaderData, setMobileActions } = useSystem();
  const navigate = useNavigate();

  useEffect(() => {
    setHeaderData({
      title: 'Editor de Perfil',
      subtitle: 'Gestiona tu información profesional',
      icon: 'user',
      color: '#0a66c2'
    });

    window.bolsaBackHandler = () => {
      const suffix = userId ? `?userId=${userId}` : '';
      navigate(`/${suffix}`);
    };

    return () => {
      window.bolsaBackHandler = null;
    };
  }, [setHeaderData, userId, navigate]);
  const [formData, setFormData] = useState({
    bio: '',
    specialization: '',
    experience_years: '',
    availability: '',
    skills: '',
    specialization_icon: ''
  });
  
  const [especialidadesMaestro, setEspecialidadesMaestro] = useState([]);
  const [showCustomSpec, setShowCustomSpec] = useState(false);

  const [showcaseConfig, setShowcaseConfig] = useState({
    sobre_mi_ids: [],
    experience_ids: [],
    employment_ids: [],
    education_ids: [],
    languages_ids: [],
    links_ids: [],
    travel_ids: [],
    hobbies_ids: [],
    interests_ids: []
  });

    const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [uploadingImage, setUploadingImage] = useState(null); // 'avatar' | 'banner' | 'icon' | null

  const handleBannerChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log(`[ProfessionalEditor] 🖼️ Iniciando carga de Banner. Archivo: "${file.name}", Tamaño: ${file.size} bytes`);
      
      // Vista previa instantánea local
      const localUrl = URL.createObjectURL(file);
      setBannerPreview(localUrl);
      
      setUploadingImage('banner');
      try {
        console.log(`[ProfessionalEditor] Llamando a uploadToImageKit para Banner...`);
        const url = await uploadToImageKit(file, userId, `/bolsa/profiles/${userId}`);
        console.log(`[ProfessionalEditor] ✅ Banner subido exitosamente. URL: ${url}`);
        setBannerPreview(url);
      } catch (e) {
        console.error(`[ProfessionalEditor] ❌ Error subiendo Banner:`, e);
        alert('Error al subir el banner. Revisa la consola para más detalles.');
        setBannerPreview(''); // Revertir vista previa falsa
      } finally {
        setUploadingImage(null);
      }
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log(`[ProfessionalEditor] 🖼️ Iniciando carga de Avatar. Archivo: "${file.name}", Tamaño: ${file.size} bytes`);
      
      // Vista previa instantánea local
      const localUrl = URL.createObjectURL(file);
      setAvatarPreview(localUrl);
      
      setUploadingImage('avatar');
      try {
        console.log(`[ProfessionalEditor] Llamando a uploadToImageKit para Avatar...`);
        const url = await uploadToImageKit(file, userId, `/bolsa/avatars/${userId}`);
        console.log(`[ProfessionalEditor] ✅ Avatar subido exitosamente. URL: ${url}`);
        setAvatarPreview(url);
      } catch (e) {
        console.error(`[ProfessionalEditor] ❌ Error subiendo Avatar:`, e);
        alert('Error al subir el avatar. Revisa la consola para más detalles.');
        setAvatarPreview(''); // Revertir vista previa falsa
      } finally {
        setUploadingImage(null);
      }
    }
  };
  const [marketText, setMarketText] = useState('');
  const [marketsList, setMarketsList] = useState([]);

  const [skillText, setSkillText] = useState('');
  const [skillsList, setSkillsList] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Sincronizar estado cuando el perfil cargue
  useEffect(() => {
    if (profile) {
      const bolsa = profile?.bolsa_data || profile;
      
      setFormData({
        bio: bolsa?.bio ?? profile?.sobre_mi?.about_text ?? '',
        specialization: bolsa?.specialization ?? profile?.usuario_principal?.nombre_cargo ?? '',
        experience_years: bolsa?.experience_years ?? '',
        availability: bolsa?.availability ?? '',
        skills: bolsa?.skills ?? ''
      });

      // Inicializar banners y avatars (prioridad a los de la bolsa)
      const existingAvatar = bolsa?.custom_avatar || profile?.user_photo || profile?.usuario_principal?.foto || profile?.usuario_principal?.avatar || '';
      const existingBanner = bolsa?.custom_banner || profile?.perfil_general?.cover_photo || '';
      
      if (existingAvatar) setAvatarPreview(existingAvatar);
      if (existingBanner) setBannerPreview(existingBanner);

      // Parseo showcase_config — manejar string u objeto
      try {
        const raw = bolsa?.showcase_config;
        let sc = {};
        if (raw) {
          sc = typeof raw === 'string' ? JSON.parse(raw) : raw;
        }
        // Normalizar IDs a string para comparación consistente con item.id
        const norm = (arr) => (arr || []).map(v => typeof v === 'number' ? v : String(v));
        setShowcaseConfig({
          sobre_mi_ids:   norm(sc.sobre_mi_ids),
          experience_ids: norm(sc.experience_ids),
          employment_ids: norm(sc.employment_ids),
          education_ids:  norm(sc.education_ids),
          languages_ids:  norm(sc.languages_ids),
          links_ids:      norm(sc.links_ids),
          travel_ids:     norm(sc.travel_ids),
          hobbies_ids:    norm(sc.hobbies_ids),
          interests_ids:  norm(sc.interests_ids),
          specialization_icon: sc.specialization_icon || ''
        });
        
        // Cargar especialidades maestro
        axios.post('https://apibolsaprofesionales.hitpoly.com/ajax/bolsaController.php', { accion: 'getEspecialidadesMaestro' })
          .then(res => {
            if (res.data.success) {
              setEspecialidadesMaestro(res.data.data);
              // Si la especialidad actual no está en la lista maestra, mostrar el input custom
              if (bolsa?.specialization && !res.data.data.some(e => e.nombre === bolsa.specialization)) {
                setShowCustomSpec(true);
              }
            }
          }).catch(console.error);

      } catch(e) { 
        console.error('[ProfessionalForm] Error parseando showcase_config:', e);
        setShowcaseConfig({ sobre_mi_ids:[], experience_ids:[], employment_ids:[], education_ids:[], languages_ids:[], links_ids:[], travel_ids:[], hobbies_ids:[], interests_ids:[], specialization_icon: '' }); 
      }

      // Parseo de Habilidades
      const rawSkills = bolsa?.skills;
      if (Array.isArray(rawSkills)) {
        setSkillsList(rawSkills.map((s) => typeof s === 'object' ? (s.nombre || '') : String(s)).filter(Boolean));
      } else if (typeof rawSkills === 'string') {
        try {
          const parsed = JSON.parse(rawSkills);
          if (Array.isArray(parsed)) {
            setSkillsList(parsed.map((s) => typeof s === 'object' ? (s.nombre || '') : String(s)).filter(Boolean));
          } else {
            setSkillsList([String(parsed)]);
          }
        } catch (e) {
          setSkillsList(rawSkills.split(',').map(s => s.trim()).filter(Boolean));
        }
      }

      // Parseo de Mercados Internacionales (JSON)
      try {
        const parsedMarkets = bolsa?.international_markets ? JSON.parse(bolsa.international_markets) : [];
        setMarketsList(Array.isArray(parsedMarkets) ? parsedMarkets : []);
      } catch (e) {
        setMarketsList(bolsa?.international_markets ? bolsa.international_markets.split(',').map(s => s.trim()).filter(Boolean) : []);
      }
    }
  }, [profile]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    if (onSavingChange) onSavingChange(true);
    try {
      const b = profile?.bolsa_data || {};
      const step_data = {};

      // Solo incluimos campos que realmente han cambiado para ahorrar ancho de banda y carga en BD
      if (formData.bio !== (b.bio || '')) step_data.bio = formData.bio;
      if (formData.specialization !== (b.specialization || '')) step_data.specialization = formData.specialization;
      if (parseInt(formData.experience_years) !== (parseInt(b.experience_years) || 0)) step_data.experience_years = parseInt(formData.experience_years);
      if (formData.availability !== (b.availability || '')) step_data.availability = formData.availability;
      
      const currentSkills = skillsList.join(', ');
      if (currentSkills !== (b.skills || '')) step_data.skills = currentSkills;
      
      const currentMarkets = JSON.stringify(marketsList);
      if (currentMarkets !== (b.international_markets || '[]')) step_data.international_markets = currentMarkets;
      
      const currentConfig = JSON.stringify(showcaseConfig);
      const oldConfig = typeof b.showcase_config === 'string' ? b.showcase_config : JSON.stringify(b.showcase_config || {});
      if (currentConfig !== oldConfig || formData.specialization_icon !== showcaseConfig.specialization_icon) {
        step_data.showcase_config = { ...showcaseConfig, specialization_icon: formData.specialization_icon };
      }

      // CRÍTICO: Solo enviamos las imágenes si son distintas a las actuales
      if (avatarPreview && avatarPreview !== (b.custom_avatar || profile?.user_photo || '')) step_data.custom_avatar = avatarPreview;
      if (bannerPreview && bannerPreview !== (b.custom_banner || '')) step_data.custom_banner = bannerPreview;

      // Si no hay cambios, evitamos la petición al servidor
      if (Object.keys(step_data).length === 0) {
        setSaved(true);
        if (onSavedChange) onSavedChange(true);
        setTimeout(() => { setSaved(false); if (onSavedChange) onSavedChange(false); }, 2000);
        setSaving(false);
        if (onSavingChange) onSavingChange(false);
        return;
      }

      const payload = {
        accion: 'saveStep',
        user_id: userId,
        step_data
      };

      const res = await axios.post(API_HOLDING, payload);

      if (res.data.success) {
        setSaved(true);
        if (onSavedChange) onSavedChange(true);
        setTimeout(() => { setSaved(false); if (onSavedChange) onSavedChange(false); }, 3000);
      } else {
        alert('Error al guardar: ' + (res.data.error || 'Respuesta negativa del servidor'));
      }
    } catch (e) {
      alert('Error de red o servidor al guardar');
    } finally {
      setSaving(false);
      if (onSavingChange) onSavingChange(false);
    }
  }, [profile, formData, userId, skillsList, marketsList, showcaseConfig, avatarPreview, bannerPreview, onSavingChange, onSavedChange]);

  // Registrar handleSave en saveRef para que el toolbar padre lo pueda invocar
  useEffect(() => {
    if (saveRef) saveRef.current = handleSave;
  }, [handleSave, saveRef]);

  // Configurar acciones del encabezado
  useEffect(() => {
    setMobileActions([
      {
        id: 'save-profile',
        title: saving ? 'Guardando...' : 'Guardar',
        icon: saving ? 'loader' : (saved ? 'check' : 'save'),
        onClick: handleSave,
        disabled: saving,
        color: saved ? '#10b981' : '#0a66c2'
      },
      {
        id: 'preview-profile',
        title: 'Ver Perfil',
        icon: 'eye',
        onClick: () => {
          const suffix = userId ? `?userId=${userId}` : '';
          navigate(`/perfil/${userId}${suffix}`);
        },
        color: '#6b7280'
      }
    ]);

    return () => setMobileActions([]);
  }, [saving, saved, handleSave, userId, navigate, setMobileActions]);

  // Toggle de un item individual dentro de una sección
  // Normaliza siempre a string para evitar int vs string mismatch
  const toggleItem = (field, id) => {
    const sid = String(id);
    setShowcaseConfig(prev => {
      const current = (prev[field] || []).map(v => String(v));
      const idx = current.indexOf(sid);
      if (idx >= 0) current.splice(idx, 1); else current.push(sid);
      return { ...prev, [field]: current };
    });
  };

  // Secciones con sus campos de IDs y datos
  const SECCIONES = [
    {
      field: 'sobre_mi_ids', label: 'Sobre mí',
      items: [
        ...(profile?.sobre_mi?.about_text    ? [{ id: 'about_text',       label: '"' + profile.sobre_mi.about_text.substring(0, 55) + (profile.sobre_mi.about_text.length > 55 ? '...' : '') + '"', sub: 'Descripción personal' }] : []),
        ...(profile?.sobre_mi?.favorite_quotes ? [{ id: 'favorite_quotes', label: '"' + profile.sobre_mi.favorite_quotes.substring(0, 55) + (profile.sobre_mi.favorite_quotes.length > 55 ? '...' : '') + '"', sub: 'Cita favorita' }] : [])
      ]
    },
    {
      field: 'experience_ids', label: 'Experiencia Laboral',
      items: (profile?.experiencia_laboral || []).map(i => ({ id: String(i.id), label: i.job_title || 'Puesto', sub: i.company_name }))
    },
    {
      field: 'employment_ids', label: 'Empleos',
      items: (profile?.empleo || []).map(i => ({ id: String(i.id), label: i.job_title || i.nombre || 'Empleo', sub: i.company_name }))
    },
    {
      field: 'education_ids', label: 'Educación',
      items: (profile?.educacion || []).map(i => ({ id: String(i.id), label: i.institution_name || 'Institución', sub: i.degree }))
    },
    {
      field: 'languages_ids', label: 'Idiomas',
      items: (profile?.idiomas_lista || []).map(i => ({ id: String(i.id), label: i.idioma || i.nombre, sub: i.nivel }))
    },
    {
      field: 'links_ids', label: 'Enlaces',
      items: (profile?.links || []).map(i => ({ id: String(i.id), label: i.label || i.url, sub: i.url }))
    },
    {
      field: 'travel_ids', label: 'Viajes',
      items: (profile?.viajes || []).map(i => ({ id: i.id, label: i.location_name || i.pais || i.lugar || 'Destino' }))
    },
    {
      field: 'hobbies_ids', label: 'Pasatiempos',
      items: (profile?.hobbies || []).map(i => ({ id: i.id, label: i.hobby_name || i.nombre || i.hobby }))
    },
    {
      field: 'interests_ids', label: 'Intereses',
      items: (profile?.intereses || []).map(i => ({ id: i.id, label: i.interest_name || i.nombre || i.interes }))
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in">

      {/* ─── INFORMACIÓN PERSONAL ─── */}
      <div className="bg-white p-6 md:p-8 rounded-xl border border-gray-200 shadow-sm">
                <h4 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          <User className="w-5 h-5 text-[#0a66c2]" /> Información Personal
        </h4>
        {/* Banner & Avatar Header */}
        <div className="relative mb-8 group">
          {/* Banner Container */}
          <div className="h-64 md:h-96 w-full rounded-xl bg-gray-100 overflow-hidden relative border border-gray-200 group/banner">
            {uploadingImage === 'banner' && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/60 backdrop-blur-[2px]">
                <Loader2 className="w-10 h-10 text-[#0a66c2] animate-spin mb-2 drop-shadow-md" />
                <span className="text-xs font-bold text-[#0a66c2] bg-white/90 px-4 py-1.5 rounded-full shadow-sm">Subiendo a ImageKit...</span>
              </div>
            )}
            {bannerPreview ? (
              <img src={bannerPreview} alt="Banner" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <ImageIcon className="w-12 h-12" />
              </div>
            )}
            <label className="absolute bottom-4 right-4 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg cursor-pointer transition-all border border-gray-200 z-10">
              <Camera className="w-5 h-5 text-gray-700" />
              <input type="file" className="hidden" accept="image/*" onChange={handleBannerChange} disabled={!!uploadingImage} />
            </label>
          </div>

          {/* Avatar Container */}
          <div className="absolute -bottom-6 left-8 z-30 group/avatar">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white bg-white shadow-xl overflow-hidden relative flex items-center justify-center">
              {uploadingImage === 'avatar' && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/70 backdrop-blur-[2px] rounded-full">
                  <Loader2 className="w-8 h-8 text-[#0a66c2] animate-spin mb-1" />
                  <span className="text-[10px] font-bold text-[#0a66c2] bg-white px-2 py-0.5 rounded-full shadow-sm">Subiendo...</span>
                </div>
              )}
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400">
                  <User className="w-12 h-12" />
                </div>
              )}
              <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 cursor-pointer transition-opacity z-10">
                <Camera className="w-8 h-8 text-white" />
                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} disabled={!!uploadingImage} />
              </label>
            </div>
          </div>
        </div>

        {/* Padding for overlapping avatar */}
        <div className="h-20"></div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Biografía Corta</label>
            <textarea
              value={formData.bio}
              onChange={e => setFormData({ ...formData, bio: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 resize-none"
              placeholder="Resume tu valor profesional..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Especialidad Principal</label>
              <div className="flex flex-col gap-2">
                {!showCustomSpec ? (
                  <CustomSpecialtySelect 
                    value={formData.specialization}
                    icon={formData.specialization_icon}
                    options={especialidadesMaestro}
                    onChange={(nombre, icono) => {
                      setShowCustomSpec(false);
                      setFormData(prev => ({ ...prev, specialization: nombre, specialization_icon: icono || '' }));
                    }}
                    onCustomSelect={() => {
                      setShowCustomSpec(true);
                      setFormData(prev => ({ ...prev, specialization: '', specialization_icon: '' }));
                    }}
                  />
                ) : (
                  <div className="flex gap-2 items-center animate-in slide-in-from-top-1">
                    <div className="relative flex-1 flex items-center">
                      <div className="absolute left-3">
                        {formData.specialization_icon ? (
                          formData.specialization_icon.startsWith('<svg') ? (
                            <div className="w-5 h-5 text-gray-500" dangerouslySetInnerHTML={{ __html: formData.specialization_icon }} />
                          ) : (
                            <img src={formData.specialization_icon} className="w-5 h-5 object-contain" alt="" />
                          )
                        ) : (
                          <div className="w-5 h-5" />
                        )}
                      </div>
                      <input
                        type="text"
                        value={formData.specialization}
                        onChange={e => setFormData({ ...formData, specialization: e.target.value })}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                        placeholder="Ej: Desarrollador Full Stack"
                      />
                    </div>
                    <label className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg cursor-pointer border border-gray-300 transition-colors" title="Subir icono personalizado">
                      {uploadingImage === 'icon' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*,.svg"
                        disabled={uploadingImage === 'icon'}
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setUploadingImage('icon');
                            try {
                              const url = await uploadToImageKit(file, userId, `/bolsa/icons/${userId}`);
                              setFormData(prev => ({ ...prev, specialization_icon: url }));
                            } catch (e) {
                              alert('Error al subir el icono');
                            } finally {
                              setUploadingImage(null);
                            }
                          }
                        }} 
                      />
                    </label>
                    <button 
                      onClick={() => setShowCustomSpec(false)}
                      className="p-2 text-gray-400 hover:text-red-500"
                      title="Cancelar"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Años de Experiencia</label>
              <input
                type="number"
                value={formData.experience_years}
                onChange={e => setFormData({ ...formData, experience_years: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                min="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Disponibilidad</label>
            <select
              value={formData.availability}
              onChange={e => setFormData({ ...formData, availability: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="">Selecciona...</option>
              <option value="Tiempo completo">Tiempo completo</option>
              <option value="Medio tiempo">Medio tiempo</option>
              <option value="Disponibilidad inmediata">Disponibilidad inmediata</option>
              <option value="Freelance">Freelance</option>
            </select>
          </div>

          <div>
            <div className="flex items-center gap-1.5 mb-1 group relative w-fit">
              <label className="block text-sm font-bold text-gray-700">Mercado de Trabajo / Países</label>
              <Info className="w-4 h-4 text-gray-400 hover:text-[#0a66c2] cursor-help transition-colors" />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2.5 bg-gray-900 text-white text-[11px] font-medium rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 text-center leading-relaxed">
                Escribe países separados por comas y presiona Enter para añadirlos como etiquetas.
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900" />
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              {marketsList.map((m, idx) => (
                <span key={idx} className="px-3 py-1 bg-white text-gray-700 rounded-lg text-xs font-bold border border-gray-200 shadow-sm flex items-center gap-2">
                  {m} <button onClick={() => setMarketsList(marketsList.filter((_, i) => i !== idx))} className="text-gray-400 hover:text-red-500 ml-1">×</button>
                </span>
              ))}
            </div>
            <input
              type="text"
              value={marketText}
              onChange={e => setMarketText(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (marketText.trim()) {
                    const newMarkets = marketText.split(',').map(m => m.trim()).filter(m => m && !marketsList.includes(m));
                    if (newMarkets.length > 0) setMarketsList([...marketsList, ...newMarkets]);
                    setMarketText('');
                  }
                }
              }}
              placeholder="Ej: España, Perú, México (Presiona Enter)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Habilidades (Skills)</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {skillsList.map((skill, idx) => (
                <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium flex items-center gap-1">
                  {skill}
                  <button onClick={() => setSkillsList(skillsList.filter((_, i) => i !== idx))} className="hover:text-red-500">×</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={skillText}
                onChange={e => setSkillText(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && skillText.trim()) {
                    setSkillsList([...skillsList, skillText.trim()]);
                    setSkillText('');
                  }
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Agregar habilidad y presionar Enter"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ─── ESCAPARATE PÚBLICO ─── */}
      <div className="bg-white p-6 md:p-8 rounded-xl border border-gray-200 shadow-sm">
        <h4 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
          <Globe className="w-5 h-5 text-[#0a66c2]" /> Escaparate Público
        </h4>
        <p className="text-xs text-gray-500 mb-5">Selecciona qué elementos de tu perfil quieres mostrar en tu tarjeta del buscador.</p>

        <div className="space-y-5">
          {SECCIONES.map(({ field, label, items, isBool }) => (
            <div key={field}>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{label}</p>
              {items.length === 0 ? (
                <p className="text-xs text-gray-400 italic pl-1">Sin datos en esta sección</p>
              ) : (
                <div className="space-y-1.5">
                  {items.map(item => {
                    const isChecked = isBool
                      ? !!showcaseConfig[field]
                      : (showcaseConfig[field] || []).map(v => String(v)).includes(String(item.id));
                    return (
                      <label
                        key={item.id}
                        className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-all ${
                          isChecked ? 'border-[#0a66c2] bg-blue-50' : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="w-4 h-4 accent-[#0a66c2] cursor-pointer shrink-0"
                          checked={isChecked}
                          onChange={() => isBool
                            ? setShowcaseConfig(prev => ({ ...prev, [field]: !prev[field] }))
                            : toggleItem(field, item.id)
                          }
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">{item.label}</p>
                          {item.sub && <p className="text-[11px] text-gray-400 truncate">{item.sub}</p>}
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Botón Guardar - Eliminado porque ahora está en el encabezado */}
    </div>
  );


}
