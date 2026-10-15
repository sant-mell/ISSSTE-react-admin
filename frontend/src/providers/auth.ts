import type { AuthProvider } from "@refinedev/core";
import { API_URL } from "./constants";

const llamar = (ruta: string, cuerpo?: object) => {
  const opciones: RequestInit = {
    method: cuerpo ? "POST" : "GET",
    headers: { "Content-Type" : "application/json"},
    credentials: "include"
  };

  if (cuerpo) opciones.body = JSON.stringify(cuerpo);

  return fetch(`${API_URL}${ruta}`, opciones);
}

export const authProvider: AuthProvider = {
  login: async ({tipo, ...datos }) => {
    const ruta = tipo === "tutor" ? "/auth/login-tutor" : "/auth/login";
    const respuesta = await llamar(ruta, datos);

    if (respuesta.ok) {
      return {success: true, redirectTo: "/"};
    }

    const {mensaje} = await respuesta.json().catch(() => ({}));
    return {
      success: false,
      error: {
        name: "No fue posible iniciar sesión",
        message: mensaje ?? "Intenta de nuevo",
      },
    };
  },

  logout: async () => {
    await llamar("/auth/logout", {});
    return { success: true, redirectTo: "/login"};
  },

  check: async () => {
    const respuesta = await llamar("/auth/me");
    return respuesta.ok ? { authenticated: true} : { authenticated: false, redirectTo: "/login"};
  },

  getIdentity: async () => {
    const respuesta = await llamar("/auth/me");
    return respuesta.ok ? await respuesta.json() : null;
  },

  getPermissions: async () => {
    const respuesta = await llamar("/auth/me");
    return respuesta.ok ? (await respuesta.json()).rol : null;
  },

  onError: async (error) => {
    if (error?.statusCode === 401) {
      return { logout: true, redirectTo: "/login", error};
    }
    return {};
  },
};
