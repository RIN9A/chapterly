"use client";

import { type Title, getTitles, createTitle } from "@/lib/api";
import { createTitleSchema } from "@/lib/validation/title";
import { useActionState, useEffect, useState } from "react";
import z from "zod";
import { ThemeToggle } from "./theme-toggle";
import { TitleCard } from "./library/title-card";
import { LibraryFilter } from "@/lib/reading-status";
import { LibraryToolbar } from "./library/library-toolbar";
import { TitleGrid } from "./library/title-grid";
import { Button } from "./ui/button";

type FormValues = {
  title: string;
  author: string;
  currentChapter: string;
};

type FormState = {
  errors?: Partial<Record<keyof FormValues, string[]>>;
  message?: string;
  success?: string;
};
type LibraryState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; titles: Title[] };

const emptyValues: FormValues = {
  title: "",
  author: "",
  currentChapter: "0",
};

const initialFormState: FormState = {};

const inputClassName =
  "mt-2 w-full rounded-xl border border-border bg-surface " +
  "px-3 py-2.5 text-base text-foreground shadow-sm " +
  "placeholder:text-muted-foreground " +
  "aria-invalid:border-danger " +
  "disabled:cursor-not-allowed disabled:bg-surface-muted " +
  "sm:text-sm";

export function LibraryPage() {
  const [library, setLibrary] = useState<LibraryState>({
    status: "loading",
  });
  const [reloadKey, setReloadKey] = useState(0);
  const [values, setValues] = useState<FormValues>(emptyValues);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<LibraryFilter>("all");

  const normalizedQuery = query.trim().toLocaleLowerCase();

  const visibleTitles =
    library.status === "ready"
      ? library.titles.filter((title) => {
          const matchesStatus = filter === "all" || title.status === filter;
          const matchesQuery =
            title.title.toLocaleLowerCase().includes(normalizedQuery) ||
            title.author.toLocaleLowerCase().includes(normalizedQuery);

          return matchesStatus && matchesQuery;
        })
      : [];

  const isFiltered = filter !== "all" || normalizedQuery !== "";

  useEffect(() => {
    let ignore = false;
    const loadTitles = async () => {
      try {
        const { titles } = await getTitles();
        if (!ignore) {
          setLibrary({ status: "ready", titles });
        }
      } catch (error) {
        if (!ignore) {
          setLibrary({
            status: "error",
            message:
              error instanceof Error
                ? error.message
                : "Не удалось загрузить библиотеку",
          });
        }
      }
    };
    void loadTitles();

    return () => {
      ignore = true;
    };
  }, [reloadKey]);

  const handleSubmit = async (
    _previousState: FormState,
    formData: FormData,
  ): Promise<FormState> => {
    const result = createTitleSchema.safeParse({
      title: formData.get("title"),
      author: formData.get("author"),
      currentChapter: formData.get("currentChapter"),
    });
    if (!result.success) {
      return {
        errors: z.flattenError(result.error).fieldErrors,
      };
    }
    try {
      const created = await createTitle({
        ...result.data,
        status: "want_to_read",
        genres: [],
        note: "",
      });
      setLibrary((current) =>
        current.status === "ready"
          ? { status: "ready", titles: [created, ...current.titles] }
          : current,
      );
      setValues({ ...emptyValues });
      return {
        success: `«${created.title}» добавлен в библиотеку`,
      };
    } catch (error) {
      return {
        message:
          error instanceof Error ? error.message : "Не удалось добавить тайтл",
      };
    }
  };
  const [formState, formAction, pending] = useActionState(
    handleSubmit,
    initialFormState,
  );

  const retry = () => {
    setLibrary({ status: "loading" });
    setReloadKey((current) => current + 1);
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-10 flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Личная библиотека
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">
            Chapterly
          </h1>
          <p className="mt-3 text-muted-foreground">
            Сохраняйте истории и продолжайте с нужной главы.
          </p>
        </div>
        <ThemeToggle />
      </header>
      <div className="space-y-10">
        <section
          aria-labelledby="add-title-heading"
          className="max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-sm"
        >
          <h2 id="add-title-heading" className="text-lg font-semibold">
            Добавить тайтл
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Новый тайтл попадёт в список «В планах».
          </p>
          <form action={formAction} className="mt-6">
            <fieldset
              disabled={pending || library.status !== "ready"}
              className="min-w-0 space-y-5"
            >
              <legend className="sr-only">Информация о тайтле</legend>
              <div>
                <label htmlFor="title" className="text-sm font-medium">
                  Название
                </label>
                <input
                  id="title"
                  name="title"
                  required
                  maxLength={200}
                  value={values.title}
                  onChange={(event) =>
                    setValues((curr) => ({
                      ...curr,
                      title: event.target.value,
                    }))
                  }
                  aria-invalid={Boolean(formState.errors?.title)}
                  aria-describedby="title-error"
                  placeholder="Название тайтла"
                  className={inputClassName}
                />
                <p id="title-error" className="mt-1 text-sm text-danger">
                  {formState.errors?.title?.[0]}
                </p>
              </div>
              <div>
                <label htmlFor="author" className="text-sm font-medium">
                  Автор
                </label>
                <input
                  id="author"
                  name="author"
                  maxLength={200}
                  value={values.author}
                  onChange={(e) =>
                    setValues((curr) => ({ ...curr, author: e.target.value }))
                  }
                  aria-invalid={Boolean(formState.errors?.author)}
                  aria-describedby="author-error"
                  placeholder="Необязательно"
                  className={inputClassName}
                />
                <p id="author-error" className="mt-1 text-sm text-danger">
                  {formState.errors?.author?.[0]}
                </p>
              </div>
              <div>
                <label
                  htmlFor="currentChapter"
                  className="text-sm font-medium "
                >
                  Текущая глава
                </label>
                <input
                  id="currentChapter"
                  name="currentChapter"
                  type="number"
                  required
                  min={0}
                  step={1}
                  value={values.currentChapter}
                  onChange={(e) =>
                    setValues((cur) => ({
                      ...cur,
                      currentChapter: e.target.value,
                    }))
                  }
                  aria-invalid={Boolean(formState.errors?.currentChapter)}
                  aria-describedby="chapter-error"
                  className={inputClassName}
                />
                <p id="chapter-error" className="mt-1 text-sm text-danger">
                  {formState.errors?.currentChapter?.[0]}
                </p>
              </div>
              <Button type="submit" className="w-full">
                {pending ? "Добавляю..." : "Добавить в библиотеку"}
              </Button>
            </fieldset>

            {formState.message && (
              <p role="alert" className="mt-4 text-sm leading-6 text-danger">
                {formState.message}
              </p>
            )}
            <p
              role="status"
              aria-atomic="true"
              className="mt-4 text-sm leading-6 text-success0"
            >
              {pending ? "" : formState.success}
            </p>
          </form>
        </section>
        <section
          aria-labelledby="library-heading"
          aria-busy={library.status === "loading"}
          className="min-w-0"
        >
          <h2 id="library-heading" className="mb-5 text-xl font-semibold">
            Моя библиотека
            {library.status === "ready" && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                {library.titles.length}
              </span>
            )}
          </h2>

          {library.status === "loading" && (
            <p role="status" className="text-sm text-muted-foreground">
              Загружаю библиотеку...
            </p>
          )}

          {library.status === "error" && (
            <div className="rounded-2xl border border-danger/30 bg-danger-surface p-6">
              <p role="alert" className="text-sm text-danger">
                {library.message}
              </p>
              <Button type="button" onClick={retry} className="mt-4">
                Попробовать снова
              </Button>
            </div>
          )}
          {library.status === "ready" && (
            <div className="space-x-8y-6">
              <LibraryToolbar
                query={query}
                filter={filter}
                onQueryChange={setQuery}
                onFilterChange={setFilter}
              />
              <p role="status" className="text-sm text-muted-foreground">
                Найдено: {visibleTitles.length}
              </p>
              <TitleGrid titles={visibleTitles} isFiltered={isFiltered} />
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
