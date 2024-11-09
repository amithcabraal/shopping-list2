import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Suspense, lazy } from 'react';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load pages for better performance
const ListView = lazy(() => import('./views/ListView'));
const ShopView = lazy(() => import('./views/ShopView'));
const AdminView = lazy(() => import('./views/AdminView'));
const HelpView = lazy(() => import('./views/HelpView'));
const ShareView = lazy(() => import('./views/ShareView'));
const PrintView = lazy(() => import('./views/PrintView'));

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/list" replace />} />
            <Route
              path="/list"
              element={
                <Suspense fallback={<div>Loading...</div>}>
                  <ListView />
                </Suspense>
              }
            />
            <Route
              path="/shop"
              element={
                <Suspense fallback={<div>Loading...</div>}>
                  <ShopView />
                </Suspense>
              }
            />
            <Route
              path="/print"
              element={
                <Suspense fallback={<div>Loading...</div>}>
                  <PrintView />
                </Suspense>
              }
            />
            <Route
              path="/admin"
              element={
                <Suspense fallback={<div>Loading...</div>}>
                  <AdminView />
                </Suspense>
              }
            />
            <Route
              path="/help"
              element={
                <Suspense fallback={<div>Loading...</div>}>
                  <HelpView />
                </Suspense>
              }
            />
            <Route
              path="/share"
              element={
                <Suspense fallback={<div>Loading...</div>}>
                  <ShareView />
                </Suspense>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;