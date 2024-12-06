import { faker } from "@faker-js/faker";

export const makeColumns = (num: any) =>
  [...Array(num)].map((_, i) => {
    if (i === 0) {
      return {
        id: i.toString(),
        accessorKey: i.toString(),
        header: "Column " + i.toString(),
        size: Math.floor(Math.random() * 150) + 100,
        sortDescFirst: true,
      };
    }
    return {
      id: i.toString(),
      accessorKey: i.toString(),
      header: "Column " + i.toString(),
      size: Math.floor(Math.random() * 150) + 100,
    };
  });

export const makeData = (num: any, columns: any) =>
  [...Array(num)].map(() => ({
    ...Object.fromEntries(
      columns.map((col: any) => [col.accessorKey, faker.person.firstName()])
    ),
  }));

export type Person = ReturnType<typeof makeData>[0];
