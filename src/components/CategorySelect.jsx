import { useMemo } from 'react';
import SmartSelect from './SmartSelect';

/**
 * Searchable course-category picker. Stores the category id and hands the full
 * category object back as the second argument.
 */
export default function CategorySelect({
  categories = [],
  value,
  onChange,
  placeholder = 'Not assigned',
  allowEmpty = true,
  ...rest
}) {
  const options = useMemo(
    () => categories.map((category) => ({ value: category._id, label: category.name, category })),
    [categories]
  );

  const selected = useMemo(() => {
    if (value === undefined || value === null || value === '') return null;
    return options.find((o) => o.value === value) || null;
  }, [options, value]);

  return (
    <SmartSelect
      options={options}
      value={selected}
      onChange={(option) => onChange(option ? option.value : '', option ? option.category : null)}
      placeholder={placeholder}
      isClearable={allowEmpty}
      {...rest}
    />
  );
}