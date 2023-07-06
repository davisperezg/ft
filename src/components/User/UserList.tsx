import { useEffect, useMemo, useCallback } from "react";
import ComponentTable from "../Table/Index";
import { ColumnDef } from "@tanstack/react-table";
import { useDeleteUser, useRestoreUser, useUsers } from "../../hooks/useUsers";
import { IUser } from "../../interface/user.interface";
import LoadingTotal from "../Loading/LoadingTotal";
import { CgClose, CgSync } from "react-icons/cg";
import { toast } from "react-toastify";
import { isError } from "../../utils/functions";

interface Props {
  openEdit: (value: boolean, row: IUser) => void;
}

const UserList = ({ openEdit }: Props) => {
  const {
    data,
    error: errorUsers,
    isLoading,
    isError: isErrorUsers,
  } = useUsers();

  const { mutateAsync: mutateDelete } = useDeleteUser();

  const { mutateAsync: mutateRestore } = useRestoreUser();

  const getItemsRemoves = useCallback(
    async (item: any) => {
      const eliminar = confirm(
        `Esta seguro que desea eliminar ${item.username} items ?`
      );

      try {
        if (eliminar) {
          await mutateDelete({ id: item._id });
        }
      } catch (e) {
        if (isError(e)) {
          toast.error(e.response.data.message);
        }
      }
    },
    [mutateDelete]
  );

  const getItemsRestores = useCallback(
    async (item: any) => {
      const restaurar = confirm(
        `Esta seguro que desea restaurar ${item.username} items ?`
      );

      try {
        if (restaurar) {
          await mutateRestore({ id: item._id });
        }
      } catch (e) {
        if (isError(e)) {
          toast.error(e.response.data.message);
        }
      }
    },
    [mutateRestore]
  );

  const columns = useMemo<ColumnDef<IUser>[]>(
    () => [
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
        accessorKey: "fullname",
        id: "fullname",
        header: () => {
          return <div className="p-[5px] text-[12px] select-none">Cliente</div>;
        },
        cell: ({ getValue }) => {
          const cliente = getValue() as any;
          return <div className="p-[4px] pb-[4px] text-[12px] ">{cliente}</div>;
        },
        size: 100,
        minSize: 31,
      },
      {
        accessorKey: "email",
        id: "email",
        header: () => {
          return <div className="p-[5px] text-[12px] select-none">Email</div>;
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
        accessorKey: "nroDocument",
        id: "nroDocument",
        header: () => {
          return <div className="p-[5px] text-[12px] select-none">Doc/Nro</div>;
        },
        cell: (props) => {
          return (
            <div className="p-[4px] pb-[4px] text-[12px] ">
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
          return <div className="p-[5px] text-[12px] select-none">Rol</div>;
        },
        cell: (props) => {
          return (
            <div className="p-[4px] pb-[4px] text-[12px] ">
              {(props.getValue() as any).name}
            </div>
          );
        },
        size: 100,
        minSize: 31,
      },
      {
        accessorKey: "username",
        id: "username",
        header: () => {
          return <div className="p-[5px] text-[12px] select-none">Usuario</div>;
        },
        cell: ({ getValue }: any) => {
          return (
            <div className="p-[4px] pb-[4px] text-[12px] ">{getValue()}</div>
          );
        },
        size: 100,
        minSize: 31,
      },
      {
        accessorKey: "owner",
        id: "owner",
        header: () => {
          return (
            <div className="p-[5px] text-[12px] select-none">Creado por</div>
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
        accessorKey: "fecha_creada",
        id: "fecha_creada",
        header: () => {
          return (
            <div className="p-[5px] text-[12px] select-none">Fecha creada</div>
          );
        },
        cell: (props) => {
          return (
            <div className="p-[4px] pb-[4px] text-[12px] ">
              {"" + props.getValue()}
            </div>
          );
        },
        size: 100,
        minSize: 31,
      },
      {
        accessorKey: "fecha_editada",
        id: "fecha_editada",
        header: () => {
          return (
            <div className="p-[5px] text-[12px] select-none">Fecha editada</div>
          );
        },
        cell: (props) => {
          return (
            <div className="p-[4px] pb-[4px] text-[12px] ">
              {"" + props.getValue()}
            </div>
          );
        },
        size: 100,
        minSize: 31,
      },
      {
        accessorKey: "fecha_restaurada",
        id: "fecha_restaurada",
        header: () => {
          return (
            <div className="p-[5px] text-[12px] select-none">
              Fecha restaurada
            </div>
          );
        },
        cell: (props) => {
          return (
            <div className="p-[4px] pb-[4px] text-[12px] ">
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
          return (
            <div className="p-[5px] text-[12px] select-none">
              Fecha eliminada
            </div>
          );
        },
        cell: (props) => {
          return (
            <div className="p-[4px] pb-[4px] text-[12px] ">
              {props.getValue() ? "" + props.getValue() : ""}
            </div>
          );
        },
        size: 100,
        minSize: 31,
      },
      {
        accessorKey: "select",
        id: "select",
        header: () => {
          return (
            <div className="text-center p-[5px] text-[12px] select-none">
              Eliminar/Restaurar
            </div>
          );
        },
        cell: (props) => {
          return (
            <div className="text-center p-[4px] pb-[4px] text-[12px] ">
              {props.row.original.status ? (
                <CgClose
                  onClick={() => getItemsRemoves(props.row.original)}
                  className="text-[15px] inline cursor-pointer"
                  color="red"
                />
              ) : (
                <CgSync
                  onClick={() => getItemsRestores(props.row.original)}
                  className="text-textDefault text-[18px] inline cursor-pointer"
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
    [getItemsRemoves, getItemsRestores]
  );

  const loadData = useMemo(() => {
    if (data) {
      return data;
    }

    return [];
  }, [data]);

  useEffect(() => {
    if (isErrorUsers) {
      toast.error(errorUsers.response.data.message);
    }
  }, [errorUsers, isErrorUsers]);

  return (
    <>
      {/* <div className="bg-none border overflow-hidden whitespace-nowrap relative text-black">
        <div className="float-left m-[3px_3px_3px_0px] w-full">
          <div className="float-left">
            <label>FOE</label>
          </div>
        </div>
      </div> */}
      {isLoading ? (
        <LoadingTotal />
      ) : (
        <ComponentTable data={loadData} columns={columns} openEdit={openEdit} />
      )}
    </>
  );
};

export default UserList;
