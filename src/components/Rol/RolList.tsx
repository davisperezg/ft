import { useMemo, useState } from "react";
import ComponentTable from "../Table/Index";
import { ColumnDef } from "@tanstack/react-table";
import { useDeleteRol, useRestoreRol, useRoles } from "../../hooks/useRoles";
import { IRol } from "../../interface/rol.interface";
import IndeterminateCheckbox from "../Input/IndeterminateCheckbox";
import ToastError from "../Toast/ToastError";
import LoadingTotal from "../Loading/LoadingTotal";

interface Props {
  openEdit: (value: boolean, row: IRol) => void;
}

const RolList = ({ openEdit }: Props) => {
  const { data, error, isLoading, isError } = useRoles();

  const {
    mutateAsync: mutateDelete,
    error: errorDelete,
    isError: isErrorDelete,
  } = useDeleteRol();

  const {
    mutateAsync: mutateRestore,
    error: errorRestore,
    isError: isErrorRestore,
  } = useRestoreRol();

  const columns = useMemo<ColumnDef<IRol>[]>(
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

  const loadData = useMemo(() => {
    if (data) {
      return data;
    }

    return [];
  }, [data]);

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
      {/* 6440abb3c63313d07627eb55 */}
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

export default RolList;
