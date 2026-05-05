import { cargosDisponibles } from '../data/mockProfiles';

interface FilterBarProps {
  selectedCargo: number | null;
  onCargoChange: (cargoId: number | null) => void;
}

export function FilterBar({ selectedCargo, onCargoChange }: FilterBarProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onCargoChange(null)}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
          selectedCargo === null
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        Todos
      </button>
      
      {cargosDisponibles.map((cargo) => (
        <button
          key={cargo.id}
          onClick={() => onCargoChange(cargo.id)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            selectedCargo === cargo.id
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {cargo.name}
        </button>
      ))}
    </div>
  );
}
