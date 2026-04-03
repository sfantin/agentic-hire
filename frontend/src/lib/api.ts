const BASE = import.meta.env.VITE_API_URL ?? ''

export interface RawPost {
  post_url: string
  author_name: string
  search_query: string
  posted_at: string | null
  reactions_count: number | null
}

export interface Job {
  id: string
  match_score: number
  reasoning: string
  missing_skills: string[]
  strong_points: string[]
  is_high_match: boolean
  raw_posts: RawPost | null
}

export interface JobsResponse {
  total: number
  jobs: Job[]
}

export interface SkillGap {
  skill: string
  frequency: number
  percentage: number
}

export interface GapAnalysisResponse {
  skill_gaps: SkillGap[]
  recommendation: string
  analysis_period_days: number
}

export interface OutreachResponse {
  job_id: string
  subject_line: string
  email_body: string
  hiring_manager_tip: string
  tone: string
}

export interface RunQueryResponse {
  query: string
  ingested: number
  qualified: number
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, init)
  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText)
    throw new Error(err || `HTTP ${res.status}`)
  }
  return res.json() as Promise<T>
}

export const api = {
  health: () => request<{ status: string }>('/api/v1/health'),

  getJobs: (params?: { min_score?: number; high_match_only?: boolean; limit?: number }) => {
    const q = new URLSearchParams()
    if (params?.min_score !== undefined) q.set('min_score', String(params.min_score))
    if (params?.high_match_only) q.set('high_match_only', 'true')
    if (params?.limit) q.set('limit', String(params.limit))
    return request<JobsResponse>(`/api/v1/jobs?${q}`)
  },

  getGapAnalysis: () => request<GapAnalysisResponse>('/api/v1/gap-analysis'),

  generateOutreach: (jobId: string) =>
    request<OutreachResponse>(`/api/v1/outreach/${jobId}`, { method: 'POST' }),

  ingest: (searchQuery: string, limit = 5) =>
    request<{ ingested: number; message: string }>('/api/v1/ingest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ search_query: searchQuery, limit }),
    }),

  qualify: (limit = 5) =>
    request<{ qualified: number; results: unknown[] }>('/api/v1/qualify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ limit }),
    }),

  runQuery: (query: string, limit = 10) =>
    request<RunQueryResponse>('/api/v1/run-query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, limit }),
    }),

  deleteAllJobs: () =>
    request<{ message: string; status: string }>('/api/v1/jobs', {
      method: 'DELETE',
    }),

  uploadCv: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return request<{ message: string; filename: string }>('/api/v1/cv', {
      method: 'POST',
      body: formData,
    })
  },
}
