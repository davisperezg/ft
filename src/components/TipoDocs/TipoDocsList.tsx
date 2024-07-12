import { ColumnDef } from "@tanstack/react-table";
import {
  useDisableTipDoc,
  useEnableTipDoc,
  useTipoDocs,
} from "../../hooks/useTipoDocs";
import { ITipoDoc } from "../../interface/tipodocs.interface";
import { useMemo } from "react";
import IndeterminateCheckbox from "../Input/IndeterminateCheckbox";
import ComponentTable from "../Table/Index";
import { isError } from "../../utils/functions";
import { toast } from "react-toastify";

interface Props {
  openEdit: (value: boolean, row: ITipoDoc) => void;
}

const TipoDocsList = ({ openEdit }: Props) => {
  const {
    data,
    //error: errorTipdocs,
    isLoading,
    //isError: isErrorTipdocs,
  } = useTipoDocs();

  const { mutateAsync: mutateDisable } = useDisableTipDoc();

  const { mutateAsync: mutateEnable } = useEnableTipDoc();

  const columns = useMemo<ColumnDef<ITipoDoc>[]>(
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
        accessorKey: "nombre",
        id: "nombre",
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
        accessorKey: "codigo",
        id: "codigo",
        header: () => {
          return <div className="p-[5px] text-[12px] select-none">Codigo</div>;
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
        accessorKey: "abreviado",
        id: "abreviado",
        header: () => {
          return (
            <div className="p-[5px] text-[12px] select-none">Abreviado</div>
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

  const loadData = useMemo(() => {
    if (data) {
      return data;
    }

    return [];
  }, [data]);

  const getItemsRemoves = async (items: any) => {
    const eliminar = confirm(
      `Esta seguro que desea eliminar ${items.length} items ?`
    );

    if (eliminar) {
      for (let index = 0; index < items.length; index++) {
        const element = items[index];
        try {
          await mutateDisable({ id: element.original.id });
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
          await mutateEnable({ id: element.original.id });
        } catch (e) {
          if (isError(e)) {
            toast.error(e.response.data.message);
          }
        }
      }
    }
  };

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

export default TipoDocsList;
