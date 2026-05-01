import Link from "next/link";
import styles from "@/styles/admin.module.css";

type PaginationProps = {
  page: number;
  total: number;
  limit: number;
  basePath: string;
  query?: Record<string, string | undefined>;
};

export function Pagination({ page, total, limit, basePath, query = {} }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const buildHref = (nextPage: number) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    params.set("page", String(nextPage));
    params.set("limit", String(limit));
    return `${basePath}?${params.toString()}`;
  };

  return (
    <div className={styles.pagination}>
      <Link className={styles.button} href={buildHref(Math.max(1, page - 1))} aria-disabled={page <= 1}>
        Anterior
      </Link>
      <span>
        Pagina {page} de {totalPages}
      </span>
      <Link className={styles.button} href={buildHref(Math.min(totalPages, page + 1))} aria-disabled={page >= totalPages}>
        Proxima
      </Link>
    </div>
  );
}
