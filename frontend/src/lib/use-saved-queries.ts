import { useState, useEffect } from 'react'

const STORAGE_KEY = 'agentic_hire_queries'

const DEFAULT_QUERIES = [
  '("python") AND ("hire" OR "hiring") AND ("LATAM" OR "remote") AND ("junior" OR "senior")',
  '("javascript" OR "typescript") AND ("frontend") AND ("LATAM")',
  '("react") AND ("remote") AND ("brasil")',
]

export function useSavedQueries() {
  const [queries, setQueries] = useState<string[]>([])

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        setQueries(JSON.parse(stored))
      } catch {
        setQueries(DEFAULT_QUERIES)
      }
    } else {
      setQueries(DEFAULT_QUERIES)
    }
  }, [])

  // Save to localStorage whenever queries change
  useEffect(() => {
    if (queries.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(queries))
    }
  }, [queries])

  const add = (query: string) => {
    if (query.trim() && !queries.includes(query)) {
      setQueries([...queries, query])
    }
  }

  const remove = (index: number) => {
    setQueries(queries.filter((_, i) => i !== index))
  }

  const clear = () => {
    setQueries([])
  }

  return { queries, add, remove, clear }
}
