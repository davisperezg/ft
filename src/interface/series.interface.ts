import { IOption } from "../components/Select/SelectSimple";

export interface ISeries {
  id?: number;
  empresa: number;
  establecimiento: number;
  establecimientos?: any[];
  documentos?: any[];
  serie: string;
  documento: Pick<IOption, "label" | "value">;
}
