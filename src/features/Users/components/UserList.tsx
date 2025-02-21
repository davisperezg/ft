import { useEffect, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useUsers } from "../hooks/useUsers";
import { CgClose, CgSync } from "react-icons/cg";
import { toast } from "sonner";
import { IUser } from "../../../interfaces/models/user/user.interface";
import { DataTable } from "../../../components/common/Table/DataTable";

interface Props {
  onRowClick: (row: IUser) => void;
  getItemsRemoves: (items: any) => void;
  getItemsRestores: (items: any) => void;
}

const UserList = ({ onRowClick, getItemsRemoves, getItemsRestores }: Props) => {
  const {
    data,
    error: errorUsers,
    isLoading,
    isError: isErrorUsers,
  } = useUsers();

  const columns = useMemo<ColumnDef<IUser>[]>(
    () => [
      {
        accessorKey: "fullname",
        id: "fullname",
        header: () => {
          return <div className="select-none">Cliente</div>;
        },
        cell: ({ getValue }) => {
          const cliente = getValue() as any;
          return <div className="w-full">{cliente}</div>;
        },
        size: 100,
        minSize: 31,
      },
      {
        accessorKey: "email",
        id: "email",
        header: () => {
          return <div className="select-none">Email</div>;
        },
        cell: ({ getValue }) => {
          return <div className="w-full">{getValue() as any}</div>;
        },
        size: 100,
        minSize: 31,
      },
      {
        accessorKey: "nroDocument",
        id: "nroDocument",
        header: () => {
          return <div className="select-none">Doc/Nro</div>;
        },
        cell: (props) => {
          return (
            <div className="w-full">
              {props.row.original.tipDocument + " / " + props.getValue()}
            </div>
          );
        },
        size: 100,
        minSize: 31,
      },
      {
        accessorKey: "role",
        id: "role",
        header: () => {
          return <div className="select-none">Rol</div>;
        },
        cell: (props) => {
          return <div className="w-full">{(props.getValue() as any).name}</div>;
        },
        size: 100,
        minSize: 31,
      },
      {
        accessorKey: "username",
        id: "username",
        header: () => {
          return <div className="select-none">Usuario</div>;
        },
        cell: ({ getValue }: any) => {
          return <div className="w-full">{getValue()}</div>;
        },
        size: 100,
        minSize: 31,
      },
      {
        accessorKey: "owner",
        id: "owner",
        header: () => {
          return <div className="select-none">Creado por</div>;
        },
        cell: ({ getValue }) => {
          return <div className="w-full">{getValue() as any}</div>;
        },
        size: 100,
        minSize: 31,
      },
      {
        accessorKey: "fecha_creada",
        id: "fecha_creada",
        header: () => {
          return <div className="select-none">Fecha creada</div>;
        },
        cell: (props) => {
          return <div className="w-full">{"" + props.getValue()}</div>;
        },
        size: 100,
        minSize: 31,
      },
      {
        accessorKey: "fecha_editada",
        id: "fecha_editada",
        header: () => {
          return <div className="select-none">Fecha editada</div>;
        },
        cell: (props) => {
          return <div className="w-full">{"" + props.getValue()}</div>;
        },
        size: 100,
        minSize: 31,
      },
      {
        accessorKey: "fecha_restaurada",
        id: "fecha_restaurada",
        header: () => {
          return <div className="select-none">Fecha restaurada</div>;
        },
        cell: (props) => {
          return (
            <div className="w-full">
              {props.getValue() ? "" + props.getValue() : ""}
            </div>
          );
        },
        size: 100,
        minSize: 31,
      },
      {
        accessorKey: "fecha_eliminada",
        id: "fecha_eliminada",
        header: () => {
          return <div className="select-none">Fecha eliminada</div>;
        },
        cell: (props) => {
          return (
            <div className="w-full">
              {props.getValue() ? "" + props.getValue() : ""}
            </div>
          );
        },
        size: 100,
        minSize: 31,
      },
      {
        accessorKey: "select2",
        id: "select2",
        header: () => {
          return (
            <div className="text-center w-full  select-none">
              Desactivar/Activar
            </div>
          );
        },
        cell: (props) => {
          return (
            <div className="text-center w-full">
              {props.row.original.status ? (
                <CgClose
                  onClick={() => getItemsRemoves(props.row.original)}
                  className="text-[15px] inline cursor-pointer"
                  color="red"
                />
              ) : (
                <CgSync
                  onClick={() => getItemsRestores(props.row.original)}
                  className="text-default text-[18px] inline cursor-pointer"
                  color=""
                />
              )}
            </div>
          );
        },
        size: 130,
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
    [getItemsRemoves, getItemsRestores]
  );

  useEffect(() => {
    if (isErrorUsers) {
      toast.error(errorUsers.response.data.message);
    }
  }, [errorUsers, isErrorUsers]);

  return (
    <>
      <DataTable<IUser>
        isLoading={isLoading}
        data={data || []}
        columns={columns}
        onRowClick={onRowClick}
      />
    </>
  );
};

export default UserList;
