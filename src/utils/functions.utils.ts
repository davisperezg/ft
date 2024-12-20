import { IError } from "../interfaces/common/error.interface";

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

export const round = (num: number, decimales = 2) => {
  const signo = num >= 0 ? 1 : -1;
  num = num * signo;
  if (decimales === 0) return signo * Math.round(num);
  const numAux = num.toString().split("e");
  num = Math.round(
    +(numAux[0] + "e" + (numAux[1] ? +numAux[1] + decimales : decimales))
  );
  const num2Aux = num.toString().split("e");
  return (
    signo *
    Number(
      num2Aux[0] + "e" + (num2Aux[1] ? +num2Aux[1] - decimales : -decimales)
    )
  );
};

export const fixed = (num: number, decimales = 2) => {
  return num.toFixed(decimales);
};

export const quitarTildes = (cadena: string) => {
  return cadena.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

export const quitarEspacios = (cadena: string) => {
  return cadena.trim().replace(/\s/g, "");
};

export const convertirTitulo = (texto: string) =>
  texto
    .toLowerCase() // Convierte todo el texto a minúsculas
    .split(" ") // Divide la cadena en palabras
    .map((palabra) => palabra.charAt(0).toUpperCase() + palabra.slice(1)) // Convierte la primera letra de cada palabra en mayúscula
    .join(" "); // Une las palabras de nuevo en una cadena;
