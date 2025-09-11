"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Navigation } from "@/components/navigation"
import { Upload, FileText, AlertCircle, CheckCircle } from "lucide-react"

export default function UploadPage() {
  const { data: session } = useSession()
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.type === "application/pdf") {
        setFile(selectedFile)
        setUploadStatus("idle")
        setMessage("")
      } else {
        setMessage("Please select a PDF file")
        setUploadStatus("error")
      }
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setIsUploading(true)
    setUploadStatus("idle")

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload/pdf", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const result = await response.json()
        setUploadStatus("success")
        setMessage(`Successfully processed ${result.transactionsCount} transactions from your bank statement!`)
        setFile(null)
        // Reset file input
        const fileInput = document.getElementById("file-upload") as HTMLInputElement
        if (fileInput) fileInput.value = ""
      } else {
        const error = await response.json()
        setUploadStatus("error")
        setMessage(error.message || "Failed to process PDF")
      }
    } catch (error) {
      setUploadStatus("error")
      setMessage("An error occurred while uploading the file")
    } finally {
      setIsUploading(false)
    }
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Please sign in</h1>
          <p>You need to be signed in to upload bank statements.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation />
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-white">Upload Bank Statement</h1>
            <p className="text-gray-400">Upload your bank statement PDF to automatically import transactions</p>
          </div>

          {/* Upload Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="w-5 h-5 mr-2" />
                Upload PDF
              </CardTitle>
              <CardDescription>
                Supported formats: PDF bank statements from major banks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* File Upload Area */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <div className="space-y-2">
                  <p className="text-lg font-medium text-gray-900">
                    {file ? file.name : "Choose a PDF file to upload"}
                  </p>
                  <p className="text-sm text-gray-500">
                    Drag and drop your bank statement PDF here, or click to browse
                  </p>
                </div>
                <input
                  id="file-upload"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => document.getElementById("file-upload")?.click()}
                >
                  Select File
                </Button>
              </div>

              {/* Upload Status */}
              {message && (
                <div className={`p-4 rounded-lg flex items-center ${
                  uploadStatus === "success" 
                    ? "bg-green-50 border border-green-200 text-green-800"
                    : uploadStatus === "error"
                    ? "bg-red-50 border border-red-200 text-red-800"
                    : "bg-blue-50 border border-blue-200 text-blue-800"
                }`}>
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

              {/* Upload Button */}
              <Button
                onClick={handleUpload}
                disabled={!file || isUploading}
                className="w-full"
                size="lg"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload and Process
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>How it works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
                    1
                  </div>
                  <div>
                    <h3 className="font-medium">Upload your bank statement</h3>
                    <p className="text-sm text-gray-600">Download your bank statement as a PDF from your online banking portal</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
                    2
                  </div>
                  <div>
                    <h3 className="font-medium">AI processes the data</h3>
                    <p className="text-sm text-gray-600">Our system automatically extracts transaction details and categorizes them</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
                    3
                  </div>
                  <div>
                    <h3 className="font-medium">Review and confirm</h3>
                    <p className="text-sm text-gray-600">Check the imported transactions and make any necessary adjustments</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Supported Banks */}
          <Card>
            <CardHeader>
              <CardTitle>Supported Banks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  "Chase Bank",
                  "Bank of America", 
                  "Wells Fargo",
                  "Citibank",
                  "Capital One",
                  "US Bank",
                  "PNC Bank",
                  "TD Bank"
                ].map((bank) => (
                  <div key={bank} className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium">{bank}</p>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-4 text-center">
                More banks coming soon! If your bank isn't listed, contact us.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
