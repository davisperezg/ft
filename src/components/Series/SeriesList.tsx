import { ColumnDef } from "@tanstack/react-table";
import { useSeries } from "../../hooks/useSeries";
import { ISeries } from "../../interface/series.interface";
import ComponentTable from "../Table/Index";
import { useMemo } from "react";

interface Props {
  openEdit: (value: boolean, row: ISeries) => void;
}

const SeriesList = ({ openEdit }: Props) => {
  const {
    data,
    //error: errorSeries,
    isLoading,
    //isError: isErrorSeries,
  } = useSeries();

  const columns = useMemo<ColumnDef<ISeries>[]>(
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
        accessorKey: "empresa",
        id: "empresa",
        header: () => {
          return <div className="p-[5px] text-[12px] select-none">Empresa</div>;
        },
        cell: ({ getValue }) => {
          return (
            <div className="p-[4px] pb-[4px] text-[12px] ">
              {/* {getValue().nombre_completo as any} */}
              {getValue() as any}
            </div>
          );
        },
        size: 200,
        minSize: 31,
      },
      {
        accessorKey: "documentosAsignados",
        id: "documentosAsignados",
        header: () => {
          return (
            <div className="p-[5px] text-[12px] select-none">
              Docs. Asignados
            </div>
          );
        },
        cell: ({ getValue }) => {
          return (
            <div className="p-[4px] pb-[4px] text-[12px] text-center">
              {getValue() as any}
            </div>
          );
        },
        size: 100,
        minSize: 31,
      },
      {
        accessorKey: "documentos",
        id: "documentos",
        header: () => {
          return (
            <div className="p-[5px] text-[12px] select-none">Documentos</div>
          );
        },
        cell: ({ getValue }) => {
          return (
            <div className="p-[4px] pb-[4px] text-[12px] flex flex-wrap gap-1">
              {(getValue() as any).map((item: any, i: number) => {
                return (
                  <div key={i} className="border pr-1 pl-1">
                    {item}
                  </div>
                );
              })}
            </div>
          );
        },
        size: 250,
        minSize: 31,
      },
      {
        accessorKey: "cantidadEstablecimientos",
        id: "cantidadEstablecimientos",
        header: () => {
          return (
            <div className="p-[5px] text-[12px] select-none">
              Cant. Establecimientos
            </div>
          );
        },
        cell: ({ getValue }) => {
          return (
            <div className="p-[4px] pb-[4px] text-[12px] text-center">
              {getValue() as any}
            </div>
          );
        },
        size: 140,
        minSize: 31,
      },
      {
        accessorKey: "establecimientos",
        id: "establecimientos",
        header: () => {
          return (
            <div className="p-[5px] text-[12px] select-none">
              Establecimientos
            </div>
          );
        },
        cell: ({ getValue }) => {
          return (
            <div className="p-[4px] pb-[4px] text-[12px] ">
              {(getValue() as any).map((item: any, a: number) => {
                return (
                  <div key={a} className="pr-1 pl-1 h-[auto] flex flex-col">
                    <div className="flex">
                      <strong>{a + 1}.- Establecimiento:</strong>
                      {item.codigo === "0000" ? "PRINCIPAL" : item.codigo}
                    </div>
                    <div className="flex">
                      <small>
                        <strong>Nombre:</strong> {item.denominacion}
                      </small>
                    </div>
                    {item.documentos.map((doc: any, b: number) => {
                      return (
                        <div key={b} className="ml-[10px]">
                          {a + 1}.{b + 1}.- {doc.nombre}
                          {doc.series.map((ser: any, c: number) => {
                            return (
                              <div key={c} className="ml-[10px]">
                                {a + 1}.{b + 1}.{c + 1}.- {ser.serie}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          );
        },
        size: 250,
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

  return (
    <>
      <ComponentTable
        loading={isLoading}
        data={loadData}
        columns={columns}
        //getItemsRemoves={getItemsRemoves}
        //getItemsRestores={getItemsRestores}
        openEdit={openEdit}
      />
    </>
  );
};

export default SeriesList;
