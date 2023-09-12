import { TipDocs } from "./tipo_docs.interface";

export interface ISeries {
  id?: number;
  documento: TipDocs;
  series: string[];
}
