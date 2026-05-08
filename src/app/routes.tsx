import { createBrowserRouter } from "react-router";
import { Marketplace } from "./pages/Marketplace";
import { ProfileDetail } from "./pages/ProfileDetail";
import { MainLayout } from "./components/MainLayout";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        path: "/",
        Component: Marketplace,
      },
      {
        path: "/perfil/:userId",
        Component: ProfileDetail,
      },
    ],
  },
]);
