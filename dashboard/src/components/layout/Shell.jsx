import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import ServerBar from './ServerBar'

export default function Shell() {
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--w-bg)' }}>
      <Sidebar />
      <main className="flex-1 min-w-0 min-h-0 overflow-hidden flex flex-col">
        <ServerBar />
        <Outlet />
      </main>
    </div>
  )
}
