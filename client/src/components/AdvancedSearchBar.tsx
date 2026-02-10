import React, { useState, useEffect } from 'react';
import { Search, X, Filter, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';

interface AdvancedSearchBarProps {
  onSearch: (query: string, filters: any) => void;
  searchType?: 'products' | 'forum' | 'all';
  placeholder?: string;
}

export function AdvancedSearchBar({
  onSearch,
  searchType = 'products',
  placeholder = 'Search...',
}: AdvancedSearchBarProps) {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Product filters
  const [cropTypes, setCropTypes] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([1000, 50000]);
  const [rating, setRating] = useState<number | undefined>();
  const [location, setLocation] = useState('');
  const [sortBy, setSortBy] = useState('relevance');

  // Forum filters
  const [categories, setCategories] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    if (query.length > 2) {
      // Fetch suggestions
      setSuggestions([
        'Fresh Tomatoes',
        'Organic Rice',
        'Cassava Flour',
        'Best practices for cassava farming',
        'Livestock breeding guide',
      ].filter((s) => s.toLowerCase().includes(query.toLowerCase())));
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [query]);

  const handleSearch = () => {
    const filters = {
      cropTypes: cropTypes.length > 0 ? cropTypes : undefined,
      priceRange: searchType !== 'forum' ? { min: priceRange[0], max: priceRange[1] } : undefined,
      rating: rating ? rating : undefined,
      location: location || undefined,
      sortBy,
      categories: categories.length > 0 ? categories : undefined,
      tags: tags.length > 0 ? tags : undefined,
    };

    onSearch(query, filters);
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
  };

  const cropTypeOptions = ['Vegetables', 'Grains', 'Fruits', 'Processed', 'Livestock'];
  const categoryOptions = [
    'Crop Cultivation',
    'Livestock Management',
    'Pest & Disease Management',
    'Market & Pricing',
    'Technology & Innovation',
  ];
  const tagOptions = [
    'cassava',
    'maize',
    'rice',
    'livestock',
    'breeding',
    'disease',
    'pest',
    'weather',
  ];

  return (
    <div className="w-full space-y-4">
      {/* Search Input */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder={placeholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10 pr-10"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <Dialog open={showFilters} onOpenChange={setShowFilters}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Advanced Filters</DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Product Filters */}
                {searchType !== 'forum' && (
                  <>
                    {/* Crop Type */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium">Crop Type</label>
                      <div className="space-y-2">
                        {cropTypeOptions.map((type) => (
                          <div key={type} className="flex items-center gap-2">
                            <Checkbox
                              id={type}
                              checked={cropTypes.includes(type)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setCropTypes([...cropTypes, type]);
                                } else {
                                  setCropTypes(cropTypes.filter((t) => t !== type));
                                }
                              }}
                            />
                            <label htmlFor={type} className="text-sm cursor-pointer">
                              {type}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Price Range */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium">
                        Price Range: ₦{priceRange[0]} - ₦{priceRange[1]}
                      </label>
                      <Slider
                        min={1000}
                        max={50000}
                        step={1000}
                        value={priceRange}
                        onValueChange={setPriceRange}
                        className="w-full"
                      />
                    </div>

                    {/* Rating */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium">Minimum Rating</label>
                      <Select value={rating?.toString() || ''} onValueChange={(v) => setRating(v ? parseFloat(v) : undefined)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Any rating" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Any rating</SelectItem>
                          <SelectItem value="4">4+ stars</SelectItem>
                          <SelectItem value="4.5">4.5+ stars</SelectItem>
                          <SelectItem value="5">5 stars</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Location */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium">Location</label>
                      <Input
                        placeholder="Search by region..."
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                      />
                    </div>

                    {/* Sort By */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium">Sort By</label>
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="relevance">Relevance</SelectItem>
                          <SelectItem value="price_asc">Price: Low to High</SelectItem>
                          <SelectItem value="price_desc">Price: High to Low</SelectItem>
                          <SelectItem value="rating">Highest Rated</SelectItem>
                          <SelectItem value="newest">Newest</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {/* Forum Filters */}
                {searchType !== 'products' && (
                  <>
                    {/* Categories */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium">Categories</label>
                      <div className="space-y-2">
                        {categoryOptions.map((cat) => (
                          <div key={cat} className="flex items-center gap-2">
                            <Checkbox
                              id={cat}
                              checked={categories.includes(cat)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setCategories([...categories, cat]);
                                } else {
                                  setCategories(categories.filter((c) => c !== cat));
                                }
                              }}
                            />
                            <label htmlFor={cat} className="text-sm cursor-pointer">
                              {cat}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium">Tags</label>
                      <div className="flex flex-wrap gap-2">
                        {tagOptions.map((tag) => (
                          <button
                            key={tag}
                            onClick={() => {
                              if (tags.includes(tag)) {
                                setTags(tags.filter((t) => t !== tag));
                              } else {
                                setTags([...tags, tag]);
                              }
                            }}
                            className={`px-3 py-1 rounded-full text-sm transition ${
                              tags.includes(tag)
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Apply Button */}
                <Button onClick={handleSearch} className="w-full">
                  Apply Filters
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button onClick={handleSearch}>Search</Button>
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg"
              >
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-gray-400" />
                  <span>{suggestion}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
