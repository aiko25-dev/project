import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { loading, user } = useAuth();

  if (loading) {
    return (
      <div className="app-loader-shell">
        <div className="app-loader-card">
          <span className="loader-dot" />
          <p>Жұмыс кеңістігі дайындалып жатыр...</p>
        </div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
