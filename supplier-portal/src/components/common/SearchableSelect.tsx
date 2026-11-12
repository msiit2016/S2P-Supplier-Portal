import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Search, ChevronDown, Check, X } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  code?: string;
  sublabel?: string;
  category?: string;
  disabled?: boolean;
}

export interface SearchableSelectProps {
  /** Array of string values or structured SelectOption objects */
  options: (string | SelectOption)[];
  /** Selected value for single-select mode */
  value?: string;
  /** Called when a value is selected (standard change) */
  onChange?: (value: string) => void;
  /** Called when an option is selected in additive picker mode */
  onSelect?: (value: string) => void;
  /** Placeholder text shown on the trigger */
  placeholder?: string;
  /** Placeholder text inside the search input */
  searchPlaceholder?: string;
  /** Disabled state */
  disabled?: boolean;
  /** If true, trigger always shows placeholder and resets search on select (ideal for + Add Category... pickers) */
  resetOnSelect?: boolean;
  /** Visual variant of trigger button */
  variant?: 'default' | 'dashed' | 'table' | 'ghost';
  /** Custom CSS classes for trigger */
  className?: string;
  /** Custom CSS classes for dropdown popover container */
  dropdownClassName?: string;
  /** Custom empty results message */
  emptyMessage?: string;
  /** Minimum width of the dropdown popover */
  minDropdownWidth?: string;
  /** Maximum height of the scrollable list (default max-h-60) */
  maxListHeight?: string;
  /** Left icon for trigger */
  icon?: React.ReactNode;
  /** Show search count badge */
  showCount?: boolean;
  /** Whether to show the search input inside dropdown (defaults to true if options.length > 5) */
  searchable?: boolean;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  onSelect,
  placeholder = 'Select option...',
  searchPlaceholder = 'Search...',
  disabled = false,
  resetOnSelect = false,
  variant = 'default',
  className = '',
  dropdownClassName = '',
  emptyMessage = 'No matching options found',
  minDropdownWidth = 'min-w-[240px]',
  maxListHeight = 'max-h-64',
  icon,
  showCount = true,
  searchable
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Floating coordinates calculated from trigger button
  const [coords, setCoords] = useState<{
    top?: number;
    bottom?: number;
    left: number;
    width: number;
    openUpward: boolean;
  }>({ left: 0, width: 240, openUpward: false });

  // Normalize options into structured SelectOption objects
  const normalizedOptions: SelectOption[] = useMemo(() => {
    return options.map((opt) => {
      if (typeof opt === 'string') {
        // Detect format "CODE - Label"
        if (opt.includes(' - ')) {
          const [code, ...rest] = opt.split(' - ');
          return {
            value: opt,
            label: rest.join(' - '),
            code: code.trim()
          };
        }
        return {
          value: opt,
          label: opt
        };
      }
      return opt;
    });
  }, [options]);

