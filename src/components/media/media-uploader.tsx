import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/components/ui/use-toast'
import { Upload } from 'lucide-react'
import { useUploadMedia } from '@/hooks/mutations/use-upload-media'

export function MediaUploader() {
  const { toast } = useToast()
  const { mutate: uploadMedia, isLoading } = useUploadMedia()

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      acceptedFiles.forEach((file) => {
        uploadMedia(file, {
          onSuccess: () => {
            toast({
              title: 'File uploaded',
              description: `${file.name} has been uploaded successfully.`,
            })
          },
          onError: () => {
            toast({
              title: 'Upload failed',
              description: `Failed to upload ${file.name}.`,
              variant: 'destructive',
            })
          },
        })
      })
    },
    [uploadMedia, toast]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': [],
      'video/*': [],
      'application/pdf': [],
    },
    disabled: isLoading,
  })

  return (
    <div>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center ${
          isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          {isDragActive
            ? 'Drop the files here...'
            : 'Drag & drop files here, or click to select'}
        </p>
      </div>

      {isLoading && (
        <div className="mt-4 space-y-2">
          <Progress value={33} />
          <p className="text-sm text-gray-500">Uploading...</p>
        </div>
      )}
    </div>
  )
}