import { Title } from "@/lib/api";
import { readingStatusLabels } from "@/lib/reading-status";

type TitleCardProps = {
  title: Title;
};

export function TitleCard({ title }: TitleCardProps) {
  const hasKnownTotal = title.totalChapters !== null && title.totalChapters > 0;

  return (
    <article className="flex h-full flex-col rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-start gap-4">
        <div
          aria-hidden="true"
          className="flex h-24 w-16 shrink-0 items-center justify-center
        rounded-lg bg-surface-muted text-2xl font-semibold text-muted-foreground"
        >
          {title.title.slice(0, 1).toLocaleUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">
            {readingStatusLabels[title.status]}
          </p>
          <h3 className="mt-2 line-clamp-2 text-base font-semibold leading-6">
            {title.title}
          </h3>
          {title.author && (
            <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
              {title.author}
            </p>
          )}
        </div>
      </div>
      <div className="mt-auto pt-6">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">
            Глава {title.currentChapter}
          </span>
          {hasKnownTotal && ` из ${title.totalChapters}`}
          </p>

          {hasKnownTotal && (
            <progress value={title.currentChapter} max={title.totalChapters ?? 1}
            aria-label={`Прогресс чтения: ${title.title}`}
            className="mt-3 block h-1.5 w-full overflow-hidden rounded-full border-0 bg-surface-muted
            [&::-moz-progress-bar]:rounded-full [&::-moz-progress-bar]:bg-primary
            [&::-webkit-progress-bar]:bg-surface-muted [&::-webkit-progress-value]:rounded-full 
            [&::-webkit-progress-value]:bg-primary
            "
            />
          )}
      </div>
    </article>
  );
}
