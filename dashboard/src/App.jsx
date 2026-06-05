import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Shell from './components/layout/Shell'
import Home from './pages/Home'
import Builder from './pages/Builder'
import Settings from './pages/Settings'
import Templates from './pages/Templates'
import Vault from './pages/Vault'

const Stub = ({ name }) => (
  <div className="flex items-center justify-center h-full">
    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>{name} — coming soon</p>
  </div>
)

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Shell />}>
          <Route index element={<Home />} />
          <Route path="builder" element={<Builder />} />
          <Route path="settings" element={<Settings />} />
          <Route path="templates" element={<Templates />} />
          <Route path="vault" element={<Vault />} />
          <Route path="color" element={<Stub name="Color Palettes" />} />
          <Route path="history" element={<Stub name="History" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}