import React, { useState } from 'react';
import { Star, Users, Award, Clock, MapPin, BookOpen, Video, MessageSquare, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { trpc } from '@/lib/trpc';

export default function MentorshipProgram() {
  const [selectedMentor, setSelectedMentor] = useState<number | null>(null);
  const [filterSpecialty, setFilterSpecialty] = useState<string>('');

  // Fetch mentors
  const { data: mentorsData } = trpc.mentorship.getAvailableMentors.useQuery({
    specialty: filterSpecialty || undefined,
    limit: 20,
  });

  // Fetch my mentorships
  const { data: myMentorships } = trpc.mentorship.getMyMentorships.useQuery();

  // Fetch mentor profile
  const { data: mentorProfile } = trpc.mentorship.getMentorProfile.useQuery(
    { mentorId: selectedMentor || 0 },
    { enabled: selectedMentor !== null }
  );

  // Fetch mentorship stats
  const { data: stats } = trpc.mentorship.getMentorshipStats.useQuery();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mentorship Program</h1>
          <p className="text-gray-600 mt-1">Learn from experienced farmers and experts</p>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.totalMentors}</div>
                <p className="text-sm text-gray-600 mt-1">Expert Mentors</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.activeMentorships}</div>
                <p className="text-sm text-gray-600 mt-1">Active Mentorships</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.completedCertifications}</div>
                <p className="text-sm text-gray-600 mt-1">Certifications Awarded</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.averageRating}</div>
                <p className="text-sm text-gray-600 mt-1">Average Rating</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="browse">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="browse">Browse Mentors</TabsTrigger>
          <TabsTrigger value="active">My Mentorships ({myMentorships?.activeMentorships || 0})</TabsTrigger>
          <TabsTrigger value="specialties">Top Specialties</TabsTrigger>
        </TabsList>

        {/* Browse Mentors */}
        <TabsContent value="browse" className="mt-6">
          <div className="space-y-4">
            {/* Filter */}
            <div className="flex gap-2">
              {['Crop Production', 'Livestock Management', 'Organic Farming', 'Irrigation Management'].map((specialty) => (
                <Button
                  key={specialty}
                  variant={filterSpecialty === specialty ? 'default' : 'outline'}
                  onClick={() => setFilterSpecialty(filterSpecialty === specialty ? '' : specialty)}
                  size="sm"
                >
                  {specialty}
                </Button>
              ))}
            </div>

            {/* Mentors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mentorsData?.mentors.map((mentor: any) => (
                <Card
                  key={mentor.id}
                  className="cursor-pointer hover:shadow-lg transition"
                  onClick={() => setSelectedMentor(mentor.id)}
                >
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{mentor.name}</h3>
                          <Badge className="mt-1">{mentor.specialty}</Badge>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span className="font-bold text-gray-900">{mentor.rating}</span>
                          </div>
                          <p className="text-xs text-gray-600">{mentor.reviews} reviews</p>
                        </div>
                      </div>

                      {/* Bio */}
                      <p className="text-sm text-gray-600">{mentor.bio}</p>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div className="bg-blue-50 p-2 rounded">
                          <p className="text-gray-600">Experience</p>
                          <p className="font-bold text-gray-900">{mentor.experience} yrs</p>
                        </div>
                        <div className="bg-green-50 p-2 rounded">
                          <p className="text-gray-600">Students</p>
                          <p className="font-bold text-gray-900">{mentor.students}</p>
                        </div>
                        <div className="bg-yellow-50 p-2 rounded">
                          <p className="text-gray-600">Rate</p>
                          <p className="font-bold text-gray-900">₦{(mentor.hourlyRate / 1000).toFixed(0)}k/hr</p>
                        </div>
                      </div>

                      {/* Certifications */}
                      <div>
                        <p className="text-xs font-semibold text-gray-900 mb-2">Certifications</p>
                        <div className="flex flex-wrap gap-1">
                          {mentor.certifications.map((cert: string) => (
                            <Badge key={cert} variant="secondary" className="text-xs">
                              {cert}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Availability */}
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        {mentor.availability}
                      </div>

                      {/* Action */}
                      <Button className="w-full">Request Mentorship</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* My Mentorships */}
        <TabsContent value="active" className="mt-6">
          <div className="space-y-4">
            {myMentorships?.mentorships.map((mentorship: any) => (
              <Card key={mentorship.id}>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{mentorship.mentorName}</h3>
                        <p className="text-sm text-gray-600">{mentorship.topic}</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>

                    {/* Progress */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-900">Progress</span>
                        <span className="text-sm text-gray-600">{mentorship.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${mentorship.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <p className="text-gray-600">Sessions</p>
                        <p className="font-bold text-gray-900">{mentorship.sessions}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Duration</p>
                        <p className="font-bold text-gray-900">
                          {Math.ceil((mentorship.endDate - mentorship.startDate) / (7 * 24 * 60 * 60 * 1000))} weeks
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Next Session</p>
                        <p className="font-bold text-gray-900">In 2 days</p>
                      </div>
                    </div>

                    {/* Goals */}
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-2">Learning Goals</p>
                      <ul className="space-y-1">
                        {mentorship.goals.map((goal: string, index: number) => (
                          <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            {goal}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button className="flex-1 gap-2">
                        <Video className="w-4 h-4" />
                        Schedule Session
                      </Button>
                      <Button variant="outline" className="flex-1 gap-2">
                        <MessageSquare className="w-4 h-4" />
                        Message Mentor
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Top Specialties */}
        <TabsContent value="specialties" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Popular Specialties</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.topSpecialties.map((specialty: any) => (
                  <div key={specialty.specialty} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{specialty.specialty}</h4>
                      <p className="text-sm text-gray-600">{specialty.mentors} mentors available</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{specialty.students}</p>
                      <p className="text-xs text-gray-600">active students</p>
                    </div>
                    <Button className="ml-4">Explore</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Mentor Profile Modal */}
      {selectedMentor && mentorProfile && (
        <Card className="fixed inset-0 z-50 m-4 max-w-2xl mx-auto my-auto max-h-screen overflow-auto">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{mentorProfile.mentor.name}</CardTitle>
                <p className="text-sm text-gray-600 mt-1">{mentorProfile.mentor.specialty}</p>
              </div>
              <Button variant="ghost" onClick={() => setSelectedMentor(null)}>✕</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Rating and Reviews */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < Math.floor(mentorProfile.mentor.rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">{mentorProfile.mentor.reviews} reviews</span>
            </div>

            {/* Bio */}
            <p className="text-gray-600">{mentorProfile.mentor.bio}</p>

            {/* Success Stories */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Success Stories</h4>
              <div className="space-y-2">
                {mentorProfile.mentor.successStories.map((story: any, index: number) => (
                  <div key={index} className="p-3 bg-green-50 rounded-lg">
                    <p className="font-medium text-gray-900">{story.studentName}</p>
                    <p className="text-sm text-gray-600">{story.achievement} ({story.duration})</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Reviews */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Recent Reviews</h4>
              <div className="space-y-2">
                {mentorProfile.mentor.recentReviews.map((review: any, index: number) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-gray-900">{review.studentName}</p>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>

            <Button className="w-full" size="lg">Request Mentorship</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
