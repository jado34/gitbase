"use client"

import type React from "react"

import { useState, useCallback, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, FileText, Type, Clipboard, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface EssayInputProps {
  essay: string
  essayTitle: string
  onEssayChange: (text: string) => void
  onTitleChange: (title: string) => void
  onAnalyze: () => void
  isAnalyzing: boolean
}

export function EssayInput({
  essay,
  essayTitle,
  onEssayChange,
  onTitleChange,
  onAnalyze,
  isAnalyzing,
}: EssayInputProps) {
  const [inputMethod, setInputMethod] = useState("type")
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const wordCount = essay.split(" ").filter((word) => word.length > 0).length
  const characterCount = essay.length

  const handleFileUpload = useCallback(
    async (file: File) => {
      if (!file.type.includes("text") && !file.name.endsWith(".txt") && !file.name.endsWith(".docx")) {
        toast({
          title: "Invalid file type",
          description: "Please upload a text file (.txt) or Word document (.docx)",
          variant: "destructive",
        })
        return
      }

      try {
        const text = await file.text()
        onEssayChange(text)
        toast({
          title: "File uploaded successfully",
          description: `Loaded ${text.length} characters from ${file.name}`,
        })
      } catch (error) {
        toast({
          title: "Error reading file",
          description: "Could not read the uploaded file. Please try again.",
          variant: "destructive",
        })
      }
    },
    [onEssayChange, toast],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)

      const files = Array.from(e.dataTransfer.files)
      if (files.length > 0) {
        handleFileUpload(files[0])
      }
    },
    [handleFileUpload],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files && files.length > 0) {
        handleFileUpload(files[0])
      }
    },
    [handleFileUpload],
  )

  const pasteFromClipboard = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText()
      onEssayChange(text)
      toast({
        title: "Text pasted successfully",
        description: `Pasted ${text.length} characters from clipboard`,
      })
    } catch (error) {
      toast({
        title: "Could not access clipboard",
        description: "Please paste manually or check browser permissions",
        variant: "destructive",
      })
    }
  }, [onEssayChange, toast])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Submit Your Essay
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="essay-title">Essay Title</Label>
          <Input
            id="essay-title"
            placeholder="Enter your essay title..."
            value={essayTitle}
            onChange={(e) => onTitleChange(e.target.value)}
          />
        </div>

        <Tabs value={inputMethod} onValueChange={setInputMethod}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="type" className="flex items-center gap-2">
              <Type className="h-4 w-4" />
              Type
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="paste" className="flex items-center gap-2">
              <Clipboard className="h-4 w-4" />
              Paste
            </TabsTrigger>
          </TabsList>

          <TabsContent value="type" className="space-y-4">
            <Textarea
              placeholder="Type or paste your essay here..."
              value={essay}
              onChange={(e) => onEssayChange(e.target.value)}
              className="min-h-[400px] resize-none"
            />
          </TabsContent>

          <TabsContent value="upload" className="space-y-4">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Upload your essay</h3>
              <p className="text-muted-foreground mb-4">Drag and drop a file here, or click to select</p>
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                Choose File
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.docx,text/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <p className="text-xs text-muted-foreground mt-2">Supports .txt and .docx files</p>
            </div>
            {essay && (
              <Textarea
                value={essay}
                onChange={(e) => onEssayChange(e.target.value)}
                className="min-h-[200px] resize-none"
                placeholder="Your uploaded essay will appear here..."
              />
            )}
          </TabsContent>

          <TabsContent value="paste" className="space-y-4">
            <div className="text-center p-8 border border-border rounded-lg">
              <Clipboard className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Paste from clipboard</h3>
              <p className="text-muted-foreground mb-4">Click the button below to paste text from your clipboard</p>
              <Button onClick={pasteFromClipboard} variant="outline">
                Paste Text
              </Button>
            </div>
            {essay && (
              <Textarea
                value={essay}
                onChange={(e) => onEssayChange(e.target.value)}
                className="min-h-[200px] resize-none"
                placeholder="Your pasted essay will appear here..."
              />
            )}
          </TabsContent>
        </Tabs>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{wordCount} words</span>
            <span>{characterCount} characters</span>
          </div>
          <Button onClick={onAnalyze} disabled={!essay.trim() || isAnalyzing} className="min-w-[120px]">
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              "Analyze Essay"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
