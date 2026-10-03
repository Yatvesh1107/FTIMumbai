import { useMemo } from 'react';
import Select from 'react-select';
import clsx from 'clsx';

const PORTAL_TARGET = typeof document !== 'undefined' ? document.body : null;

const TONES = {
  slate: '#334155',
  navy: '#0b3c68',
  teal: '#0f766e',
  indigo: '#312e81'
};

const SIZES = {
  xs: { fontSize: '11px', minHeight: '34px', padding: '0.55rem' },
  sm: { fontSize: '12px', minHeight: '38px', padding: '0.7rem' },
  md: { fontSize: '14px', minHeight: '46px', padding: '0.85rem' }
};

const VARIANTS = {
  default: { background: '#ffffff', border: '#cbd5e1' },
  filter: { background: 'rgba(248, 250, 252, 0.6)', border: '#e2e8f0' }
};

/**
 * Drop-in styled wrapper around react-select that matches the native selects
 * used across the admin UI. The menu is portalled to <body> so dropdowns are
 * never clipped by the scrollable/clipped modal containers.
 */
export default function SmartSelect({
  options = [],
  value,
  onChange,
  variant = 'default',
  size = 'sm',
  tone = 'slate',
  placeholder = 'Select...',
  isSearchable = true,
  isClearable = false,
  isDisabled = false,
  isMulti = false,
  className,
  ...rest
}) {
  const look = VARIANTS[variant] || VARIANTS.default;
  const dims = SIZES[size] || SIZES.sm;
  const color = TONES[tone] || TONES.slate;
  // Let explicit Tailwind widths (e.g. filter bars) win over the full-width default.
  const hasWidthClass = /\b(?:w|min-w|max-w)-/.test(className || '');

  const styles = useMemo(
    () => ({
      container: (base) => (hasWidthClass ? base : { ...base, width: '100%' }),
      control: (base, state) => ({
        ...base,
        minHeight: dims.minHeight,
        borderRadius: '0.75rem',
        border: `1px solid ${state.isFocused ? color : look.border}`,
        background: look.background,
        boxShadow: 'none',
        cursor: state.isDisabled ? 'not-allowed' : 'pointer',
        fontSize: dims.fontSize,
        fontWeight: 700,
        '&:hover': { borderColor: state.isFocused ? color : '#94a3b8' }
      }),
      valueContainer: (base) => ({
        ...base,
        padding: `0.35rem ${dims.padding}`,
        gap: '0.25rem'
      }),
      multiValue: (base) => ({
        ...base,
        background: '#f1f5f9',
        borderRadius: '0.5rem',
        fontSize: dims.fontSize,
        fontWeight: 700
      }),
      multiValueLabel: (base) => ({ ...base, padding: '0.2rem 0.4rem', color: '#0f172a' }),
      multiValueRemove: (base) => ({
        ...base,
        color: '#64748b',
        '&:hover': { background: '#e2e8f0', color: '#0f172a' }
      }),
      input: (base) => ({ ...base, fontSize: dims.fontSize, fontWeight: 700, color }),
      singleValue: (base) => ({
        ...base,
        color,
        fontSize: dims.fontSize,
        fontWeight: 700
      }),
      placeholder: (base) => ({ ...base, color: '#94a3b8', fontSize: dims.fontSize, fontWeight: 600 }),
      indicatorSeparator: () => ({ display: 'none' }),
      dropdownIndicator: (base) => ({ ...base, color: '#94a3b8', padding: '0 0.5rem' }),
      clearIndicator: (base) => ({ ...base, color: '#94a3b8', padding: '0 0.5rem' }),
      menu: (base) => ({
        ...base,
        zIndex: 100,
        marginTop: 4,
        maxHeight: 288,
        borderRadius: '0.75rem',
        border: '1px solid #e2e8f0',
        background: '#ffffff',
        boxShadow: '0 12px 28px -8px rgba(15, 23, 42, 0.22)',
        fontSize: dims.fontSize,
        fontWeight: 600,
        overflow: 'auto'
      }),
      menuList: (base) => ({ ...base, padding: '0.25rem' }),
      option: (base, state) => ({
        ...base,
        padding: '0.5rem 0.65rem',
        borderRadius: '0.5rem',
        color: state.isDisabled ? '#cbd5e1' : state.isSelected ? '#0f172a' : '#334155',
        background: state.isSelected ? '#e2e8f0' : state.isFocused ? '#f8fafc' : '#ffffff',
        cursor: state.isDisabled ? 'not-allowed' : 'pointer',
        '&:hover': {
          background: state.isDisabled ? '#ffffff' : state.isSelected ? '#e2e8f0' : '#f1f5f9'
        }
      }),
      noOptionsMessage: (base) => ({
        ...base,
        color: '#94a3b8',
        fontSize: dims.fontSize,
        fontWeight: 600,
        padding: '0.5rem 0.65rem'
      })
    }),
    [dims, color, look, hasWidthClass]
  );

  return (
    <Select
      options={options}
      value={value}
      onChange={onChange}
      isSearchable={isSearchable}
      isClearable={isClearable}
      isDisabled={isDisabled}
      isMulti={isMulti}
      placeholder={placeholder}
      className={clsx(className)}
      classNamePrefix="fti-select"
      menuPortalTarget={PORTAL_TARGET}
      menuPortalStyle={{ zIndex: 100 }}
      noOptionsMessage={() => 'No matches found'}
      styles={styles}
      {...rest}
    />
  );
}