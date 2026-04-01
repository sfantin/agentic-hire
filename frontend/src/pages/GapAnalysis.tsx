import { useEffect, useState } from 'react'
import { RefreshCw, Sparkles } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { api, type GapAnalysisResponse } from '@/lib/api'

function scoreColor(pct: number) {
  if (pct >= 60) return '#ef4444'
  if (pct >= 40) return '#eab308'
  return '#10b981'
}

export default function GapAnalysis() {
  const [data, setData] = useState<GapAnalysisResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  function load() {
    setLoading(true)
    setError('')
    api
      .getGapAnalysis()
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const chartData = (data?.skill_gaps ?? []).map(g => ({
    name: g.skill,
    pct: g.percentage,
    freq: g.frequency,
  }))

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gap Analysis</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Top missing skills across non-matching jobs
            {data?.analysis_period_days
              ? ` — last ${data.analysis_period_days} days`
              : ''}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          {loading ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Refresh
        </Button>
      </div>

      {error && (
        <p className="text-sm text-destructive border border-destructive/30 rounded-md px-4 py-2">
          {error}
        </p>
      )}

      {/* AI Recommendation */}
      {(loading || data?.recommendation) && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-primary">
              <Sparkles className="h-4 w-4" />
              AI Recommendation
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : (
              <p className="text-sm leading-relaxed">{data?.recommendation}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Skill Frequency</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3 h-64 flex flex-col justify-end pb-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-6" style={{ width: `${80 - i * 8}%` }} />
              ))}
            </div>
          ) : chartData.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">
              No gap data yet. Qualify some jobs first.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 0, right: 24, left: 16, bottom: 0 }}
              >
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tickFormatter={v => `${v}%`}
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={110}
                  tick={{ fill: 'var(--foreground)', fontSize: 13 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: 'var(--muted)', opacity: 0.3 }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null
                    const d = payload[0].payload
                    return (
                      <div className="rounded-md border border-border bg-popover px-3 py-2 text-xs shadow-md">
                        <p className="font-semibold">{d.name}</p>
                        <p className="text-muted-foreground">
                          {d.pct}% of jobs — {d.freq}×
                        </p>
                      </div>
                    )
                  }}
                />
                <Bar dataKey="pct" radius={[0, 4, 4, 0]} maxBarSize={28}>
                  {chartData.map(entry => (
                    <Cell key={entry.name} fill={scoreColor(entry.pct)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Skill table */}
      {!loading && chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Skill Details</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {data!.skill_gaps.map((gap, i) => (
                <li
                  key={gap.skill}
                  className="flex items-center justify-between px-6 py-3 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-muted-foreground w-5 text-right">
                      #{i + 1}
                    </span>
                    <span className="text-sm font-medium">{gap.skill}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-muted-foreground">{gap.frequency}× jobs</span>
                    <span
                      className="text-sm font-bold tabular-nums"
                      style={{ color: scoreColor(gap.percentage) }}
                    >
                      {gap.percentage}%
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
