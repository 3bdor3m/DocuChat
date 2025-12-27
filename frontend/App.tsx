import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense, useEffect } from 'react';
import Loading from './components/Loading';
import { AuthProvider } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import { ToastProvider } from './context/ToastContext';
import { authService } from './services/authService';
import { socketService } from './services/socketService';
import { ErrorBoundary } from './components/ErrorBoundary';

// استخدام lazy لتحميل المكونات عند الحاجة
const Home = lazy(() => import('./pages/Home'));
const Chat = lazy(() => import('./pages/Chat'));
const Pricing = lazy(() => import('./pages/Pricing'));
const Signup = lazy(() => import('./pages/Signup'));
const Login = lazy(() => import('./pages/Login'));
const Account = lazy(() => import('./pages/Account'));
const NotFound = lazy(() => import('./pages/NotFound'));

// مكون الداشبورد الجديد
const UserDashboard = lazy(() => import('./components/UserDashboard')); 

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// مكون ذكي للصفحة الرئيسية
const SmartHome = () => {
  if (authService.isAuthenticated()) {
    return <UserDashboard />;
  }
  return <Home />;
};

// Socket Manager Component
const SocketManager = () => {
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token && authService.isAuthenticated()) {
      socketService.connect(token);
    }

    return () => {
      socketService.disconnect();
    };
  }, []);

  return null;
};

const App = () => {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <ToastProvider>
            <ChatProvider>
              <SocketManager />
              

            <Suspense fallback={<Loading />}>
              <Routes>
                
                <Route path="/" element={<SmartHome />} />

                <Route
                  path="/chat"
                  element={
                    <ProtectedRoute>
                      <Chat />
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <UserDashboard />
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="/account"
                  element={
                    <ProtectedRoute>
                      <Account />
                    </ProtectedRoute>
                  }
                />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/login" element={<Login />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            </ChatProvider>
          </ToastProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
};

export default App;