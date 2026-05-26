import { RouterProvider } from 'react-router';
import { router } from './routes';
// import { SessionTracker } from './components/SessionTracker'; // Not used currently
import { SystemProvider } from './data/SystemContext';
import { AuthProvider } from './context/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <SystemProvider>
        <RouterProvider router={router} />
      </SystemProvider>
    </AuthProvider>
  );
}