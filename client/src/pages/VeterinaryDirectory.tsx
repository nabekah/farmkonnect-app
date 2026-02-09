import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, MapPin, Phone, Mail, Star, Video, AlertCircle } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/hooks/useAuth';

export default function VeterinaryDirectory() {
  const { user } = useAuth();
  const [selectedSpecialization, setSelectedSpecialization] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('');

  // Fetch veterinarians from tRPC
  const { data: searchResults, isLoading } = trpc.veterinaryDirectory.search.useQuery(
    {
      region: selectedRegion || undefined,
      specialty: selectedSpecialization || undefined,
      verified: true,
      limit: 20,
      offset: 0,
    },
    { enabled: true }
  );

  // Fetch featured veterinarians
  const { data: featured } = trpc.veterinaryDirectory.getFeatured.useQuery(
    { limit: 5 },
    { enabled: true }
  );

  // Fetch statistics
  const { data: stats } = trpc.veterinaryDirectory.getStatistics.useQuery(
    { region: selectedRegion || undefined },
    { enabled: true }
  );

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-lg font-semibold">Please log in to view the veterinary directory</p>
        </div>
      </div>
    );
  }

  const veterinarians = searchResults?.data || [];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Veterinary Directory</h1>
        <p className="text-muted-foreground mt-2">Find qualified veterinarians in Ghana</p>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Veterinarians</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalVeterinarians}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Average Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="text-2xl font-bold mr-2">{stats.averageRating}</div>
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Emergency Available</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.emergencyAvailable}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Avg. Consultation Fee</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">GHS {stats.averageConsultationFee}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Veterinarians</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Specialization</label>
              <select
                value={selectedSpecialization}
                onChange={(e) => setSelectedSpecialization(e.target.value)}
                className="w-full mt-2 px-3 py-2 border rounded-md"
              >
                <option value="">All Specializations</option>
                <option value="Cattle">Cattle</option>
                <option value="Small Ruminants">Small Ruminants</option>
                <option value="Poultry">Poultry</option>
                <option value="Mixed Animals">Mixed Animals</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Region</label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full mt-2 px-3 py-2 border rounded-md"
              >
                <option value="">All Regions</option>
                <option value="Ashanti">Ashanti</option>
                <option value="Greater Accra">Greater Accra</option>
                <option value="Eastern">Eastern</option>
                <option value="Western">Western</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Veterinarian Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          <div className="col-span-2 text-center py-8">
            <p className="text-gray-500">Loading veterinarians...</p>
          </div>
        ) : veterinarians && veterinarians.length > 0 ? (
          veterinarians.map((vet: any) => (
            <Card key={vet.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="w-5 h-5 text-red-500" />
                      {vet.name}
                    </CardTitle>
                    <CardDescription>{vet.clinicName}</CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{vet.averageRating}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{vet.totalReviews} reviews</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">License</p>
                  <p className="text-sm">{vet.licenseNumber}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground">Specialization</p>
                  <Badge variant="secondary">{vet.specialty}</Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Experience</p>
                    <p className="font-semibold">{vet.yearsOfExperience} years</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Consultation Fee</p>
                    <p className="font-semibold">GHS {vet.consultationFee}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>{vet.region}</span>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button className="flex-1" variant="default">
                    Schedule Appointment
                  </Button>
                  {vet.emergencyAvailable && (
                    <Button className="flex-1" variant="outline">
                      <Heart className="w-4 h-4 mr-2" />
                      Emergency
                    </Button>
                  )}
                </div>

                <div className="flex gap-2 text-sm text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span>{vet.phone}</span>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="col-span-2">
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">No veterinarians found matching your criteria</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
