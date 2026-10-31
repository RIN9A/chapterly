import { LibraryFilter, libraryFilters } from "@/lib/reading-status";

type LibraryToolbarProps = {
  query: string;
  filter: LibraryFilter;
  onQueryChange: (query: string) => void;
  onFilterChange: (filter: LibraryFilter) => void;
};

export function LibraryToolbar({
  query,
  filter,
  onQueryChange,
  onFilterChange,
}: LibraryToolbarProps) {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="library-search">Поиск по названию или автору</label>
        <input
          id="library-search"
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Найти название или автора..."
          className="min-h-11 w-full rounded-xl border border-border
      bg-surface px-4 py-2.5 text-base text-foreground placeholder:text-muted-foreground
      sm:max-w-md sm:text-sm"
        />
      </div>
      <div
        role="group"
        aria-label="Фильтр по статусу чтения"
        className="flex flex-wrap gap-2"
      >
        {libraryFilters.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            aria-pressed={filter === value}
            className={[
              "min-h-11 rounded-full border px-4 py-2 text-sm",
              "transition-colors",
              filter === value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-surface text-muted-foreground hover:bg-surface-muted hover:text-foreground",
            ].join(" ")}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
