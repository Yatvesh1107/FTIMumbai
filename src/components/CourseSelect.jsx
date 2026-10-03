import { useMemo } from 'react';
import SmartSelect from './SmartSelect';

const ALL_COURSES = 'All';

/**
 * Searchable course picker. Stores the course id (or the course name when
 * `valueBy` is overridden) and hands the full course object back as the second
 * argument so existing cascade handlers keep working unchanged.
 */
export default function CourseSelect({
  courses = [],
  value,
  onChange,
  placeholder = 'Select a course',
  includeAll = false,
  allLabel = 'All Courses',
  valueBy = (course) => course._id,
  allowUnknown = false,
  ...rest
}) {
  const options = useMemo(() => {
    const list = courses.map((course) => ({
      value: valueBy(course),
      label: course.name,
      course
    }));
    if (includeAll) {
      return [{ value: ALL_COURSES, label: `${allLabel} (${courses.length})` }, ...list];
    }
    return list;
  }, [courses, includeAll, allLabel, valueBy]);

  const selected = useMemo(() => {
    if (value === undefined || value === null || value === '') return null;
    const match = options.find((o) => o.value === value);
    if (match) return match;
    // Legacy records can hold a value that is no longer in the list; keep it
    // visible instead of silently rendering an empty control.
    if (allowUnknown) return { value, label: String(value) };
    return null;
  }, [options, value, allowUnknown]);

  return (
    <SmartSelect
      options={options}
      value={selected}
      onChange={(option) => onChange(option ? option.value : '', option ? option.course : null)}
      placeholder={placeholder}
      {...rest}
    />
  );
}

export { ALL_COURSES };