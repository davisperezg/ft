// yup.types.ts
import { AnySchema, InferType, ObjectSchema, Schema } from "yup";

type GetSchemaDefinition<T> = T extends ObjectSchema<infer U> ? U : never;

export type Shape<DType extends object, Strict = true> = {
  [Key in keyof (Strict extends true
    ? DType
    : Partial<DType>)]: DType[Key] extends any[] //Array<any>
    ? Schema<DType[Key]>
    : DType[Key] extends object
      ? Strict extends true
        ? Schema<DType[Key]>
        : Schema<Partial<DType[Key]>>
      : Schema<DType[Key]>;
};

export type Infer<TSchema extends ObjectSchema<any>> = InferType<
  AnySchema<GetSchemaDefinition<TSchema>>
>;
