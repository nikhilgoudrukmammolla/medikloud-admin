import  { useState } from 'react';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import AuthGuard from './components/AuthGuard';


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  return (
    <div className=" text-white p-4">
      {!isAuthenticated ? (
        <Login onLoginSuccess={handleLoginSuccess} />
      ) : (
        <AuthGuard onLogout={handleLogout}>
          <Dashboard />
        </AuthGuard>
      )}
    </div>
  );
}

export default App;
