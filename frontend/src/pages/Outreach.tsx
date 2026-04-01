import { useEffect, useState } from 'react'
import { Mail, RefreshCw, ExternalLink, Lightbulb } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ScoreBadge } from '@/components/ScoreBadge'
import { api, type Job, type OutreachResponse } from '@/lib/api'

interface JobWithOutreach {
  job: Job
  outreach: OutreachResponse | null
  generating: boolean
  error: string
}

export default function Outreach() {
  const [items, setItems] = useState<JobWithOutreach[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .getJobs({ high_match_only: true, limit: 20 })
      .then(res =>
        setItems(res.jobs.map(job => ({ job, outreach: null, generating: false, error: '' })))
      )
      .finally(() => setLoading(false))
  }, [])

  async function generate(jobId: string) {
    setItems(prev =>
      prev.map(i => (i.job.id === jobId ? { ...i, generating: true, error: '' } : i))
    )
    try {
      const outreach = await api.generateOutreach(jobId)
      setItems(prev =>
        prev.map(i => (i.job.id === jobId ? { ...i, outreach, generating: false } : i))
      )
    } catch (e) {
      setItems(prev =>
        prev.map(i =>
          i.job.id === jobId
            ? { ...i, generating: false, error: e instanceof Error ? e.message : 'Failed' }
            : i
        )
      )
    }
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Outreach</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Generate cold emails for high-match jobs (score ≥ 85)
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            No high-match jobs yet. Run Ingest + Qualify from the Dashboard.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map(({ job, outreach, generating, error }) => (
            <Card key={job.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <CardTitle className="text-base">
                      {job.raw_posts?.author_name ?? 'Unknown Company'}
                    </CardTitle>
                    <CardDescription className="mt-1 flex items-center gap-2">
                      <ScoreBadge score={job.match_score} />
                      {job.raw_posts?.search_query && (
                        <span className="truncate">{job.raw_posts.search_query}</span>
                      )}
                      {job.raw_posts?.post_url && (
                        <a
                          href={job.raw_posts.post_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 hover:text-primary flex-shrink-0"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </CardDescription>
                  </div>
                  {!outreach && (
                    <Button size="sm" disabled={generating} onClick={() => generate(job.id)}>
                      {generating ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Mail className="h-4 w-4" />
                      )}
                      {generating ? 'Generating…' : 'Generate Email'}
                    </Button>
                  )}
                </div>
                {error && <p className="text-xs text-destructive mt-1">{error}</p>}
              </CardHeader>

              {outreach && (
                <CardContent className="pt-0 space-y-4">
                  {/* Subject */}
                  <div className="rounded-md border border-border bg-muted/30 px-4 py-3">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                      Subject
                    </p>
                    <p className="text-sm font-semibold">{outreach.subject_line}</p>
                  </div>

                  {/* Body */}
                  <div className="rounded-md border border-border bg-muted/30 px-4 py-3">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                      Email Body
                    </p>
                    <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed">
                      {outreach.email_body}
                    </pre>
                  </div>

                  {/* Tip */}
                  {outreach.hiring_manager_tip && (
                    <div className="flex items-start gap-2 rounded-md border border-yellow-500/30 bg-yellow-500/10 px-4 py-3">
                      <Lightbulb className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-yellow-400 mb-0.5">
                          Hiring Manager Tip
                        </p>
                        <p className="text-sm text-yellow-200/80">{outreach.hiring_manager_tip}</p>
                      </div>
                    </div>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground"
                    onClick={() => generate(job.id)}
                  >
                    <RefreshCw className="h-3 w-3" />
                    Regenerate
                  </Button>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
