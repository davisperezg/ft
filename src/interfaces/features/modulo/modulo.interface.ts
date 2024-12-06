import { IFeatureMenu } from "../recurso/menu.interface";

export interface IFeatureModule extends IFeatureMenu {
  menus?: IFeatureMenu[];
}
