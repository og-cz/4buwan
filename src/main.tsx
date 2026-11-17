import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { showLoginTheme } from './state/theme'
import { setDataMode } from './state/dataMode'

showLoginTheme()
// The interface only ever works on Real data. Reset any mode left in the browser by an earlier version
// before the first request (Sample data is reached only through the API's X-Data-Mode header).
setDataMode('real')

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
