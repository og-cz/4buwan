import type { ReactNode } from "react";
import Icon from "./Icon";

export type Column<T> = { header: string; cell: (row: T) => ReactNode };

type Props<T> = { columns: Column<T>[]; rows: T[]; rowKey: (row: T) => string; onOpen?: (row: T) => void };

export default function DataTable<T>({ columns, rows, rowKey, onOpen }: Props<T>) {
  return <div className="table-scroll"><table>
    <thead><tr>{columns.map(c => <th key={c.header}>{c.header}</th>)}{onOpen && <th />}</tr></thead>
    <tbody>{rows.map(r => <tr key={rowKey(r)} className={onOpen ? "clickable-row" : ""} onClick={onOpen ? () => onOpen(r) : undefined}>{columns.map(c => <td key={c.header}>{c.cell(r)}</td>)}{onOpen && <td><Icon name="chevron" size={14} /></td>}</tr>)}</tbody>
  </table></div>;
}
