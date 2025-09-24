import { ChangeEvent, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, FileText, AlertCircle, CheckCircle } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { apiFetch } from "@/lib/api"

export function UploadPage() {
  const { token } = useAuth()
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0]
    if (!selected) {
      return
    }
    if (selected.type !== "application/pdf") {
      setUploadStatus("error")
      setMessage("Please select a PDF file.")
      return
    }
    setFile(selected)
    setUploadStatus("idle")
    setMessage("")
  }

  const handleUpload = async () => {
    if (!file || !token) {
      return
    }
    setIsUploading(true)
    setUploadStatus("idle")
    setMessage("")

    try {
      const formData = new FormData()
      formData.append("file", file)

      const result = await apiFetch<{ transactionsCount: number }>(
        "/upload/pdf",
        {
          method: "POST",
          body: formData,
        },
        token
      )

      setUploadStatus("success")
      setMessage(`Successfully processed ${result.transactionsCount} transactions.`)
      setFile(null)
      const input = document.getElementById("file-upload") as HTMLInputElement | null
      if (input) {
        input.value = ""
      }
    } catch (error) {
      setUploadStatus("error")
      setMessage(error instanceof Error ? error.message : "Failed to process PDF")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Upload Bank Statement</h1>
        <p className="text-gray-400">Automatically import transactions by uploading a PDF statement.</p>
      </div>

      <Card className="bg-gray-800 border border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            <Upload className="w-5 h-5 mr-2" /> Upload PDF
          </CardTitle>
          <CardDescription className="text-gray-400">Supported format: PDF bank statements.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-gray-500 transition-colors">
            <FileText className="w-12 h-12 mx-auto text-gray-500 mb-4" />
            <div className="space-y-2">
              <p className="text-lg font-medium text-white">{file ? file.name : "Select a PDF file"}</p>
              <p className="text-sm text-gray-400">Drag & drop or browse to upload your bank statement.</p>
            </div>
            <input id="file-upload" type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
            <Button variant="outline" className="mt-4 border-gray-600 text-white hover:bg-gray-700" onClick={() => document.getElementById("file-upload")?.click()}>
              Choose File
            </Button>
          </div>

          {message && (
            <div
              className={`p-4 rounded-lg flex items-center border ${
                uploadStatus === "success"
                  ? "bg-green-900/40 border-green-700 text-green-200"
                  : uploadStatus === "error"
                  ? "bg-red-900/40 border-red-700 text-red-200"
                  : "bg-blue-900/40 border-blue-700 text-blue-200"
              }`}
            >
              {uploadStatus === "success" ? (
                <CheckCircle className="w-5 h-5 mr-2" />
              ) : uploadStatus === "error" ? (
                <AlertCircle className="w-5 h-5 mr-2" />
              ) : (
                <FileText className="w-5 h-5 mr-2" />
              )}
              <span>{message}</span>
            </div>
          )}

          <Button onClick={handleUpload} disabled={!file || isUploading || !token} className="w-full bg-green-600 hover:bg-green-700" size="lg">
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" /> Processing...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" /> Upload and Process
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">How it works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-gray-300">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium">1</div>
            <div>
              <h3 className="font-medium text-white">Upload your bank statement</h3>
              <p className="text-sm text-gray-400">Download a PDF from your bank and upload it here.</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium">2</div>
            <div>
              <h3 className="font-medium text-white">AI processes the data</h3>
              <p className="text-sm text-gray-400">We extract transaction details and categorize them automatically.</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium">3</div>
            <div>
              <h3 className="font-medium text-white">Review the results</h3>
              <p className="text-sm text-gray-400">Check imported transactions in your dashboard instantly.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
