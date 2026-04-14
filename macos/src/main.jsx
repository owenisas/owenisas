import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import './index.css'
import App from './App.jsx'
import KeyboardTest from './KeyboardTest.jsx'

function Router() {
  const [route, setRoute] = useState(window.location.hash);

  useEffect(() => {
    const onHash = () => setRoute(window.location.hash);
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  if (route === '#keyboard') return <KeyboardTest />;
  return <App />;
}

createRoot(document.getElementById('root')).render(
  // StrictMode disabled temporarily for 3D animation testing
  <>
    <Router />
    <Analytics />
  </>
)
