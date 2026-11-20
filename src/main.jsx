import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ReactLenis } from 'lenis/react'
import 'lenis/dist/lenis.css'
import './index.css'
import App from './App.jsx'
import {BrowserRouter} from 'react-router-dom'


createRoot(document.getElementById('root')).render(
  <>
    <BrowserRouter>

      <ReactLenis
        root
        options={{
          lerp: 0.1, // lower = smoother/slower (0.05 – 0.15 is a good range)
          smoothWheel: true,
        }}
      >
        <App />
      </ReactLenis>
    </BrowserRouter>
  </>,
)
