import { IEmpresa } from "../../interface/empresa.interface";
import IndeterminateCheckbox from "../Input/IndeterminateCheckbox";
import { useMemo, useEffect } from "react";
import LoadingTotal from "../Loading/LoadingTotal";
import ComponentTable from "../Table/Index";
import { ColumnDef } from "@tanstack/react-table";
import {
  useDisableEmpresas,
  useEmpresas,
  useEnableEmpresas,
} from "../../hooks/useEmpresa";
import { isError } from "../../utils/functions";
import { toast } from "react-toastify";

interface Props {
  openEdit: (value: boolean, row: IEmpresa) => void;
}

const EmpresaList = ({ openEdit }: Props) => {
  const {
    data,
    error: errorEmpresas,
    isLoading,
    isError: isErrorEmpresas,
  } = useEmpresas();

  const { mutateAsync: mutateDisable } = useDisableEmpresas();

  const { mutateAsync: mutateEnable } = useEnableEmpresas();

  const columns = useMemo<ColumnDef<IEmpresa>[]>(
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
        accessorKey: "usuario",
        id: "usuario",
        header: () => {
          return (
            <div className="p-[5px] text-[12px] select-none">User Root</div>
          );
        },
        cell: ({ getValue }) => {
          return (
            <div className="p-[4px] pb-[4px] text-[12px] ">
              {getValue().nombre_completo as any}
            </div>
          );
        },
        size: 100,
        minSize: 31,
      },
      {
        accessorKey: "ruc",
        id: "ruc",
        header: () => {
          return <div className="p-[5px] text-[12px] select-none">RUC</div>;
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
        accessorKey: "razon_social",
        id: "razon_social",
        header: () => {
          return (
            <div className="p-[5px] text-[12px] select-none">Razon social</div>
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
        accessorKey: "modo",
        id: "modo",
        header: () => {
          return <div className="p-[5px] text-[12px] select-none">Modo</div>;
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
        accessorKey: "ose",
        id: "ose",
        header: () => {
          return <div className="p-[5px] text-[12px] select-none">OSE</div>;
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
        accessorKey: "web_service",
        id: "web_service",
        header: () => {
          return (
            <div className="p-[5px] text-[12px] select-none">Web service</div>
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
        accessorKey: "sunat_usu",
        id: "sunat_usu",
        header: () => {
          return (
            <div className="p-[5px] text-[12px] select-none">SUNAT USU</div>
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
        accessorKey: "sunat_pass",
        id: "sunat_pass",
        header: () => {
          return (
            <div className="p-[5px] text-[12px] select-none">SUNAT PASS</div>
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
        accessorKey: "ose_usu",
        id: "ose_usu",
        header: () => {
          return <div className="p-[5px] text-[12px] select-none">OSE USU</div>;
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
        accessorKey: "ose_pass",
        id: "ose_pass",
        header: () => {
          return (
            <div className="p-[5px] text-[12px] select-none">OSE PASS</div>
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
    </>
  );
};

export default EmpresaList;
