import { Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import useDebounce from '../../hooks/useDebounce.js';

/** Debounced search box with clear button. Calls onSearch(value) 300 ms after typing stops. */
export default function SearchInput({
  value = '',
  onSearch,
  placeholder = 'Search…',
  className = '',
}) {
  const [text, setText] = useState(value);
  const debounced = useDebounce(text, 300);

  useEffect(() => {
    if (debounced !== value) onSearch(debounced);
  }, [debounced]);

  const clear = () => {
    setText('');
    onSearch('');
  };

  return (
    <div className={`relative ${className}`}>
      <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
      <input
        type="search"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-9 w-full rounded-xl border border-border bg-surface-2 pr-8 pl-9 text-sm text-text-strong placeholder:text-muted/50 hover:border-border-2 focus:border-accent focus:ring-2 focus:ring-accent/15 focus:outline-none transition-all sm:w-56"
      />
      {text && (
        <button
          type="button"
          onClick={clear}
          className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted hover:text-text-strong transition-colors"
          aria-label="Clear search"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
