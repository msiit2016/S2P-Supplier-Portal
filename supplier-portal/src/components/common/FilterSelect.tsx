import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface FilterSelectOption {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
}

export interface FilterSelectProps {
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement> | { target: { value: string; name?: string } }) => void;
  options?: FilterSelectOption[];
  className?: string;
  wrapperClassName?: string;
  dropdownClassName?: string;
  icon?: React.ReactNode;
  align?: 'left' | 'right' | 'auto';
  title?: string;
  name?: string;
  disabled?: boolean;
  placeholder?: string;
  children?: React.ReactNode;
}

/**
 * Enterprise Design System FilterSelect Component
 * Replaces unstyled/misaligned native browser OS select popups with a pixel-perfect,
 * beautifully anchored custom dropdown menu matching the Verisource design system.
 */
export const FilterSelect: React.FC<FilterSelectProps> = ({
  value,
  onChange,
  options,
  className = '',
  wrapperClassName = '',
  dropdownClassName = '',
  icon,
  align = 'auto',
  title,
  name = '',
  disabled = false,
  placeholder = 'Select option...',
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [computedAlign, setComputedAlign] = useState<'left' | 'right'>(
    align === 'right' ? 'right' : 'left'
  );

  // Parse options from either `options` prop or `children` (<option> tags)
  const parsedOptions: FilterSelectOption[] = useMemo(() => {
    if (options && options.length > 0) return options;
    const list: FilterSelectOption[] = [];
    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child)) {
        const val = child.props.value !== undefined ? String(child.props.value) : '';
        const lbl = child.props.children ?? val;
        list.push({
          value: val,
          label: lbl,
          disabled: child.props.disabled,
        });
      }
    });
    return list;
  }, [children, options]);

  // Determine currently selected option
  const selectedOption = useMemo(() => {
    return parsedOptions.find((opt) => String(opt.value) === String(value)) || parsedOptions[0];
  }, [parsedOptions, value]);

  // Handle alignment detection on open
  useEffect(() => {
    if (!isOpen) return;

    if (align !== 'auto') {
      setComputedAlign(align);
      return;
    }

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const estimatedMenuWidth = Math.max(rect.width, 190);
      // If menu would extend beyond viewport right edge, align right
      if (rect.left + estimatedMenuWidth > window.innerWidth - 16) {
        setComputedAlign('right');
      } else {
        setComputedAlign('left');
      }
    }
  }, [isOpen, align]);

  // Close on outside click or Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (optValue: string, isOptDisabled?: boolean) => {
    if (isOptDisabled || disabled) return;
    setIsOpen(false);
    if (String(optValue) !== String(value)) {
      onChange?.({
        target: { value: optValue, name },
        currentTarget: { value: optValue, name },
      } as any);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative inline-block text-left ${wrapperClassName}`}
    >
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        title={title}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`inline-flex items-center justify-between text-xs bg-white border rounded-lg text-slate-700 font-medium hover:border-slate-300 focus:outline-none cursor-pointer shadow-2xs transition-all duration-150 ${
          isOpen
            ? 'border-slate-300 ring-2 ring-slate-900/5 bg-slate-50/70 text-slate-900'
            : 'border-slate-200 hover:bg-slate-50/50'
        } pl-2.5 pr-2 py-1.5 gap-2 ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        } ${className}`}
      >
        <span className="inline-flex items-center gap-1.5 truncate">
          {icon && (
            <span className="text-slate-400 shrink-0">
              {icon}
            </span>
          )}
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 shrink-0 stroke-[2] transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-slate-600' : ''
          }`}
        />
      </button>

      {/* Hidden native select for form accessibility */}
      <select
        aria-hidden="true"
        tabIndex={-1}
        name={name}
        value={value}
        onChange={() => {}}
        className="sr-only pointer-events-none"
      >
        {parsedOptions.map((opt) => (
          <option key={opt.value} value={opt.value} disabled={opt.disabled}>
            {typeof opt.label === 'string' ? opt.label : opt.value}
          </option>
        ))}
      </select>

      {/* Custom Dropdown Menu Popover */}
      {isOpen && (
        <div
          ref={dropdownRef}
          role="listbox"
          className={`absolute top-full mt-1.5 z-50 bg-white rounded-xl border border-slate-200/90 shadow-lg shadow-slate-900/10 p-1 min-w-full sm:min-w-[190px] max-w-[320px] max-h-64 overflow-y-auto overscroll-contain animate-in fade-in-50 zoom-in-95 duration-100 ${
            computedAlign === 'right' ? 'right-0' : 'left-0'
          } ${dropdownClassName}`}
        >
          {parsedOptions.map((opt) => {
            const isSelected = String(opt.value) === String(value);
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                disabled={opt.disabled}
                onClick={() => handleSelect(opt.value, opt.disabled)}
                className={`w-full text-left px-2.5 py-1.5 text-xs rounded-lg transition-colors flex items-center justify-between gap-2.5 cursor-pointer ${
                  opt.disabled
                    ? 'opacity-40 cursor-not-allowed text-slate-400'
                    : isSelected
                    ? 'bg-slate-100 font-semibold text-slate-900'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium'
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-slate-800 shrink-0 stroke-[2.5]" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
