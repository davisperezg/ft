import {
  IValidationProductCreate,
  IValidationProductUpdate,
} from "../../validations/product/product.interface";

// export interface IFeatureProductCreate extends IValidationProductCreate {}

// export interface IFeatureProductUpdate extends IValidationProductUpdate {}

export type IFeatureProductCreate = IValidationProductCreate;
export type IFeatureProductUpdate = IValidationProductUpdate;
