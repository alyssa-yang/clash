import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './animation.css'
import './index.css'

import { enableMapSet } from 'immer'
enableMapSet()
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
