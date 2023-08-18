import { Route, RouterProvider, createBrowserRouter, createRoutesFromElements } from 'react-router-dom'
import EditPage from './pages/EditPage'
import ListPage from './pages/ListPage'
import RequiredAuth from './components/RequiredAuth'
import './index.css'

function App() {
  const router = createBrowserRouter(createRoutesFromElements(
    <Route path="/" element={<RequiredAuth />}>
      <Route path="list" element={<ListPage />} />
      <Route index element={<EditPage />} />
    </Route>
  ))
  return <RouterProvider router={router} />
}

export default App
