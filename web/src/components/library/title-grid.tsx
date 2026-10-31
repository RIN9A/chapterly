import { Title } from "@/lib/api";
import { TitleCard } from "./title-card";

type TitleGridProps = {
  titles: Title[];
  isFiltered: boolean;
};

export function TitleGrid({ titles, isFiltered }: TitleGridProps) {
  if (titles.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border px-6 py-14 text-center">
        <h3 className="text-lg font-medium">
          {isFiltered ? "Ничего не найдено" : "Библиотека пока пуста"}
        </h3>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
          {isFiltered
            ? "Попробуйте другое название или измените фильтр"
            : "Добавьте первый тайтл, чтобы сохранить прогресс чтения"}
        </p>
      </div>
    );
  }
  return (
    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {titles.map((title) => (
        <li key={title.id} className="min-w-0">
          <TitleCard title={title} />
        </li>
      ))}
    </ul>
  );
}
