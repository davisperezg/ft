import { useMemo } from "react";
import { useEmpresas } from "../hooks/useEmpresa";
import { IDTOEmpresa } from "../../../interfaces/models/empresa/empresa.interface";
import { DataTable } from "../../../components/common/Table/DataTable";
import { ExtendedColumnDef } from "@tanstack/react-table";

interface Props {
  onRowClick: (row: IDTOEmpresa) => void;
  getItemsRemoves: (items: any[]) => void;
  getItemsRestores: (items: any[]) => void;
}

const EmpresaList = ({
  onRowClick,
  getItemsRemoves,
  getItemsRestores,
}: Props) => {
  const {
    data,
    //error: errorEmpresas,
    isLoading,
    //isError: isErrorEmpresas,
  } = useEmpresas();

  const columns = useMemo<ExtendedColumnDef<IDTOEmpresa>[]>(
    () => [
      {
        accessorKey: "usuario",
        id: "usuario",
        header: () => {
          return <div className="select-none">User Root</div>;
        },
        cell: ({ getValue }) => {
          //const value: IUser = getValue<IEmpresa["usuario"]>();
          const value = getValue() as any;
          return <div className="">{value.nombre_completo}</div>;
        },
        size: 100,
        minSize: 31,
      },
      {
        accessorKey: "ruc",
        id: "ruc",
        header: () => {
          return <div className="select-none">RUC</div>;
        },
        cell: ({ getValue }) => {
          return <div className="">{getValue() as any}</div>;
        },
        size: 100,
        minSize: 31,
      },
      {
        accessorKey: "razon_social",
        id: "razon_social",
        header: () => {
          return <div className="select-none">Razon social</div>;
        },
        cell: ({ getValue }) => {
          return <div className="">{getValue() as any}</div>;
        },
        size: 250,
        minSize: 31,
      },
      {
        accessorKey: "modo",
        id: "modo",
        header: () => {
          return <div className="text-center w-full select-none">Modo</div>;
        },
        cell: ({ getValue }) => {
          return <div className="text-center w-full">{getValue() as any}</div>;
        },
        size: 50,
        minSize: 31,
      },
      {
        accessorKey: "ose",
        id: "ose",
        header: () => {
          return <div className="text-center w-full select-none">OSE</div>;
        },
        cell: ({ getValue }) => {
          return <div className="text-center w-full">{getValue() as any}</div>;
        },
        size: 50,
        minSize: 31,
      },
      {
        accessorKey: "web_service",
        id: "web_service",
        header: () => {
          return <div className="select-none">Web service</div>;
        },
        cell: ({ getValue }) => {
          return <div className="">{getValue() as any}</div>;
        },
        size: 380,
        minSize: 31,
      },
      {
        accessorKey: "sunat_usu",
        id: "sunat_usu",
        header: () => {
          return <div className="select-none">SUNAT USU</div>;
        },
        cell: ({ getValue }) => {
          return <div className="">{getValue() as any}</div>;
        },
        size: 50,
        minSize: 31,
      },
      {
        accessorKey: "sunat_pass",
        id: "sunat_pass",
        header: () => {
          return <div className="select-none">SUNAT PASS</div>;
        },
        cell: ({ getValue }) => {
          return <div className="">{getValue() as any}</div>;
        },
        size: 50,
        minSize: 31,
      },
      {
        accessorKey: "ose_usu",
        id: "ose_usu",
        header: () => {
          return <div className="select-none">OSE USU</div>;
        },
        cell: ({ getValue }) => {
          return <div className="">{getValue() as any}</div>;
        },
        size: 50,
        minSize: 31,
      },
      {
        accessorKey: "ose_pass",
        id: "ose_pass",
        header: () => {
          return <div className="select-none">OSE PASS</div>;
        },
        cell: ({ getValue }) => {
          return <div className="">{getValue() as any}</div>;
        },
        size: 50,
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
      <DataTable<IDTOEmpresa>
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

export default EmpresaList;
