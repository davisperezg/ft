import { useMemo, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useResources } from "../hooks/useResources";
import { toast } from "sonner";
import { IPermisos } from "../../../interfaces/models/permisos/permisos.interface";
import { DataTable } from "../../../components/common/Table/DataTable";
import { IGroup } from "../../../interfaces/models/grupos/grupo-permiso.interface";

interface Props {
  onRowClick: (row: IPermisos) => void;
  getItemsRemoves: (items: any[]) => void;
  getItemsRestores: (items: any[]) => void;
}

const ResourceList = ({
  onRowClick,
  getItemsRemoves,
  getItemsRestores,
}: Props) => {
  const {
    data,
    error: errorResources,
    isLoading,
    isError: isErrorResources,
  } = useResources();

  const columns = useMemo<ColumnDef<IPermisos>[]>(
    () => [
      {
        accessorKey: "status",
        id: "status",
        header: () => {
          return <div className="w-full select-none text-center">Estado</div>;
        },
        cell: ({ getValue }) => {
          const estado = getValue() as any;
          return (
            <div
              className={`${estado ? "bg-green-600" : "bg-red-600"}
              w-[30px] h-full text-center m-auto`}
            ></div>
          );
        },
        size: 28,
        minSize: 28,
      },
      {
        accessorKey: "group_resource",
        id: "group_resource",
        header: () => {
          return <div className="w-full select-none">Categoría</div>;
        },
        cell: ({ getValue }) => {
          const group = getValue() as IGroup;
          return <div className="w-full">{group.name}</div>;
        },
        size: 100,
        minSize: 31,
        sortingFn: (rowA, rowB) => {
          const a = rowA.original.group_resource as IGroup;
          const b = rowB.original.group_resource as IGroup;
          return a.name.localeCompare(b.name);
        },
      },
      {
        accessorKey: "name",
        id: "name",
        header: () => {
          return <div className="w-full select-none">Permiso</div>;
        },
        cell: ({ getValue }) => {
          return <div className="w-full">{getValue() as any}</div>;
        },
        size: 200,
        minSize: 31,
      },
      {
        accessorKey: "description",
        id: "description",
        header: () => {
          return <div className="w-full select-none">Descripción</div>;
        },
        cell: (props) => {
          return <div className="w-full">{props.getValue() as any}</div>;
        },
        size: 620,
        minSize: 31,
      },
      {
        accessorKey: "key",
        id: "key",
        header: () => {
          return <div className="w-full select-none">Key</div>;
        },
        cell: (props) => {
          return <div className="w-full">{props.getValue() as any}</div>;
        },
        size: 180,
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
    if (isErrorResources) {
      toast.error(errorResources.response.data.message);
    }
  }, [isErrorResources, errorResources?.response.data.message]);

  return (
    <>
      <DataTable<IPermisos>
        isLoading={isLoading}
        data={data || []}
        columns={columns}
        getItemsRemoves={getItemsRemoves}
        getItemsRestores={getItemsRestores}
        onRowClick={onRowClick}
        selects
        //manualSorting
      />
    </>
  );
};

export default ResourceList;
