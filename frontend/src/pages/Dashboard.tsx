import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Briefcase, Star, TrendingUp, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ScoreBadge } from '@/components/ScoreBadge'
import { Badge } from '@/components/ui/badge'
import { api, type Job, type JobsResponse } from '@/lib/api'

function KpiCard({
  title,
  value,
  sub,
  icon: Icon,
  loading,
}: {
  title: string
  value: string | number
  sub?: string
  icon: React.ElementType
  loading: boolean
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [data, setData] = useState<JobsResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .getJobs({ limit: 50 })
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  const jobs = data?.jobs ?? []
  const highMatch = jobs.filter(j => j.is_high_match).length
  const avgScore =
    jobs.length > 0 ? Math.round(jobs.reduce((s, j) => s + j.match_score, 0) / jobs.length) : 0
  const recent = [...jobs].slice(0, 5)

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            AI-powered job intelligence pipeline
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => navigate('/search')}
        >
          Run a Search
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard title="Total Jobs" value={data?.total ?? 0} icon={Briefcase} loading={loading} />
        <KpiCard
          title="High Match"
          value={highMatch}
          sub="score ≥ 85"
          icon={Star}
          loading={loading}
        />
        <KpiCard
          title="Avg Score"
          value={avgScore}
          sub="across all jobs"
          icon={TrendingUp}
          loading={loading}
        />
        <KpiCard
          title="Match Rate"
          value={jobs.length > 0 ? `${Math.round((highMatch / jobs.length) * 100)}%` : '—'}
          sub="high match ratio"
          icon={TrendingUp}
          loading={loading}
        />
      </div>

      {/* Recent Jobs */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Recent jobs
        </h2>
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : recent.length === 0 ? (
              <p className="p-6 text-sm text-muted-foreground text-center">
                No jobs yet. Use Ingest + Qualify to get started.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {recent.map((job: Job) => (
                  <li
                    key={job.id}
                    className="flex items-center justify-between px-6 py-3 hover:bg-muted/30 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {job.raw_posts?.author_name ?? 'Unknown'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate max-w-xs">
                        {job.raw_posts?.search_query ?? ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                      {job.is_high_match && (
                        <Badge variant="success">High Match</Badge>
                      )}
                      <ScoreBadge score={job.match_score} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
