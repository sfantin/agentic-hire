import { useRef, useState } from 'react'
import { FileText, Upload } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function CvProfile() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [statusMessage, setStatusMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFileSelect(file: File | null) {
    if (file && (file.type === 'application/pdf' || file.type === 'text/plain')) {
      setSelectedFile(file)
      setUploadStatus('idle')
      setStatusMessage('')
    } else if (file) {
      setStatusMessage('Please select a PDF or TXT file')
      setUploadStatus('error')
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    const file = e.dataTransfer.files[0]
    handleFileSelect(file)
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.currentTarget.files?.[0]
    if (file) handleFileSelect(file)
  }

  async function handleUpload() {
    if (!selectedFile) return
    setUploading(true)
    setUploadStatus('idle')

    // Backend implementation coming soon
    // For now, just show a success message to demonstrate the flow
    setTimeout(() => {
      setUploadStatus('success')
      setStatusMessage(`CV "${selectedFile.name}" would be uploaded (backend not yet implemented)`)
      setUploading(false)
    }, 800)
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <FileText className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold">CV / Profile</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Upload your CV to personalize job qualification matching
        </p>
      </div>

      {/* Status message */}
      {uploadStatus === 'success' && (
        <p className="text-sm border border-green-300 rounded-md px-4 py-2 bg-green-50 text-green-700">
          ✓ {statusMessage}
        </p>
      )}
      {uploadStatus === 'error' && (
        <p className="text-sm border border-red-300 rounded-md px-4 py-2 bg-red-50 text-red-700">
          ✗ {statusMessage}
        </p>
      )}

      {/* Upload Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Upload Your CV</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Drag and drop zone */}
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-12 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt"
              onChange={handleInputChange}
              className="hidden"
            />
            <Upload className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm font-medium mb-1">
              {selectedFile ? selectedFile.name : 'Click or drag PDF/TXT file here'}
            </p>
            <p className="text-xs text-muted-foreground">
              {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : 'Maximum 5 MB'}
            </p>
          </div>

          {/* Upload button */}
          <div className="flex gap-3">
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="flex-1"
            >
              {uploading ? 'Uploading...' : 'Upload CV'}
            </Button>
            {selectedFile && (
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedFile(null)
                  setUploadStatus('idle')
                  setStatusMessage('')
                }}
              >
                Clear
              </Button>
            )}
          </div>

          {/* Note */}
          <p className="text-xs text-muted-foreground border-t pt-4">
            💡 Your CV will be used by the qualification system to match you with job opportunities that fit your profile.
          </p>
        </CardContent>
      </Card>

      {/* Current CV Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Current CV</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No CV uploaded yet</p>
        </CardContent>
      </Card>
    </div>
  )
}
