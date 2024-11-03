import { useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { UploadCloud } from "lucide-react"
import { useUploadThing } from "@/lib/uploadthing"
import { cn } from "@/lib/utils"

export function ImageUpload() {
  const { startUpload } = useUploadThing("imageUploader")

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    await startUpload(acceptedFiles)
  }, [startUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [],
    },
  })

  return (
    <div
      {...getRootProps()}
      className={cn(
        "flex flex-col items-center justify-center rounded-md border border-dashed p-6",
        isDragActive && "border-primary bg-muted"
      )}
    >
      <input {...getInputProps()} />
      <UploadCloud className="h-10 w-10 text-muted-foreground" />
      <p className="mt-2 text-sm text-muted-foreground">
        Drag & drop images here, or click to select
      </p>
    </div>
  )
}