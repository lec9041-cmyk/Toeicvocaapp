import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App';
import { AppStoreProvider } from './app/store/useAppStore';
import './styles/tailwind.css';
import './styles/fonts.css';
import './styles/theme.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppStoreProvider>
      <App />
    </AppStoreProvider>
  </React.StrictMode>
);
