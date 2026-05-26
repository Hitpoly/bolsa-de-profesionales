import React, { useState } from 'react';
import { X, ShoppingCart, Clock, Calendar } from 'lucide-react';
import { Service } from '../data/types';

interface ServiceCheckoutModalProps {
  service: Service;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (orderData: {
    horas?: number;
    fecha_entrega?: string;
    notas?: string;
  }) => void;
}

export function ServiceCheckoutModal({ service, isOpen, onClose, onConfirm }: ServiceCheckoutModalProps) {
  const [horas, setHoras] = useState<number | ''>('');
  const [fechaEntrega, setFechaEntrega] = useState('');
  const [notas, setNotas] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const precioFinal = service.precio_oferta || service.precio_base;
  const total = service.tipo === 'hora' && horas 
    ? precioFinal * horas 
    : precioFinal;

  const handleConfirm = () => {
    if (service.tipo === 'hora' && !horas) {
      alert('Por favor especifica la cantidad de horas');
      return;
    }
    if (service.tipo === 'proyecto' && !fechaEntrega) {
      alert('Por favor selecciona una fecha de entrega deseada');
      return;
    }

    setLoading(true);
    onConfirm({
      horas: service.tipo === 'hora' ? Number(horas) : undefined,
      fecha_entrega: service.tipo === 'proyecto' ? fechaEntrega : undefined,
      notas: notas || undefined
    });
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[30000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-900">Confirmar Compra</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Resumen del servicio */}
          <div className="bg-gray-50 p-4 rounded-xl">
            <div className="flex items-start gap-3 mb-3">
              {service.imagen ? (
                <img src={service.imagen} alt={service.titulo} className="w-16 h-16 rounded-lg object-cover" />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="w-8 h-8 text-white" />
                </div>
              )}
              <div className="flex-1">
                <h4 className="font-bold text-gray-900">{service.titulo}</h4>
                {service.subtitulo && (
                  <p className="text-sm text-gray-600">{service.subtitulo}</p>
                )}
                <span className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-bold uppercase rounded ${service.tipo === 'hora' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'}`}>
                  {service.tipo === 'hora' ? 'Por Hora' : 'Proyecto Cerrado'}
                </span>
              </div>
            </div>
          </div>

          {/* Campos adicionales */}
          {service.tipo === 'hora' && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">¿Cuántas horas necesitas?</label>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {[1, 2, 5, 10, 20, 40, 80].map(h => (
                  <button
                    key={h}
                    onClick={() => setHoras(h)}
                    className={`py-2 rounded-lg text-sm font-medium transition-colors
                      ${horas === h 
                        ? 'bg-[#0a66c2] text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    {h}h
                  </button>
                ))}
                <input
                  type="number"
                  value={horas}
                  onChange={e => setHoras(parseFloat(e.target.value) || '')}
                  placeholder="Otra"
                  className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg text-sm text-center focus:outline-none focus:border-blue-500"
                  min="0.5"
                  step="0.5"
                />
              </div>
              {horas > 0 && (
                <p className="text-sm text-gray-500">
                  {service.moneda} {Number(precioFinal).toFixed(0)} × {horas}h = 
                  <span className="font-bold text-gray-900">{service.moneda} {Number(precioFinal * horas).toFixed(0)}</span>
                </p>
              )}
            </div>
          )}

          {service.tipo === 'proyecto' && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Fecha de entrega deseada
              </label>
              <input
                type="date"
                value={fechaEntrega}
                onChange={e => setFechaEntrega(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Notas adicionales (opcional)</label>
            <textarea
              value={notas}
              onChange={e => setNotas(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 resize-none text-sm"
              placeholder="Describe cualquier detalle adicional que el profesional deba conocer..."
            />
          </div>

          {/* Garantías */}
          <div className="bg-green-50 p-4 rounded-xl border border-green-100">
            <div className="flex items-start gap-2">
              <Clock className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-green-900">Tiempo de respuesta: {service.tiempo_respuesta || '24 horas'}</p>
                {service.garantia_dias > 0 && (
                  <p className="text-xs text-green-700 mt-1">{service.garantia_dias} días de garantía incluídos</p>
                )}
                <p className="text-xs text-green-700">Protección Hitpoly: Tu pago está seguro</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer con total y botón */}
        <div className="p-6 border-t border-gray-100 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Total a pagar</span>
            <span className="text-2xl font-black text-gray-900">
              {service.moneda} {Number(total).toFixed(0)}
              {service.tipo === 'hora' && <span className="text-sm font-normal text-gray-500"> / {horas || 0}h</span>}
            </span>
          </div>

          <button
            onClick={handleConfirm}
            disabled={loading || (service.tipo === 'hora' && !horas) || (service.tipo === 'proyecto' && !fechaEntrega)}
            className="w-full py-3 bg-[#0a66c2] text-white rounded-full font-bold text-sm hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200 disabled:opacity-50"
          >
            <ShoppingCart className="w-4 h-4" />
            {loading ? 'Procesando...' : `Confirmar y Pagar ${service.moneda} ${Number(total).toFixed(0)}`}
          </button>

          <p className="text-[10px] text-gray-400 text-center">
            Al confirmar, aceptas los términos de servicio de Hitpoly
          </p>
        </div>
      </div>
    </div>
  );
}
