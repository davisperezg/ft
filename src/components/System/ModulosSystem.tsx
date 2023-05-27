import { ColumnDef } from "@tanstack/react-table";
import { useContext, useMemo, useState } from "react";
import { ModalContext } from "../../context/modalContext";
import {
  useDeleteModule,
  useModules,
  useRestoreModule,
} from "../../hooks/useModuleS";
import { IModulosSystem } from "../../interface/modulo_system.interface";
import IndeterminateCheckbox from "../Input/IndeterminateCheckbox";
import LoadingTotal from "../Loading/LoadingTotal";
import ComponentTable from "../Table/Index";
import ToastError from "../Toast/ToastError";

interface Props {
  openEdit: (value: boolean, row: IModulosSystem) => void;
}

const ModulosSystemList = ({ openEdit }: Props) => {
  const { data, error, isLoading, isError } = useModules();

  const {
    mutateAsync: mutateDelete,
    error: errorDelete,
    isError: isErrorDelete,
  } = useDeleteModule();

  const {
    mutateAsync: mutateRestore,
    error: errorRestore,
    isError: isErrorRestore,
  } = useRestoreModule();

  const loadData = useMemo(() => {
    if (data) {
      return data;
    }

    return [];
  }, [data]);

  console.log(data);

  const columns = useMemo<ColumnDef<IModulosSystem>[]>(
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
        accessorKey: "name",
        id: "name",
        header: () => {
          return <div className="p-[5px] text-[12px] select-none">Nombre</div>;
        },
        cell: ({ getValue }) => {
          return (
            <div className="p-[4px] pb-[4px] text-[12px] ">
              {getValue() as any}
            </div>
          );
        },
        size: 100,
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
        cell: ({ getValue }) => {
          return (
            <div className="p-[4px] pb-[4px] text-[12px] ">
              {getValue() as any}
            </div>
          );
        },
        size: 100,
        minSize: 31,
      },
      {
        accessorKey: "creator",
        id: "creator",
        header: () => {
          return <div className="p-[5px] text-[12px] select-none">Creador</div>;
        },
        cell: ({ getValue }: any) => {
          return (
            <div className="p-[4px] pb-[4px] text-[12px] ">
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
          return (
            <div className="p-[5px] text-[12px] select-none">Desactivación</div>
          );
        },
        cell: ({ getValue }) => {
          return (
            <div className="p-[4px] pb-[4px] text-[12px] ">
              {getValue() as any}
            </div>
          );
        },
        size: 100,
        minSize: 31,
      },
      {
        accessorKey: "restoredAt",
        id: "restoredAt",
        header: () => {
          return (
            <div className="p-[5px] text-[12px] select-none">Restauración</div>
          );
        },
        cell: ({ getValue }) => {
          return (
            <div className="p-[4px] pb-[4px] text-[12px] ">
              {getValue() as any}
            </div>
          );
        },
        size: 100,
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

  const getItemsRemoves = async (items: any) => {
    const eliminar = confirm(
      `Esta seguro que desea eliminar ${items.length} items ?`
    );

    if (eliminar) {
      for (let index = 0; index < items.length; index++) {
        const element = items[index];
        await mutateDelete({ id: element.original._id });
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
        await mutateRestore({ id: element.original._id });
      }
    }
  };

  return (
    <>
      {isLoading ? (
        <LoadingTotal />
      ) : (
        <ComponentTable
          data={loadData}
          columns={columns}
          getItemsRemoves={getItemsRemoves}
          getItemsRestores={getItemsRestores}
          openEdit={openEdit}
        />
      )}

      {isError && (
        <ToastError
          delay={5000}
          placeholder={isError}
          message={error?.response.data.message}
        />
      )}

      {isErrorDelete && (
        <ToastError
          delay={5000}
          placeholder={isErrorDelete}
          message={errorDelete?.response.data.message}
        />
      )}

      {isErrorRestore && (
        <ToastError
          delay={5000}
          placeholder={isErrorRestore}
          message={errorRestore?.response.data.message}
        />
      )}
    </>
  );
};

export default ModulosSystemList;
