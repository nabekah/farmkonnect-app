import { useState, useEffect, useMemo } from 'react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { useWebSocket } from '@/hooks/useWebSocket';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { MapPin, Camera, Clock, User, Filter, Download, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Activity {
  id: string;
  logId: string;
  title: string;
  description: string;
  activityType: string;
  gpsLatitude: number | null;
  gpsLongitude: number | null;
  photoUrls: string[];
  createdAt: Date | string;
  status: string;
}

export function ViewAllActivities() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTitle, setSearchTitle] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'type' | 'status' | 'title'>('date');
  const [sortAscending, setSortAscending] = useState(false);

  const farmId = 1; // Default to farm 1 for field workers

  // Fetch real activities from database
  const { data: activitiesData, isLoading, refetch } = trpc.fieldWorker.getActivityLogs.useQuery(
    { farmId, limit: 100 },
    { enabled: !!farmId }
  );

  // Set up WebSocket listeners for real-time updates
  useWebSocket({
    onActivityCreated: (data: any) => {
      refetch();
      toast.success('New Activity', { description: `Activity logged: ${data.activityType}` });
    },
    onActivityUpdated: () => refetch(),
  });

  // Update activities when data changes
  useEffect(() => {
    if (activitiesData && Array.isArray(activitiesData)) {
      const mappedActivities: Activity[] = activitiesData.map((log: any) => {
        // Convert GPS coordinates to numbers, handling string and null values
        const gpsLat = log.gpsLatitude ? Number(log.gpsLatitude) : null;
        const gpsLng = log.gpsLongitude ? Number(log.gpsLongitude) : null;
        
        return {
          id: log.id?.toString() || log.logId,
          logId: log.logId,
          title: log.title,
          description: log.description || '',
          activityType: log.activityType,
          gpsLatitude: gpsLat,
          gpsLongitude: gpsLng,
          photoUrls: log.photoUrls || [],
          createdAt: log.createdAt,
          status: log.status,
        };
      });
      setActivities(mappedActivities);
    }
  }, [activitiesData]);

  // Filter and sort activities
  useEffect(() => {
    let filtered = activities;

    // Filter by type
    if (filterType) {
      filtered = filtered.filter((a) => a.activityType === filterType);
    }

    // Filter by status
    if (filterStatus) {
      filtered = filtered.filter((a) => a.status === filterStatus);
    }

    // Filter by title
    if (searchTitle) {
      filtered = filtered.filter((a) =>
        a.title.toLowerCase().includes(searchTitle.toLowerCase())
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let compareA: any;
      let compareB: any;

      if (sortBy === 'date') {
        compareA = new Date(a.createdAt).getTime();
        compareB = new Date(b.createdAt).getTime();
      } else if (sortBy === 'type') {
        compareA = a.activityType;
        compareB = b.activityType;
      } else if (sortBy === 'status') {
        compareA = a.status;
        compareB = b.status;
      } else if (sortBy === 'title') {
        compareA = a.title;
        compareB = b.title;
      }

      if (compareA < compareB) return sortAscending ? -1 : 1;
      if (compareA > compareB) return sortAscending ? 1 : -1;
      return 0;
    });

    setActivities(filtered);
  }, [filterType, filterStatus, searchTitle, sortBy, sortAscending]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRecords(activities.map((a) => a.id));
    } else {
      setSelectedRecords([]);
    }
  };

  const handleSelectRecord = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedRecords([...selectedRecords, id]);
    } else {
      setSelectedRecords(selectedRecords.filter((r) => r !== id));
    }
  };

  const activityTypes = [
    'crop_health',
    'pest_monitoring',
    'disease_detection',
    'irrigation',
    'fertilizer_application',
    'weed_control',
    'harvest',
    'equipment_check',
    'soil_test',
    'weather_observation',
    'general_note',
  ];

  const statuses = ['draft', 'submitted', 'reviewed'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading activities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Activity Records</h1>
        <p className="text-muted-foreground">View and manage all field activities</p>
      </div>

      {/* Filters */}
      <Card className="p-4 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4" />
          <h3 className="font-semibold">Filters</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Search by title..."
            value={searchTitle}
            onChange={(e) => setSearchTitle(e.target.value)}
          />

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger>
              <SelectValue placeholder="Activity Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Types</SelectItem>
              {activityTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type.replace(/_/g, ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
              {statuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="type">Type</SelectItem>
              <SelectItem value="status">Status</SelectItem>
              <SelectItem value="title">Title</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortAscending(!sortAscending)}
          >
            {sortAscending ? '↑ Ascending' : '↓ Descending'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setFilterType('');
              setFilterStatus('');
              setSearchTitle('');
            }}
          >
            Clear Filters
          </Button>
        </div>
      </Card>

      {/* Bulk Actions */}
      {selectedRecords.length > 0 && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <span className="font-semibold">{selectedRecords.length} record(s) selected</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Activities Table */}
      <div className="space-y-4">
        {activities.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            <p>No activities found. Start logging activities to see them here.</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {/* Header with Select All */}
            <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
              <Checkbox
                checked={selectedRecords.length === activities.length && activities.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm font-medium flex-1">
                {activities.length} activities
              </span>
            </div>

            {/* Activity Cards */}
            {activities.map((activity) => (
              <Card key={activity.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <Checkbox
                    checked={selectedRecords.includes(activity.id)}
                    onCheckedChange={(checked) =>
                      handleSelectRecord(activity.id, checked as boolean)
                    }
                  />

                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{activity.title}</h3>
                        <p className="text-sm text-muted-foreground">{activity.description}</p>
                      </div>
                      <div className="flex gap-2">
                        {activity.status === 'reviewed' && (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        )}
                        {activity.status === 'submitted' && (
                          <AlertCircle className="h-5 w-5 text-blue-600" />
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <span className="font-medium">Type:</span>
                        <span>{activity.activityType.replace(/_/g, ' ')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{new Date(activity.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">Status:</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          activity.status === 'reviewed' ? 'bg-green-100 text-green-800' :
                          activity.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {activity.status}
                        </span>
                      </div>
                      {activity.gpsLatitude && activity.gpsLongitude && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>
                            {activity.gpsLatitude.toFixed(4)}, {activity.gpsLongitude.toFixed(4)}
                          </span>
                        </div>
                      )}
                      {activity.photoUrls && activity.photoUrls.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Camera className="h-4 w-4" />
                          <span>{activity.photoUrls.length} photo(s)</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
