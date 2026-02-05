import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Download,
  Trash2,
  Share2,
  Archive,
  ChevronDown,
  AlertCircle,
} from 'lucide-react';

interface Photo {
  id: number;
  url: string;
  filename: string;
  size: number;
  timestamp: number;
}

interface BatchPhotoOperationsProps {
  photos: Photo[];
  onDelete?: (photoIds: number[]) => Promise<void>;
  onDownload?: (photoIds: number[]) => Promise<void>;
  onArchive?: (photoIds: number[]) => Promise<void>;
  onShare?: (photoIds: number[]) => Promise<void>;
}

export function BatchPhotoOperations({
  photos,
  onDelete,
  onDownload,
  onArchive,
  onShare,
}: BatchPhotoOperationsProps) {
  const [selectedPhotos, setSelectedPhotos] = useState<Set<number>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<'delete' | 'archive' | null>(null);

  const isAllSelected = selectedPhotos.size === photos.length && photos.length > 0;
  const isPartialSelected = selectedPhotos.size > 0 && selectedPhotos.size < photos.length;

  const togglePhoto = (photoId: number) => {
    const newSelected = new Set(selectedPhotos);
    if (newSelected.has(photoId)) {
      newSelected.delete(photoId);
    } else {
      newSelected.add(photoId);
    }
    setSelectedPhotos(newSelected);
  };

  const toggleAllPhotos = () => {
    if (isAllSelected) {
      setSelectedPhotos(new Set());
    } else {
      setSelectedPhotos(new Set(photos.map((p) => p.id)));
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;

    setIsProcessing(true);
    try {
      await onDelete(Array.from(selectedPhotos));
      setSelectedPhotos(new Set());
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setIsProcessing(false);
      setShowConfirmDialog(false);
    }
  };

  const handleDownload = async () => {
    if (!onDownload) return;

    setIsProcessing(true);
    try {
      await onDownload(Array.from(selectedPhotos));
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleArchive = async () => {
    if (!onArchive) return;

    setIsProcessing(true);
    try {
      await onArchive(Array.from(selectedPhotos));
      setSelectedPhotos(new Set());
    } catch (error) {
      console.error('Archive failed:', error);
    } finally {
      setIsProcessing(false);
      setShowConfirmDialog(false);
    }
  };

  const handleShare = async () => {
    if (!onShare) return;

    setIsProcessing(true);
    try {
      await onShare(Array.from(selectedPhotos));
    } catch (error) {
      console.error('Share failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getTotalSize = () => {
    let total = 0;
    selectedPhotos.forEach((id) => {
      const photo = photos.find((p) => p.id === id);
      if (photo) total += photo.size;
    });
    return formatSize(total);
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  if (photos.length === 0) {
    return null;
  }

  return (
    <>
      {/* Selection Bar */}
      {selectedPhotos.size > 0 && (
        <div className="sticky top-0 z-40 bg-blue-50 border-b border-blue-200 p-4 rounded-lg mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Checkbox
                checked={isAllSelected || isPartialSelected}
                onCheckedChange={toggleAllPhotos}
              />
              <div>
                <p className="font-semibold text-sm">
                  {selectedPhotos.size} photo{selectedPhotos.size !== 1 ? 's' : ''} selected
                </p>
                <p className="text-xs text-gray-600">Total size: {getTotalSize()}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {onDownload && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDownload}
                  disabled={isProcessing}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              )}

              {onShare && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleShare}
                  disabled={isProcessing}
                  className="gap-2"
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
              )}

              {onArchive && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setPendingAction('archive');
                    setShowConfirmDialog(true);
                  }}
                  disabled={isProcessing}
                  className="gap-2"
                >
                  <Archive className="h-4 w-4" />
                  Archive
                </Button>
              )}

              {onDelete && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    setPendingAction('delete');
                    setShowConfirmDialog(true);
                  }}
                  disabled={isProcessing}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Photo Grid with Checkboxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="relative group cursor-pointer"
            onClick={() => togglePhoto(photo.id)}
          >
            {/* Photo */}
            <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={photo.url}
                alt={photo.filename}
                className="w-full h-full object-cover"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />

              {/* Checkbox */}
              <div className="absolute top-3 left-3">
                <Checkbox
                  checked={selectedPhotos.has(photo.id)}
                  onCheckedChange={() => togglePhoto(photo.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="h-5 w-5"
                />
              </div>

              {/* Selection Indicator */}
              {selectedPhotos.has(photo.id) && (
                <div className="absolute inset-0 border-2 border-blue-500 rounded-lg" />
              )}
            </div>

            {/* Photo Info */}
            <p className="text-sm font-medium mt-2 truncate">{photo.filename}</p>
            <p className="text-xs text-gray-500">{formatSize(photo.size)}</p>
          </div>
        ))}
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              Confirm Action
            </DialogTitle>
            <DialogDescription>
              {pendingAction === 'delete'
                ? `Are you sure you want to delete ${selectedPhotos.size} photo(s)? This action cannot be undone.`
                : `Archive ${selectedPhotos.size} photo(s)?`}
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              variant={pendingAction === 'delete' ? 'destructive' : 'default'}
              onClick={async () => {
                if (pendingAction === 'delete') {
                  await handleDelete();
                } else if (pendingAction === 'archive') {
                  await handleArchive();
                }
              }}
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : pendingAction === 'delete' ? 'Delete' : 'Archive'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
