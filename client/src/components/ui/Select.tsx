import { forwardRef, useState, useCallback, ReactNode, useRef, useEffect } from 'react';
import { ChevronDown, X, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  /**
   * Option value
   */
  value: string;
  /**
   * Option label
   */
  label: string;
  /**
   * Is option disabled
   */
  disabled?: boolean;
  /**
   * Option description
   */
  description?: string;
}

export interface SelectProps {
  /**
   * Select options
   */
  options: SelectOption[];
  /**
   * Selected value
   */
  value?: string;
  /**
   * Callback on value change
   */
  onChange?: (value: string) => void;
  /**
   * Placeholder text
   */
  placeholder?: string;
  /**
   * Label text
   */
  label?: string;
  /**
   * Is select disabled
   */
  disabled?: boolean;
  /**
   * Is select searchable
   */
  searchable?: boolean;
  /**
   * Is select clearable
   */
  clearable?: boolean;
  /**
   * Custom className
   */
  className?: string;
}

/**
 * Select Component
 * 
 * Dropdown select with keyboard navigation and search
 */
export const Select = forwardRef<HTMLDivElement, SelectProps>(
  (
    {
      options,
      value,
      onChange,
      placeholder = 'Select an option',
      label,
      disabled = false,
      searchable = false,
      clearable = false,
      className = '',
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [highlightedIndex, setHighlightedIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const filteredOptions = searchable
      ? options.filter((opt) =>
          opt.label.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : options;

    const selectedOption = options.find((opt) => opt.value === value);

    const handleOpen = useCallback(() => {
      if (!disabled) {
        setIsOpen(true);
        setHighlightedIndex(0);
        if (searchable) {
          setTimeout(() => searchInputRef.current?.focus(), 0);
        }
      }
    }, [disabled, searchable]);

    const handleClose = useCallback(() => {
      setIsOpen(false);
      setSearchTerm('');
      setHighlightedIndex(0);
    }, []);

    const handleSelect = useCallback(
      (optionValue: string) => {
        onChange?.(optionValue);
        handleClose();
      },
      [onChange, handleClose]
    );

    const handleClear = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange?.('');
        handleClose();
      },
      [onChange, handleClose]
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (!isOpen) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleOpen();
          }
          return;
        }

        switch (e.key) {
          case 'ArrowDown':
            e.preventDefault();
            setHighlightedIndex((prev) =>
              prev < filteredOptions.length - 1 ? prev + 1 : prev
            );
            break;
          case 'ArrowUp':
            e.preventDefault();
            setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
            break;
          case 'Enter':
            e.preventDefault();
            if (filteredOptions[highlightedIndex]) {
              handleSelect(filteredOptions[highlightedIndex].value);
            }
            break;
          case 'Escape':
            e.preventDefault();
            handleClose();
            break;
          default:
            break;
        }
      },
      [isOpen, filteredOptions, highlightedIndex, handleSelect, handleOpen, handleClose]
    );

    // Handle click outside
    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(e.target as Node)
        ) {
          handleClose();
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isOpen, handleClose]);

    return (
      <div
        ref={ref || containerRef}
        className={cn('flex flex-col gap-2', className)}
      >
        {/* Label */}
        {label && (
          <label className="text-sm font-medium text-foreground">
            {label}
          </label>
        )}

        {/* Select trigger */}
        <button
          onClick={handleOpen}
          disabled={disabled}
          onKeyDown={handleKeyDown}
          className={cn(
            'flex items-center justify-between px-3 py-2 rounded-md border border-input bg-background text-left',
            'hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
            'transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
            isOpen && 'ring-2 ring-primary ring-offset-2'
          )}
        >
          <span className={cn(selectedOption ? 'text-foreground' : 'text-muted-foreground')}>
            {selectedOption?.label || placeholder}
          </span>

          <div className="flex items-center gap-1">
            {clearable && value && (
              <button
                onClick={handleClear}
                className="p-0.5 hover:bg-muted rounded transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <ChevronDown
              className={cn(
                'h-4 w-4 transition-transform',
                isOpen && 'rotate-180'
              )}
            />
          </div>
        </button>

        {/* Dropdown menu */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border border-input rounded-md shadow-lg">
            {/* Search input */}
            {searchable && (
              <div className="p-2 border-b border-input">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setHighlightedIndex(0);
                    }}
                    onKeyDown={handleKeyDown}
                    className="w-full pl-8 pr-3 py-1.5 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            )}

            {/* Options list */}
            <div className="max-h-60 overflow-y-auto">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-8 text-center text-sm text-muted-foreground">
                  No options found
                </div>
              ) : (
                filteredOptions.map((option, index) => (
                  <button
                    key={option.value}
                    onClick={() => handleSelect(option.value)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    disabled={option.disabled}
                    className={cn(
                      'w-full text-left px-3 py-2 text-sm transition-colors',
                      'hover:bg-muted focus:outline-none',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                      highlightedIndex === index && 'bg-muted',
                      value === option.value && 'bg-primary/10 font-medium'
                    )}
                  >
                    <div>{option.label}</div>
                    {option.description && (
                      <div className="text-xs text-muted-foreground">
                        {option.description}
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

/**
 * MultiSelect Component
 * 
 * Select multiple options
 */
export interface MultiSelectProps extends Omit<SelectProps, 'value' | 'onChange'> {
  /**
   * Selected values
   */
  value?: string[];
  /**
   * Callback on values change
   */
  onChange?: (values: string[]) => void;
  /**
   * Max selected items
   */
  maxItems?: number;
}

export const MultiSelect = forwardRef<HTMLDivElement, MultiSelectProps>(
  (
    {
      options,
      value = [],
      onChange,
      placeholder = 'Select options',
      label,
      disabled = false,
      searchable = false,
      clearable = false,
      maxItems,
      className = '',
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [highlightedIndex, setHighlightedIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const filteredOptions = searchable
      ? options.filter((opt) =>
          opt.label.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : options;

    const selectedOptions = options.filter((opt) => value.includes(opt.value));

    const handleOpen = useCallback(() => {
      if (!disabled) {
        setIsOpen(true);
        setHighlightedIndex(0);
        if (searchable) {
          setTimeout(() => searchInputRef.current?.focus(), 0);
        }
      }
    }, [disabled, searchable]);

    const handleClose = useCallback(() => {
      setIsOpen(false);
      setSearchTerm('');
      setHighlightedIndex(0);
    }, []);

    const handleToggle = useCallback(
      (optionValue: string) => {
        if (value.includes(optionValue)) {
          onChange?.(value.filter((v) => v !== optionValue));
        } else if (!maxItems || value.length < maxItems) {
          onChange?.([...value, optionValue]);
        }
      },
      [value, onChange, maxItems]
    );

    const handleRemove = useCallback(
      (optionValue: string, e: React.MouseEvent) => {
        e.stopPropagation();
        onChange?.(value.filter((v) => v !== optionValue));
      },
      [value, onChange]
    );

    const handleClear = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange?.([]);
        handleClose();
      },
      [onChange, handleClose]
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (!isOpen) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleOpen();
          }
          return;
        }

        switch (e.key) {
          case 'ArrowDown':
            e.preventDefault();
            setHighlightedIndex((prev) =>
              prev < filteredOptions.length - 1 ? prev + 1 : prev
            );
            break;
          case 'ArrowUp':
            e.preventDefault();
            setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
            break;
          case 'Enter':
            e.preventDefault();
            if (filteredOptions[highlightedIndex]) {
              handleToggle(filteredOptions[highlightedIndex].value);
            }
            break;
          case 'Escape':
            e.preventDefault();
            handleClose();
            break;
          default:
            break;
        }
      },
      [isOpen, filteredOptions, highlightedIndex, handleToggle, handleOpen, handleClose]
    );

    // Handle click outside
    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(e.target as Node)
        ) {
          handleClose();
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isOpen, handleClose]);

    return (
      <div
        ref={ref || containerRef}
        className={cn('flex flex-col gap-2', className)}
      >
        {/* Label */}
        {label && (
          <label className="text-sm font-medium text-foreground">
            {label}
          </label>
        )}

        {/* Select trigger */}
        <button
          onClick={handleOpen}
          disabled={disabled}
          onKeyDown={handleKeyDown}
          className={cn(
            'flex items-center justify-between px-3 py-2 rounded-md border border-input bg-background text-left',
            'hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
            'transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
            isOpen && 'ring-2 ring-primary ring-offset-2'
          )}
        >
          <div className="flex flex-wrap gap-1">
            {selectedOptions.length === 0 ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : (
              selectedOptions.map((opt) => (
                <div
                  key={opt.value}
                  className="flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 text-sm"
                >
                  {opt.label}
                  <button
                    onClick={(e) => handleRemove(opt.value, e)}
                    className="hover:opacity-70"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="flex items-center gap-1">
            {clearable && value.length > 0 && (
              <button
                onClick={handleClear}
                className="p-0.5 hover:bg-muted rounded transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <ChevronDown
              className={cn(
                'h-4 w-4 transition-transform',
                isOpen && 'rotate-180'
              )}
            />
          </div>
        </button>

        {/* Dropdown menu */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border border-input rounded-md shadow-lg">
            {/* Search input */}
            {searchable && (
              <div className="p-2 border-b border-input">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setHighlightedIndex(0);
                    }}
                    onKeyDown={handleKeyDown}
                    className="w-full pl-8 pr-3 py-1.5 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            )}

            {/* Options list */}
            <div className="max-h-60 overflow-y-auto">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-8 text-center text-sm text-muted-foreground">
                  No options found
                </div>
              ) : (
                filteredOptions.map((option, index) => (
                  <label
                    key={option.value}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 text-sm cursor-pointer transition-colors',
                      'hover:bg-muted',
                      highlightedIndex === index && 'bg-muted',
                      option.disabled && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={value.includes(option.value)}
                      onChange={() => handleToggle(option.value)}
                      disabled={option.disabled || (maxItems && value.length >= maxItems && !value.includes(option.value))}
                      className="rounded border-input"
                    />
                    <div>
                      <div>{option.label}</div>
                      {option.description && (
                        <div className="text-xs text-muted-foreground">
                          {option.description}
                        </div>
                      )}
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
);

MultiSelect.displayName = 'MultiSelect';
