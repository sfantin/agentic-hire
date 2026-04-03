import { useState, useEffect } from 'react'
import { Search as SearchIcon, Trash2, Play, Save, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'
import { useSavedQueries } from '@/lib/use-saved-queries'

export default function Search() {
  const { queries, add, remove, clear } = useSavedQueries()
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [freeQuery, setFreeQuery] = useState('')
  const [running, setRunning] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [showClearDialog, setShowClearDialog] = useState(false)

  const activeQuery = freeQuery.trim() || (selectedIndex !== null ? queries[selectedIndex] : '')

  async function handleRun() {
    if (!activeQuery) {
      setStatusMessage('Enter or select a query')
      return
    }

    setRunning(true)
    setStatusMessage('Buscando posts...')
    try {
      const res = await api.runQuery(activeQuery, 10)
      setStatusMessage(`✓ ${res.ingested} posts novos, ${res.qualified} qualificados`)
      // Clear free query after successful run
      setFreeQuery('')
      setSelectedIndex(null)
    } catch (e) {
      setStatusMessage(`✗ Erro: ${e instanceof Error ? e.message : 'Failed'}`)
    } finally {
      setRunning(false)
    }
  }

  function handleSaveNew() {
    if (freeQuery.trim()) {
      add(freeQuery)
      setFreeQuery('')
      setStatusMessage(`✓ Query salva`)
      setTimeout(() => setStatusMessage(''), 3000)
    }
  }

  async function handleClearConfirm() {
    try {
      // Delete all jobs from backend
      await api.deleteAllJobs()

      // Clear local queries
      clear()
      setSelectedIndex(null)
      setShowClearDialog(false)
      setStatusMessage(`✓ Histórico e jobs limpos`)
      setTimeout(() => setStatusMessage(''), 3000)
    } catch (e) {
      setStatusMessage(`✗ Erro ao limpar: ${e instanceof Error ? e.message : 'Failed'}`)
    }
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SearchIcon className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Search Queries</h1>
        </div>
        {queries.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowClearDialog(true)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
            Clear History
          </Button>
        )}
      </div>

      {/* Status Message */}
      {statusMessage && (
        <p className={`text-sm border rounded-md px-4 py-2 ${
          statusMessage.startsWith('✗')
            ? 'border-red-300 text-red-700 bg-red-50'
            : 'border-green-300 text-green-700 bg-green-50'
        }`}>
          {statusMessage}
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Query Library */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Biblioteca de Queries</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {queries.length === 0 ? (
                <p className="text-xs text-muted-foreground">Nenhuma query salva</p>
              ) : (
                queries.map((q, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedIndex(selectedIndex === idx ? null : idx)}
                    className={`p-3 rounded-md border cursor-pointer transition-colors ${
                      selectedIndex === idx
                        ? 'bg-blue-50 border-blue-300'
                        : 'bg-muted/30 border-border hover:border-border hover:bg-muted/50'
                    }`}
                  >
                    <p className="text-xs text-muted-foreground mb-2 font-mono break-words">
                      {q}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={running}
                        onClick={(e) => {
                          e.stopPropagation()
                          setFreeQuery('')
                          setSelectedIndex(idx)
                          setTimeout(() => {
                            // Trigger run after selection
                            handleRun()
                          }, 0)
                        }}
                        className="h-7 text-xs"
                      >
                        <Play className="h-3 w-3" />
                        Run
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          remove(idx)
                          if (selectedIndex === idx) setSelectedIndex(null)
                        }}
                        className="h-7 text-xs text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* New Query Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Nova Query</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <textarea
              value={freeQuery}
              onChange={(e) => setFreeQuery(e.target.value)}
              placeholder='Cole sua query aqui... ex: ("python") AND ("hire")'
              className="w-full h-32 p-3 text-xs border rounded-md font-mono resize-none"
            />
            <div className="flex flex-col gap-2">
              <Button
                onClick={handleRun}
                disabled={running || !activeQuery}
                className="w-full h-9"
              >
                <Play className="h-4 w-4" />
                Run
              </Button>
              <Button
                onClick={handleSaveNew}
                disabled={!freeQuery.trim()}
                variant="outline"
                className="w-full h-9"
              >
                <Save className="h-4 w-4" />
                Save
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Clear History Confirmation Modal */}
      {showClearDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-sm mx-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Limpar histórico?</CardTitle>
                <button
                  onClick={() => setShowClearDialog(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Isso vai deletar todas as {queries.length} queries salvas. Esta ação não pode ser desfeita.
              </p>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowClearDialog(false)}
                >
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  className="bg-red-600 hover:bg-red-700"
                  onClick={handleClearConfirm}
                >
                  Limpar Tudo
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
