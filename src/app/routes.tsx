import { createBrowserRouter } from "react-router";
import { Marketplace } from "./pages/Marketplace";
import { ProfileDetail } from "./pages/ProfileDetail";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Marketplace,
  },
  {
    path: "/perfil/:userId",
    Component: ProfileDetail,
  },
]);
