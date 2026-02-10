import React, { useState, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, X, Eye, Edit2, Check, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface ReceiptUploadGalleryProps {
  expenseId: number;
  farmId: string;
  onReceiptUpdated?: () => void;
}

export function ReceiptUploadGallery({ expenseId, farmId, onReceiptUpdated }: ReceiptUploadGalleryProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [editingReceipt, setEditingReceipt] = useState<any>(null);
  const [editFormData, setEditFormData] = useState<any>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch receipts
  const { data: receipts, isLoading, refetch } = trpc.expenseReceipts.getReceiptsForExpense.useQuery({
    expenseId
  });

  // Upload mutation
  const uploadMutation = trpc.expenseReceipts.uploadReceipt.useMutation({
    onSuccess: () => {
      refetch();
      onReceiptUpdated?.();
    }
  });

  // Update OCR data mutation
  const updateOCRMutation = trpc.expenseReceipts.updateReceiptOCRData.useMutation({
    onSuccess: () => {
      refetch();
      setEditingReceipt(null);
      onReceiptUpdated?.();
    }
  });

  // Delete mutation
  const deleteMutation = trpc.expenseReceipts.deleteReceipt.useMutation({
    onSuccess: () => {
      refetch();
      setSelectedReceipt(null);
      onReceiptUpdated?.();
    }
  });

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64Data = (e.target?.result as string).split(",")[1];
      await uploadMutation.mutateAsync({
        expenseId,
        farmId,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        base64Data
      });
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateOCR = async () => {
    if (!editingReceipt) return;

    await updateOCRMutation.mutateAsync({
      receiptId: editingReceipt.id,
      extractedAmount: editFormData.extractedAmount ? parseFloat(editFormData.extractedAmount) : undefined,
      extractedDate: editFormData.extractedDate ? new Date(editFormData.extractedDate) : undefined,
      extractedVendor: editFormData.extractedVendor,
      extractedDescription: editFormData.extractedDescription,
      autoUpdateExpense: true
    });
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "text-green-600";
    if (confidence >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getConfidenceBg = (confidence: number) => {
    if (confidence >= 90) return "bg-green-50 border-green-200";
    if (confidence >= 70) return "bg-yellow-50 border-yellow-200";
    return "bg-red-50 border-red-200";
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Receipt</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragging
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
            }`}
          >
            <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm font-medium text-gray-700">
              Drag and drop your receipt here or click to browse
            </p>
            <p className="text-xs text-gray-500 mt-1">PNG, JPG, or PDF (max 10MB)</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            />
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadMutation.isPending}
            >
              {uploadMutation.isPending ? "Uploading..." : "Select File"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Receipts Gallery */}
      {receipts && receipts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Receipt Gallery ({receipts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {receipts.map((receipt: any) => (
                <div
                  key={receipt.id}
                  className={`border rounded-lg overflow-hidden cursor-pointer transition-all hover:shadow-lg ${
                    selectedReceipt?.id === receipt.id ? "ring-2 ring-blue-500" : ""
                  }`}
                  onClick={() => setSelectedReceipt(receipt)}
                >
                  {/* Receipt Image Thumbnail */}
                  <div className="h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
                    <img
                      src={receipt.receiptUrl}
                      alt={receipt.fileName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23f3f4f6' width='100' height='100'/%3E%3Ctext x='50' y='50' text-anchor='middle' dy='.3em' font-family='sans-serif' font-size='12' fill='%239ca3af'%3ENo Image%3C/text%3E%3C/svg%3E";
                      }}
                    />
                  </div>

                  {/* Receipt Info */}
                  <div className="p-3 space-y-2">
                    <p className="text-sm font-medium truncate">{receipt.fileName}</p>

                    {/* OCR Status */}
                    {receipt.ocrProcessed ? (
                      <div className={`p-2 rounded border ${getConfidenceBg(Number(receipt.ocrConfidence || 0))}`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium">OCR Confidence</span>
                          <span className={`text-sm font-bold ${getConfidenceColor(Number(receipt.ocrConfidence || 0))}`}>
                            {Math.round(Number(receipt.ocrConfidence || 0))}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full transition-all ${
                              Number(receipt.ocrConfidence || 0) >= 90
                                ? "bg-green-500"
                                : Number(receipt.ocrConfidence || 0) >= 70
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                            style={{ width: `${receipt.ocrConfidence || 0}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="p-2 bg-gray-100 rounded border border-gray-200 text-xs text-gray-600">
                        Processing OCR...
                      </div>
                    )}

                    {/* Extracted Data Preview */}
                    {receipt.extractedAmount && (
                      <div className="text-xs space-y-1 bg-blue-50 p-2 rounded">
                        <p className="font-medium">
                          Amount: <span className="font-bold">GHS {Number(receipt.extractedAmount).toFixed(2)}</span>
                        </p>
                        {receipt.extractedVendor && <p>Vendor: {receipt.extractedVendor}</p>}
                        {receipt.extractedDate && <p>Date: {receipt.extractedDate}</p>}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          setEditingReceipt(receipt);
                          setEditFormData({
                            extractedAmount: receipt.extractedAmount,
                            extractedDate: receipt.extractedDate,
                            extractedVendor: receipt.extractedVendor,
                            extractedDescription: receipt.extractedDescription
                          });
                        }}
                      >
                        <Edit2 className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-red-600 hover:text-red-700"
                        onClick={() => deleteMutation.mutate({ receiptId: receipt.id })}
                      >
                        <X className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Receipt Detail Modal */}
      {selectedReceipt && !editingReceipt && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Receipt Details</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedReceipt(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Full Image */}
            <div className="max-h-96 overflow-auto">
              <img
                src={selectedReceipt.receiptUrl}
                alt={selectedReceipt.fileName}
                className="w-full rounded border"
              />
            </div>

            {/* OCR Data */}
            {selectedReceipt.ocrProcessed && (
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Extracted Information</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-white rounded border">
                    <p className="text-xs text-gray-600">Amount</p>
                    <p className="text-lg font-bold">
                      {selectedReceipt.extractedAmount ? `GHS ${Number(selectedReceipt.extractedAmount).toFixed(2)}` : "—"}
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded border">
                    <p className="text-xs text-gray-600">Date</p>
                    <p className="text-lg font-bold">{selectedReceipt.extractedDate || "—"}</p>
                  </div>
                  <div className="p-3 bg-white rounded border col-span-2">
                    <p className="text-xs text-gray-600">Vendor</p>
                    <p className="text-sm font-medium">{selectedReceipt.extractedVendor || "—"}</p>
                  </div>
                  <div className="p-3 bg-white rounded border col-span-2">
                    <p className="text-xs text-gray-600">Description</p>
                    <p className="text-sm">{selectedReceipt.extractedDescription || "—"}</p>
                  </div>
                </div>
              </div>
            )}

            <Button
              onClick={() => {
                setEditingReceipt(selectedReceipt);
                setEditFormData({
                  extractedAmount: selectedReceipt.extractedAmount,
                  extractedDate: selectedReceipt.extractedDate,
                  extractedVendor: selectedReceipt.extractedVendor,
                  extractedDescription: selectedReceipt.extractedDescription
                });
              }}
              className="w-full"
            >
              <Edit2 className="h-4 w-4 mr-2" />
              Edit OCR Data
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Edit Form */}
      {editingReceipt && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Edit Receipt Data</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditingReceipt(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Amount (GHS)</label>
              <input
                type="number"
                step="0.01"
                value={editFormData.extractedAmount || ""}
                onChange={(e) => setEditFormData({ ...editFormData, extractedAmount: e.target.value })}
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input
                type="date"
                value={editFormData.extractedDate || ""}
                onChange={(e) => setEditFormData({ ...editFormData, extractedDate: e.target.value })}
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Vendor</label>
              <input
                type="text"
                value={editFormData.extractedVendor || ""}
                onChange={(e) => setEditFormData({ ...editFormData, extractedVendor: e.target.value })}
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={editFormData.extractedDescription || ""}
                onChange={(e) => setEditFormData({ ...editFormData, extractedDescription: e.target.value })}
                className="w-full border rounded px-3 py-2 text-sm"
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleUpdateOCR}
                disabled={updateOCRMutation.isPending}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <Check className="h-4 w-4 mr-2" />
                {updateOCRMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setEditingReceipt(null)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && (!receipts || receipts.length === 0) && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Upload className="h-12 w-12 text-gray-300 mb-3" />
            <p className="text-gray-500 text-center">
              No receipts uploaded yet. Upload a receipt image to get started.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
