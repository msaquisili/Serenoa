import React, { useState, useEffect } from 'react';
import { CartProvider } from './context/CartContext';
import Storefront from './views/Storefront';
import AdminView from './views/AdminView';
import FloatingCartButton from './components/FloatingCartButton';
import Chatbot from './components/Chatbot';
import CartDrawer from './components/CartDrawer';
import './styles.css';

export default function App() {
  const [view, setView] = useState(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path.includes('/admin') || hash.includes('#admin') || path.includes('/nuevo_producto') || path.includes('/nuevo-producto')) {
        return 'admin';
      }
    }
    return 'store';
  });

  const [storeTab, setStoreTab] = useState('inicio');

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path.includes('/admin') || hash.includes('#admin') || path.includes('/nuevo_producto') || path.includes('/nuevo-producto')) {
        setView('admin');
      } else {
        setView('store');
        if (hash.includes('#catalogo')) {
          setStoreTab('catalogo');
        } else if (hash.includes('#inicio')) {
          setStoreTab('inicio');
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  const navigateToStore = () => {
    setView('store');
    setStoreTab('inicio');
    window.history.pushState(null, '', '/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExploreCatalog = () => {
    setView('store');
    setStoreTab('catalogo');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <CartProvider>
      {view === 'store' ? (
        <>
          <Storefront currentView={storeTab} onNavigateTab={setStoreTab} />
          <FloatingCartButton />
          <Chatbot onExploreCatalog={handleExploreCatalog} />
          <CartDrawer onExploreCatalog={handleExploreCatalog} />
        </>
      ) : (
        <AdminView onNavigateToStore={navigateToStore} />
      )}
    </CartProvider>
  );
}
