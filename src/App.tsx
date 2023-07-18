import { useState } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import EditPage from './pages/EditPage'
import ListPage from './pages/ListPage'
import RequiredAuth from './components/RequiredAuth'
import './index.css'

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<RequiredAuth />}>
          <Route index element={<EditPage />} />

          <Route path="list" element={<ListPage />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
