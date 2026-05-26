import React, { useState, useEffect } from 'react';
import { Star, X, Pencil, Save, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useSystem } from '../data/SystemContext';

export function ProfessionalReviewsModal({ profile, onClose }) {
   const { activeContext } = useSystem();
   const [reviewsData, setReviewsData] = useState({ reviews: [], average: 0, total: 0 });
   const [loading, setLoading] = useState(true);
   const [isWritingReview, setIsWritingReview] = useState(false);
   const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
   const [submittingReview, setSubmittingReview] = useState(false);

   const profileId = profile?.user_id || profile?.id;
   const profileName = profile?.user_name || profile?.usuario_principal?.nombre || 'Usuario';

   useEffect(() => {
      cargarResenas();
   }, [profileId]);

   const cargarResenas = async () => {
      setLoading(true);
      try {
         const res = await axios.post('https://apibolsaprofesionales.hitpoly.com/ajax/reviewController.php', {
            accion: 'getReviews',
            professional_id: profileId
         });
         

         
         if (res.data.success) {
            setReviewsData(res.data.data);
         }
      } catch (e) { 
          console.error(e);
      } finally {
          setLoading(false);
      }
   };

   const handleSaveReview = async () => {
      if (!activeContext) {
         alert("Debes iniciar sesión para dejar una reseña.");
         return;
      }
      if (!newReview.comment.trim()) {
         alert("Por favor escribe un comentario");
         return;
      }
      
      const isEnterprise = activeContext?.type === 'enterprise';
      const rName = isEnterprise ? (activeContext?.nombre || activeContext?.company_name) : (activeContext?.name || activeContext?.nombre || 'Usuario');
      
      // Prioridad máxima para custom_avatar en perfiles personales
      const rAvatar = isEnterprise 
         ? (activeContext?.logo_url || activeContext?.logo || activeContext?.foto) 
         : (activeContext?.custom_avatar || activeContext?.avatar || activeContext?.foto || activeContext?.user_image || '');



      const payload = {
         accion: 'saveReview',
         professional_id: profileId,
         reviewer_id: activeContext?.user_id || activeContext?.id,
         reviewer_type: activeContext?.type || 'professional',
         reviewer_name: rName,
         reviewer_avatar: rAvatar,
         // Campos extra para redundancia en el backend
         tipo: activeContext?.type,
         nombre_capturado: rName,
         avatar_capturado: rAvatar,
         rating: newReview.rating,
         comment: newReview.comment
      };



      setSubmittingReview(true);
      try {
         const res = await axios.post('https://apibolsaprofesionales.hitpoly.com/ajax/reviewController.php', payload);
         if (res.data.success) {
            setIsWritingReview(false);
            setNewReview({ rating: 5, comment: '' });
            cargarResenas();
         } else {
            alert(res.data.error || "Error al guardar la reseña");
         }
      } catch (e) {
         alert("Error de conexión al guardar la reseña");
      } finally {
         setSubmittingReview(false);
      }
   };
   const getAvatarUrl = (avatar, name) => {
      if (!avatar) return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
      if (avatar.startsWith('http') || avatar.startsWith('data:')) return avatar;
      // Si es un nombre de archivo, asumimos la ruta por defecto del holding
      return `https://hitpoly.com/assets/img/perfil/${avatar}`;
   };

   return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={onClose}>
         <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] md:max-h-[80vh] overflow-hidden shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-50 rounded-lg text-yellow-600"><Star className="w-6 h-6 fill-current" /></div>
                  <div>
                     <h3 className="text-xl font-bold text-gray-900">Reseñas de {profileName}</h3>
                     <p className="text-xs text-gray-500 font-medium">Promedio: {reviewsData.average} ★ ({reviewsData.total} reseñas)</p>
                  </div>
               </div>
               <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X className="w-6 h-6" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar-subtle">
               {loading ? (
                   <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>
               ) : isWritingReview ? (
                  <div className="animate-in slide-in-from-bottom-4 duration-300 space-y-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                     <div className="text-center space-y-2">
                        <h4 className="font-bold text-gray-900">Tu opinión es importante</h4>
                        <p className="text-sm text-gray-500">¿Cómo fue tu experiencia trabajando con {profileName}?</p>
                     </div>

                     <div className="flex justify-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                           <button
                              key={star}
                              onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                              className="p-1 transition-transform hover:scale-125"
                           >
                              <Star className={`w-10 h-10 ${star <= newReview.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />
                           </button>
                        ))}
                     </div>

                     <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Comentario</label>
                        <textarea
                           value={newReview.comment}
                           onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                           placeholder="Cuéntanos más sobre el servicio, profesionalismo y resultados..."
                           className="w-full h-32 p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none resize-none text-sm transition-all"
                        />
                     </div>

                     <div className="flex gap-3">
                        <button
                           onClick={() => setIsWritingReview(false)}
                           className="flex-1 py-3 border border-gray-300 text-gray-600 font-bold rounded-xl hover:bg-white transition-all"
                        >
                           Cancelar
                        </button>
                        <button
                           onClick={handleSaveReview}
                           disabled={submittingReview || !newReview.comment.trim()}
                           className="flex-[2] py-3 bg-yellow-500 text-white font-bold rounded-xl hover:bg-yellow-600 transition-all shadow-lg shadow-yellow-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                           {submittingReview ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                           Publicar Reseña
                        </button>
                     </div>
                  </div>
               ) : reviewsData.reviews.length > 0 ? (
                  reviewsData.reviews.map((r, idx) => (
                     <div key={idx} className="p-4 rounded-xl border border-gray-100 bg-gray-50/30 space-y-3">
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-3">
                              <img 
                                 src={getAvatarUrl(r.reviewer_avatar, r.reviewer_name)} 
                                 className="w-10 h-10 rounded-full border-2 border-white shadow-sm object-cover" 
                                 alt="" 
                              />
                              <div>
                                 <p className="text-sm font-bold text-gray-900">{r.reviewer_name}</p>
                                 <div className="flex text-yellow-400">
                                    {[...Array(5)].map((_, i) => (
                                       <Star key={i} className={`w-3 h-3 ${i < r.rating ? 'fill-current' : 'text-gray-200'}`} />
                                    ))}
                                 </div>
                              </div>
                           </div>
                           <span className="text-[10px] text-gray-400 font-medium">{new Date(r.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-gray-600 italic leading-relaxed">"{r.comment}"</p>
                      </div>
                  ))
               ) : (
                  <div className="py-20 text-center space-y-4">
                     <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-300"><Star className="w-8 h-8" /></div>
                     <p className="text-gray-500 font-medium">Aún no hay reseñas para este profesional.</p>
                     {activeContext && (
                        <button 
                           onClick={() => setIsWritingReview(true)}
                           className="px-6 py-3 bg-white border-2 border-yellow-500 text-yellow-600 font-bold rounded-xl hover:bg-yellow-50 transition-all flex items-center gap-2 mx-auto"
                        >
                           <Pencil className="w-5 h-5" /> Sé el primero en dejar una reseña
                        </button>
                     )}
                  </div>
               )}
            </div>

            {!isWritingReview && reviewsData.reviews.length > 0 && activeContext && (
               <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-center">
                  <button 
                     onClick={() => setIsWritingReview(true)}
                     className="w-full max-w-xs py-3 bg-yellow-500 text-white font-bold rounded-xl hover:bg-yellow-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-yellow-100"
                  >
                     <Pencil className="w-5 h-5" /> Dejar reseña
                  </button>
               </div>
            )}
         </div>
      </div>
   );
}
