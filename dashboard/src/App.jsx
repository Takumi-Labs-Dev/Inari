import { HashRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Builder from './pages/Builder'
import Settings from './pages/Settings'
import Templates from './pages/Templates'
import Vault from './pages/Vault'
import ColorPalettes from './pages/ColorPalettes'
import Shell from './components/layout/Shell'

const Stub = ({ name }) => (
  <div className="flex items-center justify-center h-full">
    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>{name} — coming soon</p>
  </div>
)

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Shell />}>
          <Route index element={<Home />} />
          <Route path="builder" element={<Builder />} />
          <Route path="settings" element={<Settings />} />
          <Route path="templates" element={<Templates />} />
          <Route path="vault" element={<Vault />} />
          <Route path="color" element={<ColorPalettes />} />
          <Route path="history" element={<Stub name="History" />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}