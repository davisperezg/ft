import { ColumnDef } from "@tanstack/react-table";
import { useTipoDocs } from "../hooks/useTipoDocs";
import { useMemo } from "react";
import { ITipoDoc } from "../../../interfaces/features/tipo-docs-cpe/tipo-docs.interface";
import { DataTable } from "../../../components/common/Table/DataTable";

interface Props {
  onRowClick: (row: ITipoDoc) => void;
  getItemsRemoves: (items: any[]) => void;
  getItemsRestores: (items: any[]) => void;
}

const TipoDocsList = ({
  onRowClick,
  getItemsRemoves,
  getItemsRestores,
}: Props) => {
  const {
    data,
    //error: errorTipdocs,
    isLoading,
    //isError: isErrorTipdocs,
  } = useTipoDocs();

  const columns = useMemo<ColumnDef<ITipoDoc>[]>(
    () => [
      {
        accessorKey: "nombre",
        id: "nombre",
        header: () => {
          return <div className="select-none">Nombre</div>;
        },
        cell: ({ getValue }) => {
          return <div className="w-full">{getValue() as any}</div>;
        },
        size: 150,
        minSize: 31,
      },
      {
        accessorKey: "codigo",
        id: "codigo",
        header: () => {
          return <div className="w-full text-center select-none">Codigo</div>;
        },
        cell: ({ getValue }) => {
          return <div className="w-full text-center">{getValue() as any}</div>;
        },
        size: 100,
        minSize: 31,
      },
      {
        accessorKey: "abreviado",
        id: "abreviado",
        header: () => {
          return (
            <div className="w-full text-center select-none">Abreviado</div>
          );
        },
        cell: ({ getValue }) => {
          return <div className="w-full text-center">{getValue() as any}</div>;
        },
        size: 100,
        minSize: 31,
      },
      {
        accessorKey: "show_columns",
        header: () => {
          return <div className="select-none text-center w-full">...</div>;
        },
        size: 28,
        minSize: 28,
        enableResizing: false,
        enableSorting: false,
        enableHiding: false,
      },
    ],
    []
  );

  return (
    <>
      <DataTable<ITipoDoc>
        isLoading={isLoading}
        data={data || []}
        columns={columns}
        getItemsRemoves={getItemsRemoves}
        getItemsRestores={getItemsRestores}
        onRowClick={onRowClick}
        selects
      />
    </>
  );
};

export default TipoDocsList;
