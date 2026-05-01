import type { ReactNode } from "react";
import styles from "@/styles/admin.module.css";

type DataTableProps = {
  headers: string[];
  children: ReactNode;
};

export function DataTable({ headers, children }: DataTableProps) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
