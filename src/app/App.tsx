import { RouterProvider } from 'react-router';
import { router } from './routes';
import { SessionTracker } from './components/SessionTracker';
import { SystemProvider } from './data/SystemContext';

export default function App() {
  return (
    <SystemProvider>
      <RouterProvider router={router} />
    </SystemProvider>
  );
}