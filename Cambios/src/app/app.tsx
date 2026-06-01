import { AnimatePresence } from 'framer-motion';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Routes from './routes/Routes';
import AuthProvider from './auth/provider/authProvider';
import UserProvider from './core/feature-user/provider/userProvider';
import { ToastContainer } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // default: true
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <UserProvider>
          <AnimatePresence mode="wait">
            <Routes key="routes" />
            <ToastContainer key="toast" autoClose={5000} theme="dark" />
          </AnimatePresence>
        </UserProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