  // Filter options based on search query (matches label, value, code, or sublabel)
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return normalizedOptions;
    const q = searchQuery.toLowerCase().trim();
    return normalizedOptions.filter((opt) => {
      const matchLabel = opt.label.toLowerCase().includes(q);
      const matchValue = opt.value.toLowerCase().includes(q);
      const matchCode = opt.code ? opt.code.toLowerCase().includes(q) : false;
      const matchSublabel = opt.sublabel ? opt.sublabel.toLowerCase().includes(q) : false;
      return matchLabel || matchValue || matchCode || matchSublabel;
    });
  }, [normalizedOptions, searchQuery]);

  // Find currently selected option
  const selectedOption = useMemo(() => {
    if (resetOnSelect) return null;
    return (
      normalizedOptions.find((opt) => opt.value === value) ||
      normalizedOptions.find((opt) => opt.label.toLowerCase() === (value || '').toLowerCase()) ||
      null
    );
  }, [normalizedOptions, value, resetOnSelect]);

  // Determine whether search input is shown (default: true if > 5 options)
  const isSearchable = searchable !== undefined ? searchable : normalizedOptions.length > 5;

  // Update floating popover position relative to viewport
  const updatePosition = () => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    
    // If not enough space below (< 260px) and more space above, open upwards
    const openUpward = spaceBelow < 260 && spaceAbove > spaceBelow;

    // Constrain width to exactly match trigger width for seamless alignment
    // For narrow triggers (< 180px), use min 220px to avoid text truncation
    const width = rect.width >= 180 ? rect.width : Math.max(rect.width, 220);
    let left = rect.left;

    // Prevent horizontal overflow past right edge of window; align flush to trigger right edge if constrained
    if (left + width > window.innerWidth - 12) {
      left = Math.max(12, rect.right - width);
      if (left + width > window.innerWidth - 12) {
        left = Math.max(12, window.innerWidth - width - 12);
      }
    }

    if (openUpward) {
      setCoords({
        bottom: window.innerHeight - rect.top + 4,
        left,
        width,
        openUpward: true
      });
    } else {
      setCoords({
        top: rect.bottom + 4,
        left,
        width,
        openUpward: false
      });
    }
  };

  // Open & Focus search input
  const handleToggle = () => {
    if (disabled) return;
    const nextState = !isOpen;
    if (nextState) {
      updatePosition();
      setSearchQuery('');
      setHighlightedIndex(0);
      setIsOpen(true);
      setTimeout(() => {
        updatePosition();
        if (isSearchable) {
          searchInputRef.current?.focus();
        }
      }, 30);
    } else {
      setIsOpen(false);
    }
  };

  // Keep popover aligned on scroll and resize
  useEffect(() => {
    if (!isOpen) return;
    updatePosition();

    const handleScrollOrResize = () => {
      updatePosition();
    };

    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen]);

  // Close on outside click (checks both trigger container and portal dropdown)
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current && 
        !containerRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault();
        handleToggle();
      }
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => {
        const next = prev < filteredOptions.length - 1 ? prev + 1 : 0;
        scrollOptionIntoView(next);
        return next;
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => {
        const next = prev > 0 ? prev - 1 : filteredOptions.length - 1;
        scrollOptionIntoView(next);
        return next;
      });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const current = filteredOptions[highlightedIndex];
      if (current && !current.disabled) {
        handleSelectOption(current);
      }
    }
  };

  const scrollOptionIntoView = (index: number) => {
    if (!listRef.current) return;
    const el = listRef.current.children[index] as HTMLElement;
    if (el) {
      el.scrollIntoView({ block: 'nearest' });
    }
  };

  const handleSelectOption = (option: SelectOption) => {
    if (option.disabled) return;
    if (onChange) {
      onChange(option.value);
    }
    if (onSelect) {
      onSelect(option.value);
    }
    setSearchQuery('');
    setIsOpen(false);
  };

  // Trigger button styling variants
  let triggerClasses = '';
  switch (variant) {
    case 'dashed':
      triggerClasses = `border border-dashed border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-100/80 text-slate-700 hover:text-slate-900 rounded-md px-2.5 py-1 text-xs font-medium shadow-2xs`;
      break;
    case 'table':
      triggerClasses = `border border-slate-200 hover:border-slate-300 bg-white text-slate-900 rounded-lg px-2.5 py-1.5 text-xs font-medium shadow-2xs`;
      break;
    case 'ghost':
      triggerClasses = `border border-transparent hover:border-slate-200 bg-transparent hover:bg-slate-50 text-slate-700 rounded-md px-2 py-1 text-xs font-medium`;
      break;
    case 'default':
    default:
      triggerClasses = disabled
        ? `bg-slate-50 text-slate-700 border-slate-200 cursor-default px-3 py-2 text-xs rounded-lg border`
        : `bg-white text-slate-900 ${
            isOpen 
              ? 'border-emerald-600 ring-1 ring-emerald-600 shadow-sm' 
              : 'border-slate-300 hover:border-slate-400 shadow-2xs'
          } focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 px-3 py-2 text-xs rounded-lg border`;
      break;
  }

  // Display label
  const displayLabel = resetOnSelect
    ? placeholder
    : selectedOption
    ? selectedOption.label
    : placeholder;

  // Render Portal Popover directly into document.body to prevent clipping by overflow-hidden containers
  const portalDropdown = isOpen && typeof document !== 'undefined' ? (
    createPortal(
      <div
        ref={dropdownRef}
        style={{
          position: 'fixed',
          top: coords.openUpward ? undefined : `${coords.top}px`,
          bottom: coords.openUpward ? `${coords.bottom}px` : undefined,
          left: `${coords.left}px`,
          width: `${coords.width}px`,
          zIndex: 999999
        }}
        className={`bg-white border border-slate-200 rounded-xl shadow-xl ring-1 ring-black/5 overflow-hidden animate-in fade-in zoom-in-95 duration-100 ${dropdownClassName}`}
        role="listbox"
      >
        {/* Search Header (rendered when options > 5 or searchable is true) */}
        {isSearchable && (
          <div className="p-2 border-b border-slate-100 bg-slate-50/95">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 absolute left-2.5 text-slate-400 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setHighlightedIndex(0);
                }}
                placeholder={searchPlaceholder}
                className="w-full pl-8 pr-7 py-1.5 text-xs bg-white text-slate-900 border border-slate-200 rounded-lg placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    searchInputRef.current?.focus();
                  }}
                  className="absolute right-2 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {showCount && (
              <div className="flex items-center justify-between pt-1.5 px-0.5 text-[10px] text-slate-500 font-mono">
                <span>
                  {filteredOptions.length} {filteredOptions.length === 1 ? 'option' : 'options'}
                </span>
                {searchQuery && (
                  <span className="text-emerald-600 font-semibold">filtered</span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Options List */}
        <div 
          ref={listRef}
          className={`p-1 overflow-y-auto ${maxListHeight} divide-y divide-slate-50`}
        >
          {filteredOptions.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400 italic px-3">
              {emptyMessage}
            </div>
          ) : (
            filteredOptions.map((option, idx) => {
              const isSelected = !resetOnSelect && value === option.value;
              const isHighlighted = idx === highlightedIndex;

              return (
                <div
                  key={option.value || idx}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelectOption(option)}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  className={`flex ${option.sublabel ? 'items-start' : 'items-center'} justify-between gap-2 px-3 py-2 text-xs rounded-lg cursor-pointer transition select-none ${
                    isSelected
                      ? 'bg-emerald-50 text-emerald-900 font-semibold'
                      : isHighlighted
                      ? 'bg-slate-100 text-slate-900'
                      : 'text-slate-700 hover:bg-slate-50'
                  } ${option.disabled ? 'opacity-40 pointer-events-none' : ''}`}
                >
                  <div className="flex items-start gap-1.5 min-w-0 flex-1">
                    {option.code && (
                      <span className="font-mono text-[9px] font-bold text-slate-600 bg-slate-100 px-1 py-0.5 rounded border border-slate-200 shrink-0 mt-0.5">
                        {option.code}
                      </span>
                    )}
                    <div className="flex flex-col min-w-0">
                      <span className="leading-snug break-words">
                        {option.label}
                      </span>
                      {option.sublabel && (
                        <span className="text-[10px] text-slate-500 font-normal leading-tight">
                          {option.sublabel}
                        </span>
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>,
      document.body
    )
  ) : null;

  return (
    <div 
      ref={containerRef} 
      className={`relative inline-block w-full ${disabled ? 'pointer-events-none opacity-80' : ''}`}
      onKeyDown={handleKeyDown}
    >
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={`w-full min-h-[38px] flex items-center justify-between gap-2 transition cursor-pointer text-left select-none ${triggerClasses} ${className}`}
      >
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          {icon && <span className="shrink-0 text-slate-400">{icon}</span>}
          {selectedOption?.code && !resetOnSelect && (
            <span className="font-mono text-[10px] font-bold text-slate-600 bg-slate-100 px-1 py-0.5 rounded border border-slate-200 shrink-0">
              {selectedOption.code}
            </span>
          )}
          <span 
            className={`truncate ${
              !selectedOption && !resetOnSelect ? 'text-slate-400' : 'text-slate-800 font-medium'
            }`}
            title={typeof displayLabel === 'string' ? displayLabel : undefined}
          >
            {displayLabel}
          </span>
        </div>
        <ChevronDown 
          className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-emerald-600' : ''
          }`} 
        />
      </button>

      {/* Render popover via React Portal */}
      {portalDropdown}
    </div>
  );
};
