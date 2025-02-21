export interface ICPEType {
  id?: number;
  codigo: string;
  tipo_documento: string;
  abreviado: string;
  estado?: boolean;
}

export interface IDTOCPEType extends Pick<ICPEType, "estado"> {
  id: number;
  nombre: string;
}
