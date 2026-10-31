import { ReadingStatus } from "./api";

export const readingStatusLabels: Record<ReadingStatus, string> = {
  want_to_read: "В планах",
  reading: "Читаю",
  paused: "На паузе",
  finished: "Прочитано",
  dropped: "Брошено",
};

export type LibraryFilter = ReadingStatus | "all";

export const libraryFilters: {
  value: LibraryFilter;
  label: string;
}[] = [
  { value: "all", label: "Все" },
  { value: "reading", label: "Читаю" },
  { value: "want_to_read", label: "В планах" },
  { value: "finished", label: "Прочитано" },
  { value: "paused", label: "На паузе" },
  { value: "dropped", label: "Брошено" },
];
