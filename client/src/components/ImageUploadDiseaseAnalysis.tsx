import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Upload, CheckCircle, AlertTriangle, Leaf, Bug } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AnalysisResult {
  diseaseId: string;
  diseaseName: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  affectedArea: number;
  symptoms: string[];
  treatments: string[];
  preventionMeasures: string[];
  processingTime: number;
  imageQuality: string;
}

export function ImageUploadDiseaseAnalysis() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [cropType, setCropType] = useState('rice');
  const [error, setError] = useState('');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Image size must be less than 10MB');
      return;
    }

    setSelectedFile(file);
    setError('');

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError('Please select an image first');
      return;
    }

    setIsAnalyzing(true);
    setError('');

    // Simulate API call
    setTimeout(() => {
      const mockResults: Record<string, AnalysisResult> = {
        rice: {
          diseaseId: 'rice-blast',
          diseaseName: 'Rice Blast',
          confidence: 87,
          severity: 'high',
          affectedArea: 25,
          symptoms: ['gray-brown spots on leaves', 'diamond-shaped lesions', 'panicle infection'],
          treatments: ['Tricyclazole 75% WP', 'Hexaconazole 5% SC'],
          preventionMeasures: ['Use resistant varieties', 'Proper spacing', 'Balanced fertilization'],
          processingTime: 2340,
          imageQuality: 'good',
        },
        wheat: {
          diseaseId: 'wheat-rust',
          diseaseName: 'Wheat Rust',
          confidence: 92,
          severity: 'medium',
          affectedArea: 15,
          symptoms: ['orange/brown pustules', 'powdery appearance', 'leaf yellowing'],
          treatments: ['Propiconazole 25% EC', 'Tebuconazole 25% EC'],
          preventionMeasures: ['Resistant varieties', 'Timely sowing', 'Crop rotation'],
          processingTime: 1890,
          imageQuality: 'excellent',
        },
        corn: {
          diseaseId: 'corn-leaf-blight',
          diseaseName: 'Corn Leaf Blight',
          confidence: 85,
          severity: 'medium',
          affectedArea: 20,
          symptoms: ['rectangular lesions', 'tan/brown coloring', 'spore formation'],
          treatments: ['Azoxystrobin 25% SC', 'Chlorothalonil 75% WP'],
          preventionMeasures: ['Crop rotation', 'Resistant hybrids', 'Field sanitation'],
          processingTime: 2100,
          imageQuality: 'good',
        },
      };

      setAnalysisResult(mockResults[cropType] || mockResults['rice']);
      setIsAnalyzing(false);
    }, 2000);
  };

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800',
    };
    return colors[severity] || colors['medium'];
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'high':
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      default:
        return <CheckCircle className="w-5 h-5 text-green-600" />;
    }
  };

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Disease Identification</h1>
        <p className="text-gray-600 mt-1">Upload crop photos for AI-powered disease analysis</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Upload Image</CardTitle>
            <CardDescription>Select a crop photo for analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Crop Type Selector */}
            <div>
              <label className="block text-sm font-medium mb-2">Crop Type</label>
              <select
                value={cropType}
                onChange={(e) => setCropType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="rice">Rice</option>
                <option value="wheat">Wheat</option>
                <option value="corn">Corn</option>
                <option value="potato">Potato</option>
              </select>
            </div>

            {/* File Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
              </label>
            </div>

            {/* Selected File Info */}
            {selectedFile && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-900">
                  ✓ {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)}MB)
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            {/* Analyze Button */}
            <Button
              onClick={handleAnalyze}
              disabled={!selectedFile || isAnalyzing}
              className="w-full"
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze Image'}
            </Button>
          </CardContent>
        </Card>

        {/* Preview Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Preview</CardTitle>
          </CardHeader>
          <CardContent>
            {preview ? (
              <div className="space-y-3">
                <img src={preview} alt="Preview" className="w-full h-64 object-cover rounded-lg" />
                <p className="text-xs text-gray-500">Image preview</p>
              </div>
            ) : (
              <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">No image selected</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Analysis Results */}
      {analysisResult && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {analysisResult.severity === 'critical' || analysisResult.severity === 'high' ? (
                  <Bug className="w-6 h-6 text-orange-600" />
                ) : (
                  <Leaf className="w-6 h-6 text-green-600" />
                )}
                <div>
                  <CardTitle className="text-lg">{analysisResult.diseaseName}</CardTitle>
                  <CardDescription>AI Analysis Results</CardDescription>
                </div>
              </div>
              <Badge className={getSeverityColor(analysisResult.severity)}>
                {analysisResult.severity.toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Confidence & Metrics */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 bg-white rounded-lg">
                <p className="text-xs text-gray-600">Confidence</p>
                <p className="text-2xl font-bold text-blue-600">{analysisResult.confidence}%</p>
              </div>
              <div className="p-3 bg-white rounded-lg">
                <p className="text-xs text-gray-600">Affected Area</p>
                <p className="text-2xl font-bold text-orange-600">{analysisResult.affectedArea}%</p>
              </div>
              <div className="p-3 bg-white rounded-lg">
                <p className="text-xs text-gray-600">Image Quality</p>
                <p className="text-sm font-semibold text-green-600">{analysisResult.imageQuality}</p>
              </div>
            </div>

            {/* Symptoms */}
            <div>
              <h3 className="font-semibold mb-2">Identified Symptoms</h3>
              <div className="space-y-2">
                {analysisResult.symptoms.map((symptom, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                    {symptom}
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Treatments */}
            <div>
              <h3 className="font-semibold mb-2">Recommended Treatments</h3>
              <div className="space-y-2">
                {analysisResult.treatments.map((treatment, idx) => (
                  <div key={idx} className="p-2 bg-white rounded text-sm">
                    {treatment}
                  </div>
                ))}
              </div>
            </div>

            {/* Prevention Measures */}
            <div>
              <h3 className="font-semibold mb-2">Prevention Measures</h3>
              <div className="space-y-2">
                {analysisResult.preventionMeasures.map((measure, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    {measure}
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <Button variant="outline" className="flex-1">Save Analysis</Button>
              <Button className="flex-1">Record Treatment</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
