import axios from "axios";
import { BASE_API } from "../config/constants";
import { storage } from "../utils/storage.utils";
import { getRefresh } from "../features/Authentication/services/auth.service";

export function jwtInterceptor() {
  axios.interceptors.request.use((request) => {
    // add auth header with jwt if account is logged in and request is to the api url
    const base_API = String(BASE_API);

    const isLoggedIn = storage.getItem("access_token", "SESSION");
    const isApiUrl = request.url?.startsWith(base_API);

    if (isLoggedIn && isApiUrl) {
      request.headers["Authorization"] = `Bearer ${isLoggedIn}`;
    }

    return request;
  });

  axios.interceptors.response.use(
    (response) => {
      return response;
    },
    async function (error) {
      if (error.code === "ERR_NETWORK" || error.code === "ECONNREFUSED") {
        storage.setItem("c_server", "close.app", "LOCAL");
        storage.clear("SESSION");
        location.reload();
      }

      const originalRequest = error.config;

      if (
        error.response.status === 401 &&
        originalRequest.url === `${BASE_API}/api/v1/auth/token`
      ) {
        storage.setItem("c_server", "close.app", "LOCAL");
        storage.clear("SESSION");
        location.reload();
        return Promise.reject(error);
      }

      if (error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const user = JSON.parse(String(storage.getItem("user", "SESSION")));

          const refreshToken = storage.getItem("refresh_token", "SESSION");
          const resToken: any = await getRefresh(
            String(user.usuario),
            String(refreshToken)
          );
          if (resToken.status === 201) {
            storage.setItem(
              "access_token",
              resToken.data.access_token,
              "SESSION"
            );
            const token = storage.getItem("access_token", "SESSION");
            axios.defaults.headers.common["Authorization"] = "Bearer " + token;
            return axios(originalRequest);
          }
        } catch (_) {
          //window.location.href = "/";
          storage.clear("SESSION");
          location.reload();
        }
      }
      return Promise.reject(error);
    }
  );
}
