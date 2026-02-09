import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, MapPin, Phone, Mail, Star, Video } from 'lucide-react';

export default function VeterinaryDirectory() {
  const [selectedSpecialization, setSelectedSpecialization] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');

  const veterinarians = [
    {
      id: 1,
      name: 'Dr. Kwame Osei',
      license: 'GVC-2019-0456',
      specialization: 'Livestock, Poultry',
      clinic: 'Accra Veterinary Clinic',
      region: 'Greater Accra',
      experience: 12,
      rating: 4.8,
      reviews: 45,
      telemedicine: true,
      consultationFee: 150,
      phone: '+233-24-XXXX-XXXX',
      email: 'kwame@accravet.gh',
    },
    {
      id: 2,
      name: 'Dr. Ama Mensah',
      license: 'GVC-2020-0789',
      specialization: 'Fish Farming, Aquaculture',
      clinic: 'Tema Aquaculture Veterinary Center',
      region: 'Greater Accra',
      experience: 8,
      rating: 4.6,
      reviews: 32,
      telemedicine: true,
      consultationFee: 120,
      phone: '+233-27-XXXX-XXXX',
      email: 'ama@temaaquavet.gh',
    },
    {
      id: 3,
      name: 'Dr. Kofi Amponsah',
      license: 'GVC-2018-0234',
      specialization: 'Mixed Farming',
      clinic: 'Kumasi Agricultural Veterinary Services',
      region: 'Ashanti',
      experience: 15,
      rating: 4.9,
      reviews: 58,
      telemedicine: true,
      consultationFee: 140,
      phone: '+233-26-XXXX-XXXX',
      email: 'kofi@kumasivet.gh',
    },
    {
      id: 4,
      name: 'Dr. Abubakari Hassan',
      license: 'GVC-2019-0567',
      specialization: 'Livestock, Pastoralism',
      clinic: 'Northern Livestock Veterinary Center',
      region: 'Northern',
      experience: 10,
      rating: 4.5,
      reviews: 28,
      telemedicine: false,
      consultationFee: 100,
      phone: '+233-24-XXXX-XXXX',
      email: 'abubakari@northernvet.gh',
    },
  ];

  const specializations = ['all', 'Livestock', 'Fish Farming', 'Crops', 'Poultry', 'Mixed Farming'];
  const regions = ['all', 'Greater Accra', 'Ashanti', 'Northern', 'Western', 'Central'];

  const filteredVets = veterinarians.filter(vet => {
    const specMatch = selectedSpecialization === 'all' || vet.specialization.includes(selectedSpecialization);
    const regionMatch = selectedRegion === 'all' || vet.region === selectedRegion;
    return specMatch && regionMatch;
  });

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Veterinary Directory</h1>
        <p className="text-muted-foreground mt-2">Find qualified veterinarians in Ghana</p>
      </div>

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
                {specializations.map(spec => (
                  <option key={spec} value={spec}>
                    {spec === 'all' ? 'All Specializations' : spec}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Region</label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full mt-2 px-3 py-2 border rounded-md"
              >
                {regions.map(region => (
                  <option key={region} value={region}>
                    {region === 'all' ? 'All Regions' : region}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Veterinarian Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredVets.map(vet => (
          <Card key={vet.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-500" />
                    {vet.name}
                  </CardTitle>
                  <CardDescription>{vet.clinic}</CardDescription>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{vet.rating}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{vet.reviews} reviews</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">License</p>
                <p className="text-sm">{vet.license}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Specialization</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {vet.specialization.split(',').map(spec => (
                    <Badge key={spec.trim()} variant="secondary">{spec.trim()}</Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Experience</p>
                  <p className="font-semibold">{vet.experience} years</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Consultation Fee</p>
                  <p className="font-semibold">GHS {vet.consultationFee}/hr</p>
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
                {vet.telemedicine && (
                  <Button className="flex-1" variant="outline">
                    <Video className="w-4 h-4 mr-2" />
                    Telemedicine
                  </Button>
                )}
              </div>

              <div className="flex gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>{vet.phone}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredVets.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">No veterinarians found matching your criteria</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
