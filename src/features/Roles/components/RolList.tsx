import { useMemo, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useRoles } from "../hooks/useRoles";
import { toast } from "sonner";
import { IRol } from "../../../interfaces/models/rol/rol.interface";
import { DataTable } from "../../../components/common/Table/DataTable";

interface Props {
  onRowClick: (row: IRol) => void;
  getItemsRemoves: (items: any[]) => void;
  getItemsRestores: (items: any[]) => void;
}

const RolList = ({ onRowClick, getItemsRemoves, getItemsRestores }: Props) => {
  const {
    data,
    error: errorRoles,
    isLoading,
    isError: isErrorRoles,
  } = useRoles();

  const columns = useMemo<ColumnDef<IRol>[]>(
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

  useEffect(() => {
    if (isErrorRoles) {
      toast.error(errorRoles.response.data.message);
    }
  }, [isErrorRoles, errorRoles?.response.data.message]);

  return (
    <>
      <DataTable<IRol>
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

export default RolList;
