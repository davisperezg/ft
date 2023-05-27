import axios from "axios";
import { ResourcesInput } from "../interface/resources-input.interface";
import { BASE_API } from "../utils/const";

export const getResourcesXRol = async (id: string) => {
  const { data } = await axios.get<any[]>(
    `${BASE_API}/api/v1/resources-roles/role/${id}`
  );
  return data;
};

export const getResourcesXUser = async (id: string) => {
  const { data } = await axios.get<any[]>(
    `${BASE_API}/api/v1/resources-users/user/${id}`
  );
  return data;
};

export const postResoucesXUser = async (body: ResourcesInput) => {
  const { data } = await axios.post(`${BASE_API}/api/v1/resources-users`, body);

  return data;
};

export const postResoucesXRol = async (body: ResourcesInput) => {
  const { data } = await axios.post(`${BASE_API}/api/v1/resources-roles`, body);

  return data;
};
