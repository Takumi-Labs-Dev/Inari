import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function Shell() {
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--w-bg)' }}>
      <Sidebar />
      <main className="flex-1 min-w-0 min-h-0 overflow-hidden flex flex-col">
        <Outlet />
      </main>
    </div>
  )
}
