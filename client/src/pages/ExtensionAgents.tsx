import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, MapPin, Phone, Mail, BookOpen, Users2 } from 'lucide-react';

export default function ExtensionAgents() {
  const [selectedSpecialization, setSelectedSpecialization] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');

  const extensionAgents = [
    {
      id: 1,
      name: 'Mr. Samuel Mensah',
      title: 'Lead Extension Agent',
      specialization: 'Urban farming, Vegetables, Poultry',
      region: 'Greater Accra',
      office: 'Accra District Agricultural Extension Office',
      farmerGroups: 25,
      trainingPrograms: 'Monthly workshops',
      demonstrationFarms: 5,
      phone: '+233-24-XXXX-XXXX',
      email: 'samuel@accraext.gh',
    },
    {
      id: 2,
      name: 'Ms. Ama Boateng',
      title: 'Extension Agent',
      specialization: 'Fish farming, Aquaculture, Horticulture',
      region: 'Greater Accra',
      office: 'Tema Agricultural Extension Center',
      farmerGroups: 18,
      trainingPrograms: 'Bi-weekly sessions',
      demonstrationFarms: 3,
      phone: '+233-27-XXXX-XXXX',
      email: 'ama@temaext.gh',
    },
    {
      id: 3,
      name: 'Mr. Kwesi Owusu',
      title: 'Lead Extension Agent',
      specialization: 'Cocoa, Vegetables, Livestock',
      region: 'Ashanti',
      office: 'Kumasi District Agricultural Extension Office',
      farmerGroups: 42,
      trainingPrograms: 'Weekly sessions',
      demonstrationFarms: 8,
      phone: '+233-26-XXXX-XXXX',
      email: 'kwesi@kumasiext.gh',
    },
    {
      id: 4,
      name: 'Ms. Abena Asante',
      title: 'Extension Agent',
      specialization: 'Maize, Cassava, Vegetables',
      region: 'Ashanti',
      office: 'Ejisu-Juaso Agricultural Extension Center',
      farmerGroups: 35,
      trainingPrograms: 'Twice weekly',
      demonstrationFarms: 6,
      phone: '+233-24-XXXX-XXXX',
      email: 'abena@ejisujuasoext.gh',
    },
    {
      id: 5,
      name: 'Mr. Ibrahim Alhassan',
      title: 'Lead Extension Agent',
      specialization: 'Millet, Sorghum, Livestock, Pastoralism',
      region: 'Northern',
      office: 'Tamale District Agricultural Extension Office',
      farmerGroups: 28,
      trainingPrograms: 'Weekly sessions',
      demonstrationFarms: 4,
      phone: '+233-24-XXXX-XXXX',
      email: 'ibrahim@tamaleext.gh',
    },
  ];

  const specializations = ['all', 'Livestock', 'Crops', 'Fish Farming', 'Poultry', 'Mixed Farming'];
  const regions = ['all', 'Greater Accra', 'Ashanti', 'Northern', 'Western', 'Central'];

  const filteredAgents = extensionAgents.filter(agent => {
    const specMatch = selectedSpecialization === 'all' || agent.specialization.includes(selectedSpecialization);
    const regionMatch = selectedRegion === 'all' || agent.region === selectedRegion;
    return specMatch && regionMatch;
  });

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Extension Agents</h1>
        <p className="text-muted-foreground mt-2">Find agricultural extension agents in Ghana</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Extension Agents</CardTitle>
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

      {/* Extension Agent Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredAgents.map(agent => (
          <Card key={agent.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  {agent.name}
                </CardTitle>
                <CardDescription>{agent.title}</CardDescription>
                <p className="text-sm text-muted-foreground mt-1">{agent.office}</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Specialization</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {agent.specialization.split(',').map(spec => (
                    <Badge key={spec.trim()} variant="secondary">{spec.trim()}</Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Farmer Groups</p>
                  <p className="font-semibold">{agent.farmerGroups}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Demo Farms</p>
                  <p className="font-semibold">{agent.demonstrationFarms}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Training</p>
                  <p className="font-semibold text-xs">{agent.trainingPrograms}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4" />
                <span>{agent.region}</span>
              </div>

              <div className="flex gap-2 pt-4">
                <Button className="flex-1" variant="default">
                  Request Support
                </Button>
                <Button className="flex-1" variant="outline">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Training
                </Button>
              </div>

              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex gap-2">
                  <Phone className="w-4 h-4" />
                  <span>{agent.phone}</span>
                </div>
                <div className="flex gap-2">
                  <Mail className="w-4 h-4" />
                  <span>{agent.email}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAgents.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">No extension agents found matching your criteria</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
