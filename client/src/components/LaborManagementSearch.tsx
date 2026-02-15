'use client';
import { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { navigationStructure } from './NavigationStructure';
import { Link } from 'wouter';

export const LaborManagementSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Get Labor Management items
  const laborManagementGroup = navigationStructure.find(g => g.title === 'Labor Management');
  const laborItems = laborManagementGroup?.items || [];

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const query = searchQuery.toLowerCase();
    return laborItems.filter(item => 
      item.label.toLowerCase().includes(query) ||
      item.path.toLowerCase().includes(query)
    );
  }, [searchQuery, laborItems]);

  const handleSelectItem = () => {
    setSearchQuery('');
    setIsOpen(false);
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search Labor Management features..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="pl-10 pr-10"
        />
        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery('');
              setIsOpen(false);
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
          >
            <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {searchQuery.trim() === '' ? (
            <div className="p-4 text-sm text-muted-foreground">
              Type to search Labor Management features...
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground">
              No features found matching "{searchQuery}"
            </div>
          ) : (
            <div className="divide-y">
              {filteredItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={handleSelectItem}
                >
                  <a className="flex items-center gap-3 p-3 hover:bg-accent cursor-pointer transition-colors">
                    <item.icon className="w-4 h-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.path}</p>
                    </div>
                  </a>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default LaborManagementSearch;
