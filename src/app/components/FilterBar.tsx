import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Cargo {
  id: number;
  nombre: string;
}

interface FilterBarProps {
  selectedCargo: number | null;
  onCargoChange: (cargoId: number | null) => void;
  cargos?: Cargo[];
}

export function FilterBar({ selectedCargo, onCargoChange, cargos = [] }: FilterBarProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [cargos]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (scrollRef.current) {
      if (e.deltaY !== 0) {
        scrollRef.current.scrollLeft += e.deltaY;
      }
    }
  };

  return (
    <div className="relative w-full group">
      <style>
        {`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          
          /* Ocultar flechas en dispositivos táctiles o pantallas pequeñas */
          @media (max-width: 768px) {
            .desktop-nav {
              display: none !important;
            }
          }
        `}
      </style>

      {/* Flecha Izquierda (Solo Desktop) */}
      {showLeftArrow && (
        <div className="desktop-nav absolute left-0 top-0 bottom-0 z-10 flex items-center pr-12 bg-gradient-to-r from-white via-white to-transparent">
          <button
            onClick={() => scroll('left')}
            className="p-2 bg-white border border-gray-100 rounded-full shadow-lg hover:bg-gray-50 transition-all text-gray-600"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Contenedor de Filtros */}
      <div 
        ref={scrollRef}
        onScroll={checkScroll}
        onWheel={handleWheel}
        className="flex flex-nowrap gap-2 overflow-x-auto py-2 scrollbar-hide select-none"
        style={{
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        <button
          onClick={() => onCargoChange(null)}
          className={`flex-none px-4 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap border ${
            selectedCargo === null
              ? 'bg-[#057642] text-white border-[#057642]'
              : 'bg-white text-gray-600 border-gray-400 hover:bg-gray-50'
          }`}
        >
          Todos
        </button>
        
        {cargos.map((cargo) => (
          <button
            key={cargo.id}
            onClick={() => onCargoChange(cargo.id)}
            className={`flex-none px-4 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap border ${
              selectedCargo === cargo.id
                ? 'bg-[#057642] text-white border-[#057642]'
                : 'bg-white text-gray-600 border-gray-400 hover:bg-gray-50'
            }`}
          >
            {cargo.nombre}
          </button>
        ))}
      </div>

      {/* Flecha Derecha (Solo Desktop) */}
      {showRightArrow && (
        <div className="desktop-nav absolute right-0 top-0 bottom-0 z-10 flex items-center pl-12 bg-gradient-to-l from-white via-white to-transparent">
          <button
            onClick={() => scroll('right')}
            className="p-2 bg-white border border-gray-100 rounded-full shadow-lg hover:bg-gray-50 transition-all text-gray-600"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
