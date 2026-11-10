import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AuthProvider } from './auth/AuthProvider.jsx';
import FaltaConfigurar from './auth/FaltaConfigurar.jsx';
import { configurado } from './lib/supabase.js';
import './index.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {configurado ? (
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    ) : (
      <FaltaConfigurar />
    )}
  </React.StrictMode>,
);
