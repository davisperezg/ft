import { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { useModules } from "../hooks/useModuleS";
import { IModulosSystem } from "../../../interfaces/features/modulo/modulo_system.interface";
import { DataTable } from "../../../components/common/Table/DataTable";
import { toast } from "sonner";

interface Props {
  onRowClick: (row: IModulosSystem) => void;
  getItemsRemoves: (items: any[]) => void;
  getItemsRestores: (items: any[]) => void;
}

const ModulosSystemList = ({
  onRowClick,
  getItemsRemoves,
  getItemsRestores,
}: Props) => {
  const { data, error, isLoading, isError } = useModules();

  const columns = useMemo<ColumnDef<IModulosSystem>[]>(
    () => [
      {
        accessorKey: "name",
        id: "name",
        header: () => {
          return <div className="w-full select-none">Nombre</div>;
        },
        cell: ({ getValue }) => {
          return <div className="w-full">{getValue() as any}</div>;
        },
        size: 100,
        minSize: 31,
      },
      {
        accessorKey: "description",
        id: "description",
        header: () => {
          return <div className="w-full select-none">Descripción</div>;
        },
        cell: ({ getValue }) => {
          return <div className="w-full">{getValue() as any}</div>;
        },
        size: 100,
        minSize: 31,
      },
      {
        accessorKey: "creator",
        id: "creator",
        header: () => {
          return <div className="w-full select-none">Creador</div>;
        },
        cell: ({ getValue }: any) => {
          return (
            <div className="w-full">
              {getValue() === null ? "root" : getValue().email}
            </div>
          );
        },
        size: 100,
        minSize: 31,
      },
      {
        accessorKey: "deletedAt",
        id: "deletedAt",
        header: () => {
          return <div className="w-full select-none">Fecha desactivada</div>;
        },
        cell: ({ getValue }) => {
          return <div className="w-full">{getValue() as any}</div>;
        },
        size: 100,
        minSize: 31,
      },
      {
        accessorKey: "restoredAt",
        id: "restoredAt",
        header: () => {
          return <div className="w-full select-none">Fecha restaurada</div>;
        },
        cell: ({ getValue }) => {
          return <div className="w-full">{getValue() as any}</div>;
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
      <DataTable<IModulosSystem>
        isLoading={isLoading}
        data={data || []}
        columns={columns}
        getItemsRemoves={getItemsRemoves}
        getItemsRestores={getItemsRestores}
        onRowClick={onRowClick}
        selects
      />

      {isError && toast.error(error?.response.data.message)}
    </>
  );
};

export default ModulosSystemList;
