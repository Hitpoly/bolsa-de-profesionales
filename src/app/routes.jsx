import { createBrowserRouter, useRouteError } from "react-router";
import { MarketplacePage } from "./pages/Marketplace/MarketplacePage";
import { ProfileDetail } from "./pages/ProfileDetail";
import { ServiceDetail } from "./pages/ServiceDetail";
import { ServiceEditor } from "./pages/ServiceEditor";
import { ProfessionalEditorPage } from "./pages/ProfessionalEditor";
import { CompanyEditorPage } from "./pages/CompanyEditor";
import { CompanyProfileDetail } from "./pages/CompanyProfileDetail";
import { CompanyAdsPage } from "./pages/CompanyAdsPage";
import { MainLayout } from "./components/MainLayout";
import { AlertCircle, Home } from 'lucide-react';

import { JobAdDetail } from "./pages/JobAdDetail";
import { ApplicationForm } from "./pages/Applications/ApplicationForm";
import { ApplicationsPanel } from "./pages/Applications/ApplicationsPanel";
import { ApplicationDetail } from "./pages/Applications/ApplicationDetail";

function ErrorBoundary() {
  const error = useRouteError();
  console.error(error);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-['Inter']">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-10 text-center border border-gray-100">
        <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-8">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-3xl font-black text-gray-900 mb-4">¡Ups! Algo salió mal</h1>
        <p className="text-gray-500 font-medium mb-10 leading-relaxed">
          {error.status === 404 
            ? "Parece que la página que buscas no existe o ha sido movida." 
            : "Ha ocurrido un error inesperado. Estamos trabajando para solucionarlo."}
        </p>
        <button
          onClick={() => window.location.href = '/systems/bolsa'}
          className="w-full py-4 bg-[#0a66c2] text-white rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
        >
          <Home className="w-5 h-5" /> VOLVER AL INICIO
        </button>
      </div>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: "/editar-servicio/:serviceId",
    element: <ServiceEditor />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/editar-servicio-empresa/:serviceId",
    element: <ServiceEditor />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/crear-servicio/:tipo",
    element: <ServiceEditor />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/crear-servicio-empresa",
    element: <ServiceEditor />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/",
    element: <MainLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        path: "/",
        element: <MarketplacePage />,
      },
      {
        path: "/anuncio/:adId",
        element: <JobAdDetail />,
      },
      {
        path: "/postularme/:adId",
        element: <ApplicationForm />,
      },
      {
        path: "/mis-postulaciones",
        element: <ApplicationsPanel />,
      },
      {
        path: "/postulacion/:id",
        element: <ApplicationDetail />,
      },
      {
        path: "/perfil/:userId",
        element: <ProfileDetail />,
      },
      {
        path: "/servicio/:serviceId",
        element: <ServiceDetail />,
      },
      {
        path: "/empresa/:companyId",
        element: <CompanyProfileDetail />,
      },
      {
        path: "/empresa/:companyId/vacantes",
        element: <CompanyAdsPage />,
      },

      {
        path: "/editar-perfil",
        element: <ProfessionalEditorPage />,
      },
      {
        path: "/editar-empresa",
        element: <CompanyEditorPage />,
      },
    ],
  },
], {
  // Configuración de basename para soportar el despliegue en subcarpetas (Holding)
  basename: window.location.pathname.includes('/systems/bolsa') ? '/systems/bolsa' : '/'
});