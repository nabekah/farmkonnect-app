import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, ThumbsUp, Eye, Search, Plus, User, Calendar, TrendingUp, Award, Heart } from "lucide-react";

interface ForumPost {
  id: string;
  title: string;
  content: string;
  author: string;
  avatar: string;
  category: string;
  tags: string[];
  views: number;
  replies: number;
  likes: number;
  createdAt: string;
  isPinned: boolean;
  isAnswered: boolean;
}

interface ForumCategory {
  name: string;
  description: string;
  postCount: number;
  icon: string;
}

export default function FarmerCommunityForum() {
  const [activeTab, setActiveTab] = useState("discussions");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories: ForumCategory[] = [
    {
      name: "Crop Management",
      description: "Discuss crop varieties, planting techniques, and yield optimization",
      postCount: 1247,
      icon: "🌾",
    },
    {
      name: "Livestock & Poultry",
      description: "Share experiences with animal husbandry and health management",
      postCount: 856,
      icon: "🐄",
    },
    {
      name: "Soil & Fertilizers",
      description: "Exchange knowledge about soil health and nutrient management",
      postCount: 634,
      icon: "🌱",
    },
    {
      name: "Pest & Disease Management",
      description: "Identify and manage pests, diseases, and weeds",
      postCount: 892,
      icon: "🐛",
    },
    {
      name: "Market & Pricing",
      description: "Discuss market trends, prices, and selling strategies",
      postCount: 1102,
      icon: "💰",
    },
    {
      name: "Farm Equipment & Technology",
      description: "Share tips on machinery, tools, and agricultural technology",
      postCount: 745,
      icon: "🚜",
    },
  ];

  const forumPosts: ForumPost[] = [
    {
      id: "1",
      title: "Best practices for maize yield optimization in dry season",
      content:
        "I'm planning to grow maize in the dry season. What are the best practices to maximize yield with limited water? Any recommendations for irrigation schedules?",
      author: "Rajesh Kumar",
      avatar: "RK",
      category: "Crop Management",
      tags: ["maize", "irrigation", "yield"],
      views: 2341,
      replies: 47,
      likes: 156,
      createdAt: "2 hours ago",
      isPinned: true,
      isAnswered: true,
    },
    {
      id: "2",
      title: "Dealing with armyworm infestation in maize",
      content:
        "My maize field is showing signs of armyworm damage. What's the best organic solution? Has anyone tried neem oil or other natural pesticides?",
      author: "Priya Singh",
      avatar: "PS",
      category: "Pest & Disease Management",
      tags: ["armyworm", "organic", "pest-control"],
      views: 1856,
      replies: 34,
      likes: 98,
      createdAt: "5 hours ago",
      isPinned: false,
      isAnswered: true,
    },
    {
      id: "3",
      title: "Soil pH adjustment for better crop performance",
      content:
        "My soil pH is 5.2, which is too acidic. What's the best way to increase it? Should I use lime or other amendments? How long does it take to see results?",
      author: "Arun Patel",
      avatar: "AP",
      category: "Soil & Fertilizers",
      tags: ["soil-ph", "lime", "amendments"],
      views: 1543,
      replies: 28,
      likes: 87,
      createdAt: "8 hours ago",
      isPinned: false,
      isAnswered: true,
    },
    {
      id: "4",
      title: "Poultry vaccination schedule for disease prevention",
      content:
        "What's the recommended vaccination schedule for broilers? I want to ensure my flock is protected from common diseases. Any experience with Newcastle disease vaccines?",
      author: "Deepak Verma",
      avatar: "DV",
      category: "Livestock & Poultry",
      tags: ["vaccination", "poultry", "disease-prevention"],
      views: 1234,
      replies: 22,
      likes: 76,
      createdAt: "12 hours ago",
      isPinned: false,
      isAnswered: false,
    },
    {
      id: "5",
      title: "Current market prices and selling strategies",
      content:
        "Maize prices are fluctuating. When is the best time to sell? Should I store and wait for better prices or sell immediately after harvest?",
      author: "Meera Nair",
      avatar: "MN",
      category: "Market & Pricing",
      tags: ["market", "pricing", "selling-strategy"],
      views: 3421,
      replies: 89,
      likes: 234,
      createdAt: "1 day ago",
      isPinned: false,
      isAnswered: true,
    },
  ];

  const filteredPosts = forumPosts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === "all" || post.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Farmer Community Forum</h1>
          <p className="text-gray-600 mt-2">Connect with farmers, share experiences, and learn from the community</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          New Discussion
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="discussions">Discussions</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
        </TabsList>

        {/* Discussions Tab */}
        <TabsContent value="discussions" className="space-y-4">
          {/* Search & Filter */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search discussions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat.name} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Posts List */}
          <div className="space-y-3">
            {filteredPosts.map((post) => (
              <Card key={post.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                        {post.avatar}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 line-clamp-2">{post.title}</h3>
                            {post.isPinned && (
                              <Badge variant="secondary" className="flex-shrink-0">
                                📌 Pinned
                              </Badge>
                            )}
                            {post.isAnswered && (
                              <Badge className="bg-green-600 flex-shrink-0">✓ Answered</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2">{post.content}</p>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {post.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      {/* Meta Info */}
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {post.author}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {post.createdAt}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {post.category}
                          </Badge>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {post.views}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" />
                            {post.replies}
                          </span>
                          <span className="flex items-center gap-1 text-red-600">
                            <Heart className="w-3 h-3" />
                            {post.likes}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((category) => (
              <Card key={category.name} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">{category.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg">{category.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-sm text-gray-500">{category.postCount} discussions</span>
                        <Button variant="outline" size="sm">
                          View All
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Trending Tab */}
        <TabsContent value="trending" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Most Viewed */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Most Viewed
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {forumPosts
                  .sort((a, b) => b.views - a.views)
                  .slice(0, 5)
                  .map((post) => (
                    <div key={post.id} className="pb-3 border-b last:border-b-0">
                      <p className="font-medium text-gray-900 text-sm line-clamp-2">{post.title}</p>
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {post.views} views
                      </p>
                    </div>
                  ))}
              </CardContent>
            </Card>

            {/* Most Liked */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-600" />
                  Most Liked
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {forumPosts
                  .sort((a, b) => b.likes - a.likes)
                  .slice(0, 5)
                  .map((post) => (
                    <div key={post.id} className="pb-3 border-b last:border-b-0">
                      <p className="font-medium text-gray-900 text-sm line-clamp-2">{post.title}</p>
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {post.likes} likes
                      </p>
                    </div>
                  ))}
              </CardContent>
            </Card>

            {/* Most Replied */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Most Discussed
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {forumPosts
                  .sort((a, b) => b.replies - a.replies)
                  .slice(0, 5)
                  .map((post) => (
                    <div key={post.id} className="pb-3 border-b last:border-b-0">
                      <p className="font-medium text-gray-900 text-sm line-clamp-2">{post.title}</p>
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        {post.replies} replies
                      </p>
                    </div>
                  ))}
              </CardContent>
            </Card>

            {/* Top Contributors */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Top Contributors
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: "Rajesh Kumar", posts: 156, reputation: 2450 },
                  { name: "Priya Singh", posts: 142, reputation: 2180 },
                  { name: "Arun Patel", posts: 128, reputation: 1950 },
                  { name: "Deepak Verma", posts: 115, reputation: 1750 },
                  { name: "Meera Nair", posts: 103, reputation: 1580 },
                ].map((contributor) => (
                  <div key={contributor.name} className="pb-3 border-b last:border-b-0 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{contributor.name}</p>
                      <p className="text-xs text-gray-500">{contributor.posts} posts</p>
                    </div>
                    <Badge variant="secondary">{contributor.reputation} rep</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
