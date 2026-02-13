import { forwardRef, useState, useCallback, useMemo, ReactNode } from 'react';
import { Search, X, Save, Trash2, ChevronDown, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

export interface FilterField {
  /**
   * Field key
   */
  key: string;
  /**
   * Field label
   */
  label: string;
  /**
   * Field type
   */
  type: 'text' | 'select' | 'date' | 'number' | 'range';
  /**
   * Placeholder text
   */
  placeholder?: string;
  /**
   * Select options
   */
  options?: { label: string; value: string }[];
}

export interface FilterPreset {
  /**
   * Preset ID
   */
  id: string;
  /**
   * Preset name
   */
  name: string;
  /**
   * Filter values
   */
  filters: Record<string, any>;
}

export interface SearchFilterPanelProps {
  /**
   * Search placeholder
   */
  searchPlaceholder?: string;
  /**
   * Filter fields
   */
  filterFields: FilterField[];
  /**
   * Saved filter presets
   */
  presets?: FilterPreset[];
  /**
   * Callback when search changes
   */
  onSearchChange?: (search: string) => void;
  /**
   * Callback when filters change
   */
  onFiltersChange?: (filters: Record<string, any>) => void;
  /**
   * Callback when preset is saved
   */
  onSavePreset?: (preset: FilterPreset) => void;
  /**
   * Callback when preset is deleted
   */
  onDeletePreset?: (presetId: string) => void;
  /**
   * Callback when preset is applied
   */
  onApplyPreset?: (preset: FilterPreset) => void;
  /**
   * Custom className
   */
  className?: string;
  /**
   * Show advanced filters
   */
  showAdvanced?: boolean;
}

/**
 * SearchFilterPanel Component
 * 
 * Advanced search and filter panel with saved presets
 */
export const SearchFilterPanel = forwardRef<HTMLDivElement, SearchFilterPanelProps>(
  (
    {
      searchPlaceholder = 'Search...',
      filterFields,
      presets = [],
      onSearchChange,
      onFiltersChange,
      onSavePreset,
      onDeletePreset,
      onApplyPreset,
      className = '',
      showAdvanced = true,
    },
    ref
  ) => {
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState<Record<string, any>>({});
    const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
    const [presetName, setPresetName] = useState('');
    const [isSavingPreset, setIsSavingPreset] = useState(false);

    const handleSearchChange = useCallback(
      (value: string) => {
        setSearch(value);
        onSearchChange?.(value);
      },
      [onSearchChange]
    );

    const handleFilterChange = useCallback(
      (key: string, value: any) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onFiltersChange?.(newFilters);
      },
      [filters, onFiltersChange]
    );

    const handleClearFilters = useCallback(() => {
      setSearch('');
      setFilters({});
      onSearchChange?.('');
      onFiltersChange?.({});
    }, [onSearchChange, onFiltersChange]);

    const handleSavePreset = useCallback(() => {
      if (!presetName.trim()) return;

      const newPreset: FilterPreset = {
        id: Date.now().toString(),
        name: presetName,
        filters: { ...filters, search },
      };

      onSavePreset?.(newPreset);
      setPresetName('');
      setIsSavingPreset(false);
    }, [presetName, filters, search, onSavePreset]);

    const handleApplyPreset = useCallback(
      (preset: FilterPreset) => {
        setSearch(preset.filters.search || '');
        const { search: _, ...filterValues } = preset.filters;
        setFilters(filterValues);
        onApplyPreset?.(preset);
        onSearchChange?.(preset.filters.search || '');
        onFiltersChange?.(filterValues);
      },
      [onApplyPreset, onSearchChange, onFiltersChange]
    );

    const activeFilterCount = useMemo(() => {
      return Object.values(filters).filter((v) => v !== '' && v !== null && v !== undefined).length +
        (search ? 1 : 0);
    }, [filters, search]);

    return (
      <div ref={ref} className={`space-y-4 ${className}`}>
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 pr-10"
          />
          {search && (
            <button
              onClick={() => handleSearchChange('')}
              className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter Summary */}
        {activeFilterCount > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary">{activeFilterCount} active filter(s)</Badge>
            <Button size="sm" variant="ghost" onClick={handleClearFilters}>
              Clear All
            </Button>
          </div>
        )}

        {/* Advanced Filters Toggle */}
        {showAdvanced && filterFields.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
            className="w-full"
          >
            <Filter className="h-4 w-4 mr-2" />
            Advanced Filters
            <ChevronDown
              className={`h-4 w-4 ml-auto transition-transform ${
                isAdvancedOpen ? 'rotate-180' : ''
              }`}
            />
          </Button>
        )}

        {/* Advanced Filters Panel */}
        {isAdvancedOpen && (
          <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filterFields.map((field) => (
                <div key={field.key} className="space-y-2">
                  <label className="text-sm font-medium">{field.label}</label>

                  {field.type === 'text' && (
                    <Input
                      placeholder={field.placeholder}
                      value={filters[field.key] || ''}
                      onChange={(e) => handleFilterChange(field.key, e.target.value)}
                    />
                  )}

                  {field.type === 'select' && (
                    <Select
                      value={filters[field.key] || ''}
                      onValueChange={(value) => handleFilterChange(field.key, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={field.placeholder} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All</SelectItem>
                        {field.options?.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {field.type === 'number' && (
                    <Input
                      type="number"
                      placeholder={field.placeholder}
                      value={filters[field.key] || ''}
                      onChange={(e) => handleFilterChange(field.key, e.target.value)}
                    />
                  )}

                  {field.type === 'date' && (
                    <Input
                      type="date"
                      value={filters[field.key] || ''}
                      onChange={(e) => handleFilterChange(field.key, e.target.value)}
                    />
                  )}

                  {field.type === 'range' && (
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={filters[`${field.key}_min`] || ''}
                        onChange={(e) => handleFilterChange(`${field.key}_min`, e.target.value)}
                      />
                      <Input
                        type="number"
                        placeholder="Max"
                        value={filters[`${field.key}_max`] || ''}
                        onChange={(e) => handleFilterChange(`${field.key}_max`, e.target.value)}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Preset Actions */}
            <div className="border-t pt-4 space-y-3">
              <div className="flex gap-2">
                {!isSavingPreset ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsSavingPreset(true)}
                    disabled={activeFilterCount === 0}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save as Preset
                  </Button>
                ) : (
                  <div className="flex gap-2 flex-1">
                    <Input
                      placeholder="Preset name..."
                      value={presetName}
                      onChange={(e) => setPresetName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSavePreset();
                        if (e.key === 'Escape') setIsSavingPreset(false);
                      }}
                      autoFocus
                    />
                    <Button size="sm" onClick={handleSavePreset} disabled={!presetName.trim()}>
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setIsSavingPreset(false);
                        setPresetName('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>

              {/* Saved Presets */}
              {presets.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Saved Presets</h4>
                  <div className="flex flex-wrap gap-2">
                    {presets.map((preset) => (
                      <div key={preset.id} className="flex items-center gap-1 bg-background border rounded px-2 py-1">
                        <button
                          onClick={() => handleApplyPreset(preset)}
                          className="text-sm hover:underline"
                        >
                          {preset.name}
                        </button>
                        <button
                          onClick={() => onDeletePreset?.(preset.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
);

SearchFilterPanel.displayName = 'SearchFilterPanel';

/**
 * Hook for managing search and filter state
 */
export function useSearchFilter(initialFilters: Record<string, any> = {}) {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState(initialFilters);
  const [presets, setPresets] = useState<FilterPreset[]>([]);

  const handleSavePreset = useCallback(
    (preset: FilterPreset) => {
      setPresets((prev) => [...prev, preset]);
    },
    []
  );

  const handleDeletePreset = useCallback((presetId: string) => {
    setPresets((prev) => prev.filter((p) => p.id !== presetId));
  }, []);

  const handleApplyPreset = useCallback((preset: FilterPreset) => {
    setSearch(preset.filters.search || '');
    const { search: _, ...filterValues } = preset.filters;
    setFilters(filterValues);
  }, []);

  return {
    search,
    setSearch,
    filters,
    setFilters,
    presets,
    handleSavePreset,
    handleDeletePreset,
    handleApplyPreset,
  };
}
