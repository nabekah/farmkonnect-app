import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Users,
  History,
  Tag,
  Filter,
  Download,
  Share2,
  Clock,
  MapPin,
  User,
} from 'lucide-react';
import { useCollaborativeAnnotations } from '@/lib/collaborativeAnnotations';
import { usePhotoVersioning } from '@/lib/photoVersioning';
import { useSmartPhotoOrganization } from '@/lib/smartPhotoOrganization';

interface Photo {
  id: number;
  url: string;
  filename: string;
  timestamp: number;
  workerId: number;
  workerName: string;
}

interface IntegratedPhotoManagerProps {
  photos: Photo[];
  currentUserId: number;
  currentUserName: string;
}

export function IntegratedPhotoManager({
  photos,
  currentUserId,
  currentUserName,
}: IntegratedPhotoManagerProps) {
  const [selectedPhotoId, setSelectedPhotoId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('collaboration');

  const selectedPhoto = photos.find((p) => p.id === selectedPhotoId);

  // Initialize hooks for selected photo
  const collaboration = selectedPhotoId
    ? useCollaborativeAnnotations(selectedPhotoId, currentUserId, currentUserName)
    : null;

  const versioning = selectedPhotoId
    ? usePhotoVersioning(selectedPhotoId)
    : null;

  const organization = useSmartPhotoOrganization(
    photos.map((p) => ({
      photoId: p.id,
      tags: [],
      timestamp: p.timestamp,
      workerId: p.workerId,
      workerName: p.workerName,
    }))
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Photo Selection Panel */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Photos</CardTitle>
            <CardDescription>Select a photo to manage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {photos.map((photo) => (
                <button
                  key={photo.id}
                  onClick={() => setSelectedPhotoId(photo.id)}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                    selectedPhotoId === photo.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-medium text-sm truncate">{photo.filename}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(photo.timestamp).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-500">{photo.workerName}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Panel */}
      <div className="lg:col-span-2">
        {selectedPhoto ? (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="collaboration" className="gap-2">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Collaborate</span>
              </TabsTrigger>
              <TabsTrigger value="versions" className="gap-2">
                <History className="h-4 w-4" />
                <span className="hidden sm:inline">Versions</span>
              </TabsTrigger>
              <TabsTrigger value="organization" className="gap-2">
                <Tag className="h-4 w-4" />
                <span className="hidden sm:inline">Tags</span>
              </TabsTrigger>
            </TabsList>

            {/* Collaboration Tab */}
            <TabsContent value="collaboration" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Collaborative Annotations</CardTitle>
                  <CardDescription>
                    Real-time collaboration with {collaboration?.activeUsers.length || 0} active user
                    {collaboration?.activeUsers && collaboration.activeUsers.length !== 1 ? 's' : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Active Users */}
                  {collaboration?.activeUsers && collaboration.activeUsers.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">Active Users</h4>
                      <div className="flex flex-wrap gap-2">
                        {collaboration.activeUsers.map((user) => (
                          <Badge
                            key={user.userId}
                            style={{ backgroundColor: user.userColor }}
                            className="text-white"
                          >
                            {user.userName}
                            {user.isDrawing && ' (drawing)'}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Annotations */}
                  {collaboration?.annotations && collaboration.annotations.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">
                        Annotations ({collaboration.annotations.length})
                      </h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {collaboration.annotations.map((annotation) => (
                          <div
                            key={annotation.id}
                            className="p-2 bg-gray-50 rounded border-l-4"
                            style={{ borderColor: annotation.userColor }}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium">{annotation.userName}</p>
                                <p className="text-xs text-gray-600">
                                  {annotation.type} • {new Date(annotation.timestamp).toLocaleTimeString()}
                                </p>
                              </div>
                              {annotation.isLocked && (
                                <Badge variant="outline" className="text-xs">
                                  Locked
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {!collaboration?.annotations || collaboration.annotations.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No annotations yet. Start collaborating!
                    </p>
                  ) : null}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Versions Tab */}
            <TabsContent value="versions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Version History</CardTitle>
                  <CardDescription>
                    {versioning?.stats?.totalVersions || 0} version
                    {versioning?.stats?.totalVersions !== 1 ? 's' : ''} • Total size:{' '}
                    {versioning?.stats?.totalSize
                      ? (versioning.stats.totalSize / 1024 / 1024).toFixed(2)
                      : 0}{' '}
                    MB
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Version Stats */}
                  {versioning?.stats && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-3 rounded">
                        <p className="text-xs text-gray-600">Total Versions</p>
                        <p className="text-xl font-bold">{versioning.stats.totalVersions}</p>
                      </div>
                      <div className="bg-green-50 p-3 rounded">
                        <p className="text-xs text-gray-600">Avg Annotations</p>
                        <p className="text-xl font-bold">
                          {versioning.stats.averageAnnotationsPerVersion}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Versions List */}
                  {versioning?.versions && versioning.versions.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">Versions</h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {versioning.versions.map((version) => (
                          <div
                            key={version.versionId}
                            className={`p-3 rounded border-2 ${
                              version.isCurrent ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium">{version.changeDescription}</p>
                                <p className="text-xs text-gray-600">
                                  {version.createdByName} •{' '}
                                  {new Date(version.createdAt).toLocaleString()}
                                </p>
                              </div>
                              {version.isCurrent && (
                                <Badge className="bg-blue-500">Current</Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {!versioning?.versions || versioning.versions.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No versions yet. Create an annotated version to start tracking history.
                    </p>
                  ) : null}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Organization Tab */}
            <TabsContent value="organization" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Smart Organization</CardTitle>
                  <CardDescription>
                    {organization.stats?.totalTags || 0} total tags •{' '}
                    {organization.stats?.autoDetectedPercentage || 0}% auto-detected
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Filter Presets */}
                  {organization.presets && organization.presets.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">Filter Presets</h4>
                      <div className="space-y-2">
                        {organization.presets.map((preset) => (
                          <Button
                            key={preset.id}
                            variant="outline"
                            className="w-full justify-start text-left"
                            onClick={() => organization.applyPreset(preset.id)}
                          >
                            <Filter className="h-4 w-4 mr-2" />
                            <div>
                              <p className="font-medium text-sm">{preset.name}</p>
                              <p className="text-xs text-gray-600">{preset.description}</p>
                            </div>
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tag Statistics */}
                  {organization.stats && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">Tag Statistics</h4>
                      <div className="space-y-2 text-sm">
                        {Object.entries(organization.stats.tagsByCategory || {}).map(
                          ([category, count]: [string, any]) => (
                            <div key={category} className="flex justify-between">
                              <span className="capitalize text-gray-600">{category}:</span>
                              <span className="font-medium">{String(count)}</span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* Most Used Tags */}
                  {organization.stats?.mostUsedTags && organization.stats.mostUsedTags.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">Most Used Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {organization.stats.mostUsedTags.map((tag: any) => (
                          <Badge key={tag.name} variant="secondary">
                            {tag.name} ({tag.count})
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Export Button */}
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => {
                      const csv = organization.exportAsCSV();
                      const link = document.createElement('a');
                      link.href = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
                      link.download = `photo-tags-${Date.now()}.csv`;
                      link.click();
                    }}
                  >
                    <Download className="h-4 w-4" />
                    Export Tags as CSV
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <p className="text-gray-500">Select a photo to view details</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
