import React from "react";

/**
 * SampleComponent
 *
 * A simple functional component written in JSX that demonstrates the
 * configuration is working. It renders a heading and a button that shows
 * an alert when clicked.
 */
export default function SampleComponent() {
  const handleClick = () => {
    alert("¡Componente JSX funcionando!");
  };

  return (
    <div className="p-4 bg-gray-100 rounded-md">
      <h2 className="text-xl font-bold mb-2">Componente de ejemplo</h2>
      <button
        onClick={handleClick}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Haz clic aquí
      </button>
    </div>
  );
}
