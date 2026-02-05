import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertCircle, Camera, CheckCircle2, Clock, FileText, Signature, Upload } from 'lucide-react';

interface TaskCompletionWorkflowProps {
  taskId: string;
  taskTitle: string;
  taskDescription: string;
  requiredPhotos?: number;
  onComplete: (data: TaskCompletionData) => Promise<void>;
  isLoading?: boolean;
}

export interface TaskCompletionData {
  taskId: string;
  completionNotes: string;
  photos: File[];
  signOffName: string;
  signOffEmail: string;
  completionTime: Date;
  photoDescriptions: Record<string, string>;
}

type WorkflowStep = 'overview' | 'photos' | 'notes' | 'signoff' | 'review' | 'submitted';

export function TaskCompletionWorkflow({
  taskId,
  taskTitle,
  taskDescription,
  requiredPhotos = 1,
  onComplete,
  isLoading = false,
}: TaskCompletionWorkflowProps) {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('overview');
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoDescriptions, setPhotoDescriptions] = useState<Record<string, string>>({});
  const [completionNotes, setCompletionNotes] = useState('');
  const [signOffName, setSignOffName] = useState('');
  const [signOffEmail, setSignOffEmail] = useState('');
  const [completionTime] = useState(new Date());
  const [error, setError] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setPhotos((prev) => [...prev, ...files]);
    // Initialize descriptions for new photos
    files.forEach((file) => {
      if (!photoDescriptions[file.name]) {
        setPhotoDescriptions((prev) => ({
          ...prev,
          [file.name]: '',
        }));
      }
    });
  };

  const removePhoto = (fileName: string) => {
    setPhotos((prev) => prev.filter((f) => f.name !== fileName));
    const newDescriptions = { ...photoDescriptions };
    delete newDescriptions[fileName];
    setPhotoDescriptions(newDescriptions);
  };

  const validateStep = (step: WorkflowStep): boolean => {
    switch (step) {
      case 'photos':
        if (photos.length < requiredPhotos) {
          setError(`Please upload at least ${requiredPhotos} photo(s)`);
          return false;
        }
        return true;
      case 'notes':
        if (!completionNotes.trim()) {
          setError('Please provide completion notes');
          return false;
        }
        return true;
      case 'signoff':
        if (!signOffName.trim() || !signOffEmail.trim()) {
          setError('Please provide sign-off name and email');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNextStep = () => {
    setError('');
    if (!validateStep(currentStep)) return;

    const steps: WorkflowStep[] = ['overview', 'photos', 'notes', 'signoff', 'review'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const handlePrevStep = () => {
    const steps: WorkflowStep[] = ['overview', 'photos', 'notes', 'signoff', 'review'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const handleSubmit = async () => {
    setError('');
    if (!validateStep('signoff')) return;

    try {
      await onComplete({
        taskId,
        completionNotes,
        photos,
        signOffName,
        signOffEmail,
        completionTime,
        photoDescriptions,
      });
      setCurrentStep('submitted');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete task');
    }
  };

  const progressPercentage = (() => {
    const steps = ['overview', 'photos', 'notes', 'signoff', 'review'];
    const currentIndex = steps.indexOf(currentStep);
    return ((currentIndex + 1) / steps.length) * 100;
  })();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <CheckCircle2 className="h-4 w-4" />
          Complete Task
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Complete Task: {taskTitle}</DialogTitle>
          <DialogDescription>Follow the steps to complete and sign off on this task</DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Step Indicator */}
        <div className="flex gap-2 justify-between text-xs">
          {['Overview', 'Photos', 'Notes', 'Sign-off', 'Review'].map((label, idx) => (
            <div key={label} className="flex flex-col items-center flex-1">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold mb-1 ${
                  idx <= ['overview', 'photos', 'notes', 'signoff', 'review'].indexOf(currentStep)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}
              >
                {idx + 1}
              </div>
              <span className="text-center">{label}</span>
            </div>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Step Content */}
        <div className="space-y-4">
          {currentStep === 'overview' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Task Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Task Description</h4>
                  <p className="text-sm text-gray-600">{taskDescription}</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm">
                    <strong>Required:</strong> At least {requiredPhotos} photo(s), completion notes, and manager sign-off
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 'photos' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Upload Photos ({photos.length}/{requiredPhotos})
                </CardTitle>
                <CardDescription>Upload photos documenting task completion</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label htmlFor="photo-upload" className="cursor-pointer">
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="h-8 w-8 text-gray-400" />
                      <span className="text-sm font-medium">Click to upload or drag and drop</span>
                      <span className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</span>
                    </div>
                  </label>
                </div>

                {photos.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold">Uploaded Photos</h4>
                    {photos.map((photo) => (
                      <div key={photo.name} className="border rounded-lg p-3">
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-sm font-medium truncate">{photo.name}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removePhoto(photo.name)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Remove
                          </Button>
                        </div>
                        <Textarea
                          placeholder="Describe what this photo shows..."
                          value={photoDescriptions[photo.name] || ''}
                          onChange={(e) =>
                            setPhotoDescriptions((prev) => ({
                              ...prev,
                              [photo.name]: e.target.value,
                            }))
                          }
                          className="text-xs"
                          rows={2}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {currentStep === 'notes' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Completion Notes
                </CardTitle>
                <CardDescription>Describe what was accomplished</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Provide detailed notes about task completion, any observations, issues encountered, etc."
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  rows={6}
                />
              </CardContent>
            </Card>
          )}

          {currentStep === 'signoff' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Signature className="h-5 w-5" />
                  Manager Sign-off
                </CardTitle>
                <CardDescription>Manager approval information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Manager Name</label>
                  <Input
                    placeholder="Enter manager name"
                    value={signOffName}
                    onChange={(e) => setSignOffName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Manager Email</label>
                  <Input
                    type="email"
                    placeholder="Enter manager email"
                    value={signOffEmail}
                    onChange={(e) => setSignOffEmail(e.target.value)}
                  />
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600">
                    A sign-off request will be sent to the manager for approval
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 'review' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Review & Submit</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{photos.length} photos</Badge>
                    <span className="text-sm text-gray-600">uploaded</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{completionNotes.length} characters</Badge>
                    <span className="text-sm text-gray-600">in notes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{signOffName}</Badge>
                    <span className="text-sm text-gray-600">manager</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{completionTime.toLocaleString()}</span>
                  </div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <p className="text-sm text-green-700">
                    Ready to submit. The manager will receive a sign-off request.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 'submitted' && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="text-center space-y-3">
                  <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto" />
                  <h3 className="font-semibold text-lg text-green-900">Task Submitted Successfully!</h3>
                  <p className="text-sm text-green-700">
                    Your task completion has been submitted for manager approval. You will receive a notification once it's reviewed.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Navigation Buttons */}
        {currentStep !== 'submitted' && (
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={handlePrevStep}
              disabled={currentStep === 'overview' || isLoading}
            >
              Previous
            </Button>
            {currentStep === 'review' ? (
              <Button onClick={handleSubmit} disabled={isLoading} className="gap-2">
                {isLoading ? 'Submitting...' : 'Submit Task'}
              </Button>
            ) : (
              <Button onClick={handleNextStep} disabled={isLoading}>
                Next
              </Button>
            )}
          </div>
        )}

        {currentStep === 'submitted' && (
          <div className="flex gap-2 justify-end">
            <Button
              onClick={() => {
                setIsOpen(false);
                setCurrentStep('overview');
              }}
            >
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
