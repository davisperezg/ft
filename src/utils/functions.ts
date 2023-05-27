import { IError } from "../interface/error.interface";

export function isError(obj: any): obj is IError {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "response" in obj &&
    typeof obj.response === "object" &&
    obj.response !== null &&
    "data" in obj.response
  );
}
