import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { validatePhotoFile } from '@/lib/photoUpload';

interface BatchPhotoUploadProps {
  onPhotosSelected: (files: File[]) => void;
  maxPhotos?: number;
  disabled?: boolean;
}

interface PhotoPreview {
  file: File;
  preview: string;
  error?: string;
}

/**
 * Batch photo upload component
 * Allows selecting multiple photos with preview and validation
 */
export function BatchPhotoUpload({ onPhotosSelected, maxPhotos = 10, disabled = false }: BatchPhotoUploadProps) {
  const [photos, setPhotos] = useState<PhotoPreview[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return;

    setIsLoading(true);
    const newPhotos: PhotoPreview[] = [];

    for (let i = 0; i < files.length && photos.length + newPhotos.length < maxPhotos; i++) {
      const file = files[i];
      const validation = validatePhotoFile(file);

      if (!validation.valid) {
        newPhotos.push({
          file,
          preview: '',
          error: validation.error,
        });
      } else {
        const preview = URL.createObjectURL(file);
        newPhotos.push({
          file,
          preview,
        });
      }
    }

    const updatedPhotos = [...photos, ...newPhotos];
    setPhotos(updatedPhotos);
    onPhotosSelected(updatedPhotos.filter((p) => !p.error).map((p) => p.file));
    setIsLoading(false);
  };

  const removePhoto = (index: number) => {
    const updated = photos.filter((_, i) => i !== index);
    setPhotos(updated);
    onPhotosSelected(updated.filter((p) => !p.error).map((p) => p.file));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleFileSelect(e.dataTransfer.files);
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer"
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleFileSelect(e.target.files)}
          disabled={disabled}
          className="hidden"
        />

        {isLoading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            <p className="text-sm text-gray-600">Processing photos...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-8 w-8 text-gray-400" />
            <p className="text-sm font-medium text-gray-700">
              Click to select or drag photos here
            </p>
            <p className="text-xs text-gray-500">
              {photos.length}/{maxPhotos} photos selected
            </p>
          </div>
        )}
      </div>

      {/* Photo Grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {photos.map((photo, index) => (
            <div key={index} className="relative group">
              {photo.error ? (
                <div className="aspect-square bg-red-50 border border-red-200 rounded-lg flex flex-col items-center justify-center p-2">
                  <AlertCircle className="h-6 w-6 text-red-500 mb-1" />
                  <p className="text-xs text-red-600 text-center">{photo.error}</p>
                </div>
              ) : (
                <>
                  <img
                    src={photo.preview}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-6 w-6 p-0"
                      onClick={() => removePhoto(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="absolute bottom-1 right-1 bg-green-500 rounded-full p-1">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      {photos.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <p className="text-sm text-blue-900">
              {photos.filter((p) => !p.error).length} valid photo(s) ready to upload
              {photos.some((p) => p.error) && ` (${photos.filter((p) => p.error).length} invalid)`}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
