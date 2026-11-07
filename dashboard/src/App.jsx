import { HashRouter, Routes, Route } from 'react-router-dom'
import Shell from './components/layout/Shell'
import AuthGuard from './components/AuthGuard'
import ComingSoon from './components/ComingSoon'
import Home from './pages/Home'
import Builder from './pages/Builder'
import Settings from './pages/Settings'
import Templates from './pages/Templates'
import Vault from './pages/Vault'
import ColorPalettes from './pages/ColorPalettes'

export default function App() {
  return (
    <AuthGuard>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Shell />}>
            <Route index element={<Home />} />
            <Route path="builder" element={<Builder />} />
            <Route path="settings" element={<Settings />} />
            <Route path="templates" element={<Templates />} />
            <Route path="vault" element={<Vault />} />
            <Route path="color" element={<ColorPalettes />} />
            <Route
              path="history"
              element={<ComingSoon title="History" message="Your sent embeds will show up here one day." />}
            />
          </Route>
        </Routes>
      </HashRouter>
    </AuthGuard>
  )
}
