import { createSimpleRestDataProvider } from "@refinedev/rest/simple-rest";
import { API_URL } from "./constants";

export const { dataProvider, kyInstance } = createSimpleRestDataProvider({
  apiURL: API_URL,
  kyOptions: {
    credentials: "include",
    retry: 0,
    hooks: {
      afterResponse: [
        async (_request, _options, response) => {
          if (!response.ok) {
            const cuerpo = await response
              .clone()
              .json()
              .catch(() => ({}));
            throw {
              message: cuerpo.mensaje ?? "Error al comunicarse con el servidor",
              statusCode: response.status,
            };
          }
        },
      ],
    },
  },
});
