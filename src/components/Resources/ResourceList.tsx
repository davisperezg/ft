import { IPermisos } from "../../interface/permisos.interface";
import { useMemo, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import LoadingTotal from "../Loading/LoadingTotal";
import ComponentTable from "../Table/Index";
import {
  useActivateResources,
  useDesactivateResources,
  useResources,
} from "../../hooks/useResources";
import { toast } from "react-toastify";
import { isError } from "../../utils/functions";
import IndeterminateCheckbox from "../Input/IndeterminateCheckbox";

interface Props {
  openEdit: (value: boolean, row: IPermisos) => void;
}

const ResourceList = ({ openEdit }: Props) => {
  const {
    data,
    error: errorResources,
    isLoading,
    isError: isErrorResources,
  } = useResources();

  const { mutateAsync: mutateDesact } = useDesactivateResources();

  const { mutateAsync: mutateAct } = useActivateResources();

  const getItemsRemoves = async (items: any) => {
    const eliminar = confirm(
      `Esta seguro que desea eliminar ${items.length} items ?`
    );

    if (eliminar) {
      for (let index = 0; index < items.length; index++) {
        const element = items[index];
        try {
          await mutateDesact({ id: element.original._id });
        } catch (e) {
          if (isError(e)) {
            toast.error(e.response.data.message);
          }
        }
      }
    }
  };

  const getItemsRestores = async (items: any) => {
    const restaurar = confirm(
      `Esta seguro que desea restaurar ${items.length} items ?`
    );

    if (restaurar) {
      for (let index = 0; index < items.length; index++) {
        const element = items[index];
        try {
          await mutateAct({ id: element.original._id });
        } catch (e) {
          if (isError(e)) {
            toast.error(e.response.data.message);
          }
        }
      }
    }
  };

  const columns = useMemo<ColumnDef<IPermisos>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <div className="pl-[7px] pt-[5px]">
            <IndeterminateCheckbox
              {...{
                checked: table.getIsAllRowsSelected(),
                indeterminate: table.getIsSomeRowsSelected(),
                onChange: table.getToggleAllRowsSelectedHandler(),
              }}
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="pl-[7px] pt-[5px]">
            <IndeterminateCheckbox
              {...{
                checked: row.getIsSelected(),
                disabled: !row.getCanSelect(),
                indeterminate: row.getIsSomeSelected(),
                onChange: row.getToggleSelectedHandler(),
              }}
            />
          </div>
        ),
        size: 28,
        minSize: 28,
      },
      {
        accessorKey: "index",
        id: "index",
        header: () => {
          return (
            <div className="p-[5px] text-[12px] select-none text-center">#</div>
          );
        },
        cell: ({ getValue }) => {
          return (
            <div className="p-[4px] pb-[4px] text-[12px]  text-center">
              {getValue() as any}
            </div>
          );
        },
        size: 28,
        minSize: 28,
      },
      {
        accessorKey: "status",
        id: "status",
        header: () => {
          return (
            <div className="p-[5px] text-[12px] select-none text-center">
              Estado
            </div>
          );
        },
        cell: ({ getValue }) => {
          const estado = getValue() as any;
          return (
            <div
              className={`
              ${estado ? "bg-green-600" : "bg-red-600"}
              p-[4px] pb-[4px] text-[12px] text-center
            `}
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
          return (
            <div className="p-[5px] text-[12px] select-none">Categoría</div>
          );
        },
        cell: ({ getValue }) => {
          const group = getValue() as any;
          return (
            <div className="p-[4px] pb-[4px] text-[12px] ">{group.name}</div>
          );
        },
        size: 100,
        minSize: 31,
      },
      {
        accessorKey: "name",
        id: "name",
        header: () => {
          return <div className="p-[5px] text-[12px] select-none">Permiso</div>;
        },
        cell: ({ getValue }) => {
          return (
            <div className="p-[4px] pb-[4px] text-[12px] ">
              {getValue() as any}
            </div>
          );
        },
        size: 200,
        minSize: 31,
      },
      {
        accessorKey: "description",
        id: "description",
        header: () => {
          return (
            <div className="p-[5px] text-[12px] select-none">Descripción</div>
          );
        },
        cell: (props) => {
          return (
            <div className="p-[4px] pb-[4px] text-[12px] ">
              {props.getValue() as any}
            </div>
          );
        },
        size: 620,
        minSize: 31,
      },
      {
        accessorKey: "key",
        id: "key",
        header: () => {
          return <div className="p-[5px] text-[12px] select-none">Key</div>;
        },
        cell: (props) => {
          return (
            <div className="p-[4px] pb-[4px] text-[12px] ">
              {props.getValue() as any}
            </div>
          );
        },
        size: 180,
        minSize: 31,
      },
      {
        accessorKey: "actions",
        header: () => {
          return (
            <div className="p-[5px] text-[12px] select-none text-center">
              ...
            </div>
          );
        },
        size: 28,
        minSize: 28,
        enableResizing: false,
        enableSorting: false,
      },
    ],
    []
  );

  const loadData = useMemo(() => {
    if (data) {
      return data;
    }

    return [];
  }, [data]);

  useEffect(() => {
    if (isErrorResources) {
      toast.error(errorResources.response.data.message);
    }
  }, [isErrorResources, toast]);

  return (
    <>
      <ComponentTable
        loading={isLoading}
        data={loadData}
        columns={columns}
        getItemsRemoves={getItemsRemoves}
        getItemsRestores={getItemsRestores}
        openEdit={openEdit}
      />
    </>
  );
};

export default ResourceList;
