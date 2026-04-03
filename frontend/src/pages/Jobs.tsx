import { useEffect, useState } from 'react'
import { ExternalLink, Mail, RefreshCw } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ScoreBadge } from '@/components/ScoreBadge'
import { api, type Job } from '@/lib/api'

function formatRelativeTime(isoString: string): string {
  const now = Date.now()
  const then = new Date(isoString).getTime()
  const diffMs = now - then
  const diffH = Math.floor(diffMs / 3600000)
  if (diffH < 1) return 'just now'
  if (diffH < 24) return `${diffH}h ago`
  const diffD = Math.floor(diffH / 24)
  if (diffD < 7) return `${diffD}d ago`
  return `${Math.floor(diffD / 7)}w ago`
}

export default function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [highMatchOnly, setHighMatchOnly] = useState(false)
  const [generatingId, setGeneratingId] = useState<string | null>(null)
  const [successIds, setSuccessIds] = useState<Set<string>>(new Set())
  const [error, setError] = useState('')

  function loadJobs() {
    setLoading(true)
    api
      .getJobs({ high_match_only: highMatchOnly, limit: 50 })
      .then(res => setJobs(res.jobs))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadJobs()
  }, [highMatchOnly])

  async function handleGenerateEmail(job: Job) {
    if (!job.is_high_match) return
    setGeneratingId(job.id)
    setError('')
    try {
      await api.generateOutreach(job.id)
      setSuccessIds(prev => new Set(prev).add(job.id))
    } catch (e) {
      setError(`Failed to generate email: ${e instanceof Error ? e.message : 'Unknown error'}`)
    } finally {
      setGeneratingId(null)
    }
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Jobs</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {jobs.length} qualified job{jobs.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={highMatchOnly ? 'default' : 'outline'}
            size="sm"
            onClick={() => setHighMatchOnly(v => !v)}
          >
            High Match Only
          </Button>
          <Button variant="ghost" size="icon" onClick={loadJobs}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive border border-destructive/30 rounded-md px-4 py-2">
          {error}
        </p>
      )}

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <p className="p-8 text-sm text-muted-foreground text-center">
              No jobs found. Run Ingest + Qualify from the Dashboard.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Author / Company</TableHead>
                  <TableHead>Posted</TableHead>
                  <TableHead>Reactions</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Missing Skills</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map(job => (
                  <TableRow key={job.id}>
                    <TableCell>
                      <div className="font-medium text-sm">
                        {job.raw_posts?.author_name ?? 'Unknown'}
                      </div>
                      {job.raw_posts?.post_url && (
                        <a
                          href={job.raw_posts.post_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary mt-0.5"
                        >
                          <ExternalLink className="h-3 w-3" />
                          View post
                        </a>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {job.raw_posts?.posted_at
                        ? formatRelativeTime(job.raw_posts.posted_at)
                        : '—'}
                    </TableCell>
                    <TableCell className="text-xs text-center">
                      {job.raw_posts?.reactions_count != null
                        ? <span className={`font-medium ${job.raw_posts.reactions_count <= 10 ? 'text-green-600' : job.raw_posts.reactions_count <= 30 ? 'text-yellow-600' : 'text-muted-foreground'}`}>
                            {job.raw_posts.reactions_count}+
                          </span>
                        : '—'}
                    </TableCell>
                    <TableCell>
                      <ScoreBadge score={job.match_score} />
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-[220px]">
                        {job.missing_skills.slice(0, 3).map(skill => (
                          <Badge key={skill} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {job.missing_skills.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{job.missing_skills.length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {job.is_high_match ? (
                        <Badge variant="success">High Match</Badge>
                      ) : (
                        <Badge variant="secondary">Low Match</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {job.is_high_match && (
                        <Button
                          size="sm"
                          variant={successIds.has(job.id) ? 'outline' : 'default'}
                          disabled={generatingId === job.id || successIds.has(job.id)}
                          onClick={() => handleGenerateEmail(job)}
                        >
                          {generatingId === job.id ? (
                            <RefreshCw className="h-3 w-3 animate-spin" />
                          ) : (
                            <Mail className="h-3 w-3" />
                          )}
                          {successIds.has(job.id) ? 'Sent ✓' : 'Email'}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
