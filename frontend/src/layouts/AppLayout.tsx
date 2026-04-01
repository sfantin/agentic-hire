import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/Sidebar'
import { api } from '@/lib/api'

export default function AppLayout() {
  const [apiOnline, setApiOnline] = useState(false)

  useEffect(() => {
    api
      .health()
      .then(() => setApiOnline(true))
      .catch(() => setApiOnline(false))
  }, [])

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar apiOnline={apiOnline} />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
