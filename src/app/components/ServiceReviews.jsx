import React, { useState } from 'react';
import { Star, X, Send } from 'lucide-react';
import { ServiceReview } from '../data/types';

interface ServiceReviewsProps {
  serviceId: number;
  professionalId: number;
  reviews: ServiceReview[];
  avgRating: number;
  totalReviews: number;
  canReview?: boolean;
  onAddReview?: (rating: number, comentario: string) => void;
}

export function ServiceReviews({ 
  serviceId, 
  professionalId, 
  reviews, 
  avgRating, 
  totalReviews,
  canReview = false,
  onAddReview 
}: ServiceReviewsProps) {
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comentario, setComentario] = useState('');
  const [hoverRating, setHoverRating] = useState(0);

  const handleSubmit = () => {
    if (!comentario.trim()) {
      alert('Por favor escribe un comentario');
      return;
    }
    onAddReview?.(rating, comentario);
    setShowForm(false);
    setComentario('');
    setRating(5);
  };

  return (
    <div className="space-y-6">
      {/* Header con rating promedio */}
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
          Reseñas del Servicio
        </h4>
        {canReview && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-[#0a66c2] text-white rounded-full text-sm font-bold hover:bg-blue-700 transition-colors"
          >
            Escribir Reseña
          </button>
        )}
      </div>

      {/* Rating promedio */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-5xl font-black text-gray-900">{avgRating.toFixed(1)}</div>
            <div className="flex justify-center mt-1">
              {[1, 2, 3, 4, 5].map(i => (
                <Star 
                  key={i} 
                  className={`w-4 h-4 ${i <= Math.round(avgRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} 
                />
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">{totalReviews} reseñas</p>
          </div>

          <div className="flex-1 space-y-2">
            {[5, 4, 3, 2, 1].map(star => {
              const count = reviews.filter(r => Math.round(r.rating) === star).length;
              const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-xs text-gray-600 w-3">{star}</span>
                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-yellow-400 rounded-full" 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 w-6">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Formulario de reseña */}
      {showForm && (
        <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 space-y-4">
          <div className="flex items-center justify-between">
            <h5 className="font-bold text-gray-900">Escribir Reseña</h5>
            <button onClick={() => setShowForm(false)} className="p-1 hover:bg-blue-100 rounded">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Tu calificación</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(i => (
                <button
                  key={i}
                  onClick={() => setRating(i)}
                  onMouseEnter={() => setHoverRating(i)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1"
                >
                  <Star 
                    className={`w-8 h-8 transition-colors ${
                      i <= (hoverRating || rating) 
                        ? 'text-yellow-400 fill-yellow-400' 
                        : 'text-gray-300'
                    }`} 
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Comentario</label>
            <textarea
              value={comentario}
              onChange={e => setComentario(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:border-blue-500 resize-none text-sm"
              placeholder="Cuéntanos tu experiencia con este servicio..."
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-[#0a66c2] text-white rounded-full font-bold text-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Enviar Reseña
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-full font-medium text-sm hover:bg-white transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Lista de reseñas */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Star className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="font-medium">Aún no hay reseñas para este servicio</p>
            <p className="text-sm">¡Sé el primero en dejar tu opinión!</p>
          </div>
        ) : (
          reviews.map((rev, idx) => (
            <div key={idx} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:border-gray-300 transition-colors">
              <div className="flex items-start gap-3 mb-3">
                <img 
                  src={rev.usuario?.foto || `https://ui-avatars.com/api/?name=${rev.usuario?.nombre || 'Usuario'}&background=random`} 
                  className="w-10 h-10 rounded-full object-cover" 
                  alt="" 
                />
                <div className="flex-1">
                  <p className="font-bold text-sm text-gray-900">
                    {rev.usuario?.nombre} {rev.usuario?.apellido}
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map(i => (
                        <Star 
                          key={i} 
                          className={`w-3.5 h-3.5 ${i <= rev.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} 
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(rev.created_at).toLocaleDateString('es-ES', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                </div>
              </div>
              {rev.comentario && (
                <p className="text-sm text-gray-600 leading-relaxed italic">"{rev.comentario}"</p>
              )}
              {rev.entregables_cumplidos && (
                <div className="flex items-center gap-1 mt-3 text-xs text-green-600">
                  <div className="w-4 h-4 bg-green-50 rounded-full flex items-center justify-center">✓</div>
                  Entregables cumplidos
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
