import { TableFeature, Table, RowData, Row } from "@tanstack/react-table";

// define types for our new feature's table options
export interface BasicOptions<T> {
  acciones?: boolean;
  enableLoading?: boolean;
  enableFooter?: boolean;
  onClick?: (data: T) => void;
  getItemsRemoves?: (items: Row<T>[]) => void;
  getItemsRestores?: (items: Row<T>[]) => void;
}

// Use declaration merging to add our new feature APIs and state types to TanStack Table's existing types.
declare module "@tanstack/react-table" {
  //merge our new feature's options with the existing table options
  interface TableOptionsResolved<TData extends RowData>
    extends BasicOptions<TData> {}
}

// end of TS setup!

// Here is all of the actual javascript code for our new feature
export const BasicFeature: TableFeature<any> = {
  // define the new feature's default options
  getDefaultOptions: <TData extends RowData>(
    _table: Table<TData>
  ): BasicOptions<TData> => {
    return {
      acciones: false,
      enableLoading: false,
      enableFooter: false,
      onClick: (data: TData) => data,
      getItemsRemoves: (items: Row<TData>[]) => items,
      getItemsRestores: (items: Row<TData>[]) => items,
    } as BasicOptions<TData>;
  },
};
//end of custom feature code
