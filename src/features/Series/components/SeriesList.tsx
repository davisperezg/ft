import { useSeries } from "../hooks/useSeries";
import { useMemo } from "react";
import { ISeries } from "../../../interfaces/models/series/series.interface";
import { DataTable } from "../../../components/common/Table/DataTable";
import { ExtendedColumnDef } from "@tanstack/react-table";

interface Props {
  onRowClick: (row: ISeries) => void;
  getItemsRemoves?: (items: any[]) => void;
  getItemsRestores?: (items: any[]) => void;
}

const SeriesList = ({ onRowClick }: Props) => {
  const {
    data,
    //error: errorSeries,
    isLoading,
    //isError: isErrorSeries,
  } = useSeries();

  const columns = useMemo<ExtendedColumnDef<ISeries>[]>(
    () => [
      {
        accessorKey: "empresa",
        id: "empresa",
        header: () => {
          return <div className="select-none">Empresa</div>;
        },
        cell: ({ getValue }) => {
          return (
            <div className="">
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
            <div className="w-full text-center select-none">
              Docs. Asignados
            </div>
          );
        },
        cell: ({ getValue }) => {
          return <div className="w-full  text-center">{getValue() as any}</div>;
        },
        size: 100,
        minSize: 31,
      },
      {
        accessorKey: "documentos",
        id: "documentos",
        header: () => {
          return (
            <div className="w-full text-center select-none">Documentos</div>
          );
        },
        cell: ({ getValue }) => {
          return (
            <div className="flex flex-wrap gap-1">
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
            <div className="w-full text-center select-none">
              Cant. Establecimientos
            </div>
          );
        },
        cell: ({ getValue }) => {
          return <div className="w-full text-center">{getValue() as any}</div>;
        },
        size: 140,
        minSize: 31,
      },
      {
        accessorKey: "establecimientos",
        id: "establecimientos",
        header: () => {
          return <div className="p-[5px]  select-none">Establecimientos</div>;
        },
        cell: ({ getValue }) => {
          return (
            <div className="p-[4px] pb-[4px]  ">
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
                    {item.pos.map((pos: any, b: number) => {
                      return (
                        <div key={b} className="ml-[10px]">
                          <strong>
                            {a + 1}.{b + 1}.- {pos.nombre}
                          </strong>
                          {pos.documentos.map((doc: any, c: number) => {
                            return (
                              <div key={c} className="ml-[10px]">
                                {a + 1}.{b + 1}.{c + 1}.- {doc.nombre}
                                {doc.series.map((serie: any, d: number) => {
                                  return (
                                    <div key={d} className="ml-[10px]">
                                      {a + 1}.{b + 1}.{c + 1}.{d + 1}.-
                                      {serie.serie}
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
              })}
            </div>
          );
        },
        size: 250,
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
      <DataTable<ISeries>
        isLoading={isLoading}
        data={data || []}
        columns={columns}
        onRowClick={onRowClick}
      />
    </>
  );
};

export default SeriesList;
