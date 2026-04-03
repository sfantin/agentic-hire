import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from '@/layouts/AppLayout'
import Dashboard from '@/pages/Dashboard'
import Search from '@/pages/Search'
import Jobs from '@/pages/Jobs'
import Outreach from '@/pages/Outreach'
import GapAnalysis from '@/pages/GapAnalysis'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="search" element={<Search />} />
          <Route path="jobs" element={<Jobs />} />
          <Route path="outreach" element={<Outreach />} />
          <Route path="gap-analysis" element={<GapAnalysis />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
