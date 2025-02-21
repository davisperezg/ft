import { ExtendedColumnDef } from "@tanstack/react-table";
import { Row } from "@tanstack/react-table";

export interface ExtendedTableOptions {
  loading?: boolean;
  footerVisible?: boolean;
  getItemsRemoves?: (items: Row<object>[]) => void;
}

export interface BaseDataType {
  status: boolean;
}

export interface IPagination<T> {
  statusCode: string;
  pageCount: number;
  rowCount: number;
  nextPage?: boolean;
  prevPage?: boolean;
  items: T[];
}

export interface TableProps<T extends object> {
  data: T[];
  columns: ExtendedColumnDef<T>[];
  isLoading?: boolean;
  onRowClick?: (row: T) => void;
  footerVisible?: boolean;
  getItemsRemoves?: (items: Row<T>[]) => void;
  getItemsRestores?: (items: Row<T>[]) => void;
  sortDescFirst?: boolean;
  selects?: boolean;
  manualSorting?: boolean;
}
