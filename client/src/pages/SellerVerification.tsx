import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Shield, Upload, CheckCircle2, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";

const documentTypes = [
  { value: "business_license", label: "Business License" },
  { value: "tax_id", label: "Tax ID / TIN" },
  { value: "national_id", label: "National ID (Ghana Card)" },
  { value: "company_registration", label: "Company Registration Certificate" },
];

const statusConfig = {
  pending: { label: "Pending Review", icon: Clock, color: "bg-yellow-500" },
  approved: { label: "Verified", icon: CheckCircle2, color: "bg-green-500" },
  rejected: { label: "Rejected", icon: XCircle, color: "bg-red-500" },
};

export default function SellerVerification() {
  const [documentType, setDocumentType] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const { data: verificationStatus, refetch } = trpc.marketplace.getVerificationStatus.useQuery();

  const submitVerification = trpc.marketplace.submitVerification.useMutation({
    onSuccess: () => {
      toast.success("Verification documents submitted successfully");
      setFile(null);
      setDocumentType("");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit verification");
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Validate file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }
      
      // Validate file type
      const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
      if (!allowedTypes.includes(selectedFile.type)) {
        toast.error("Only PDF, JPG, and PNG files are allowed");
        return;
      }
      
      setFile(selectedFile);
    }
  };

  const handleSubmit = async () => {
    if (!file || !documentType) {
      toast.error("Please select document type and upload a file");
      return;
    }

    setUploading(true);

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;
        
        await submitVerification.mutateAsync({
          documentData: base64Data,
          documentType,
          fileName: file.name,
          mimeType: file.type,
        });
        
        setUploading(false);
      };
      reader.onerror = () => {
        toast.error("Failed to read file");
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setUploading(false);
    }
  };

  const StatusIcon = verificationStatus?.status ? statusConfig[verificationStatus.status as keyof typeof statusConfig].icon : Shield;

  return (
    <div className="container max-w-4xl py-6 space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Seller Verification</h1>
          <p className="text-muted-foreground">Build trust with buyers by verifying your seller account</p>
        </div>
      </div>

      {/* Current Status */}
      {verificationStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <StatusIcon className="h-5 w-5" />
              Verification Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current Status</p>
                <Badge className={`${statusConfig[verificationStatus.status as keyof typeof statusConfig].color} text-white mt-1`}>
                  {statusConfig[verificationStatus.status as keyof typeof statusConfig].label}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Document Type</p>
                <p className="font-medium mt-1">
                  {documentTypes.find(t => t.value === verificationStatus.documentType)?.label || verificationStatus.documentType}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Submitted</p>
                <p className="font-medium mt-1">
                  {new Date(verificationStatus.submittedAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {verificationStatus.status === "rejected" && verificationStatus.notes && (
              <div className="bg-destructive/10 p-4 rounded-lg">
                <p className="text-sm font-semibold text-destructive mb-1">Rejection Reason:</p>
                <p className="text-sm">{verificationStatus.notes}</p>
              </div>
            )}

            {verificationStatus.status === "approved" && (
              <div className="bg-green-500/10 p-4 rounded-lg flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-semibold text-green-700 dark:text-green-400">Your seller account is verified!</p>
                  <p className="text-sm text-muted-foreground">Buyers will see a verification badge on your products.</p>
                </div>
              </div>
            )}

            {verificationStatus.status === "pending" && (
              <div className="bg-yellow-500/10 p-4 rounded-lg flex items-center gap-3">
                <Clock className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-semibold text-yellow-700 dark:text-yellow-400">Verification under review</p>
                  <p className="text-sm text-muted-foreground">Our team is reviewing your documents. This usually takes 1-2 business days.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Submit New Verification */}
      {(!verificationStatus || verificationStatus.status === "rejected") && (
        <Card>
          <CardHeader>
            <CardTitle>Submit Verification Documents</CardTitle>
            <CardDescription>
              Upload official documents to verify your seller identity. Accepted formats: PDF, JPG, PNG (max 10MB)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="documentType">Document Type</Label>
              <Select value={documentType} onValueChange={setDocumentType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="document">Upload Document</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="document"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="flex-1"
                />
                {file && (
                  <Badge variant="outline" className="whitespace-nowrap">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </Badge>
                )}
              </div>
              {file && (
                <p className="text-sm text-muted-foreground">
                  Selected: {file.name}
                </p>
              )}
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!file || !documentType || uploading}
              className="w-full"
            >
              {uploading ? (
                <>
                  <Upload className="mr-2 h-4 w-4 animate-pulse" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Submit for Verification
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Benefits */}
      <Card>
        <CardHeader>
          <CardTitle>Benefits of Verification</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              <span className="text-sm">Verified badge displayed on all your products</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              <span className="text-sm">Increased buyer trust and confidence</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              <span className="text-sm">Higher visibility in search results</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              <span className="text-sm">Access to premium seller features</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
