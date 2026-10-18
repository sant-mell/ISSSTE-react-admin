import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router";
import { App as AntdApp, ConfigProvider } from "antd";
import esEs from "antd/locale/es_ES";
import "@ant-design/v5-patch-for-react-19";
import dayjs from "dayjs";
import "dayjs/locale/es";
import { Authenticated, Refine } from "@refinedev/core";
import { ErrorComponent, useNotificationProvider } from "@refinedev/antd";
import routerProvider, {
  CatchAllNavigate,
  DocumentTitleHandler,
} from "@refinedev/react-router";
import { authProvider } from "./providers/auth";
import { dataProvider } from "./providers/data";
import { LayoutPrivado, SoloRoles } from "./components";
import { PERSONAL, ROL } from "./utils/padron";

import { Login } from "./pages/login";
import { Inicio } from "./pages/inicio/index.tsx";
import { ListaInfantes, FichaInfante, EditarInfante } from "./pages/infantes";
import { RegistrarMedicion } from "./pages/mediciones";
import { EditarUsuario, ListaUsuarios, NuevoUsuario } from "./pages/usuarios";
import { EditarEbdi, ListaEbdi } from "./pages/ebdi";

dayjs.locale("es");

// Configuración de colores, tipografia
const tema = {
  token: {
    colorPrimary: "#9b2247",
    colorLink: "#9b2247",
    fontFamily: "'Noto Sans', system-ui, sans-serif",
    borderRadius: 4,
  },
};

//Diccionario de traducciones para la interfaz
const traducciones: Record<string, string> = {
  "buttons.logout": "Cerrar sesión",
  "buttons.save": "Guardar",
  "buttons.cancel": "Cancelar",
  "buttons.create": "Nuevo",
  "buttons.edit": "Editar",
  "buttons.list": "Volver a la lista",
  "buttons.refresh": "Actualizar",
  "notifications.error": "Error",
};

const i18nProvider = {
  translate: (clave: string, _opciones?: unknown, porDefecto?: string) =>
    traducciones[clave] ?? porDefecto ?? clave,
  changeLocale: async () => {},
  getLocale: () => "es",
};

// App
export default function App() {
  return (
    <BrowserRouter>
      {/* Configuración de idioma y tema para Ant Design */}
      <ConfigProvider theme={tema} locale={esEs}>
        <AntdApp>
          {/* Inicialización y configuración central del framework Refine */}
          <Refine
            authProvider={authProvider}
            dataProvider={dataProvider}
            routerProvider={routerProvider}
            notificationProvider={useNotificationProvider}
            i18nProvider={i18nProvider}
            // Definición de recursos (entidades) y sus rutas asociadas
            resources={[
              {
                name: "infantes",
                list: "/infantes",
                show: "/infantes/:id",
                edit: "/infantes/:id/editar",
                meta: { label: "Niñas y niños" },
              },
              {
                name: "mediciones",
                create: "/mediciones/nueva",
                meta: { label: "Mediciones" },
              },
              {
                name: "usuarios",
                list: "/usuarios",
                create: "/usuarios/nuevo",
                edit: "/usuarios/:id/editar",
                meta: { label: "Usuarios" },
              },
              {
                name: "ebdi",
                list: "/ebdi",
                edit: "/ebdi/:id/editar",
                meta: { label: "EBDI" },
              },
            ]}
            options={{ syncWithLocation: true, disableTelemetry: true }}
          >
            <Routes>
              {/* RUTAS PRIVADAS (AUTENTICADAS) */}
              <Route
                element={
                  <Authenticated
                    key="privado"
                    fallback={<CatchAllNavigate to="/login" />}
                  >
                    <LayoutPrivado>
                      <Outlet />
                    </LayoutPrivado>
                  </Authenticated>
                }
              >
                {/* Dashboard */}
                <Route index element={<Inicio />} />

                {/* Módulo: Infantes */}
                <Route path="/infantes">
                  <Route
                    index
                    element={
                      <SoloRoles roles={PERSONAL}>
                        <ListaInfantes />
                      </SoloRoles>
                    }
                  />
                  <Route path=":id" element={<FichaInfante />} />
                  <Route
                    path=":id/editar"
                    element={
                      <SoloRoles roles={[ROL.admin]}>
                        <EditarInfante />
                      </SoloRoles>
                    }
                  />
                </Route>

                {/* Módulo: Mediciones */}
                <Route
                  path="/mediciones/nueva"
                  element={
                    <SoloRoles roles={[ROL.admin, ROL.estancia]}>
                      <RegistrarMedicion />
                    </SoloRoles>
                  }
                />

                {/* Módulo: Gestión de Usuarios */}
                <Route
                  path="/usuarios"
                  element={
                    <SoloRoles roles={[ROL.admin]}>
                      <Outlet />
                    </SoloRoles>
                  }
                >
                  <Route index element={<ListaUsuarios />} />
                  <Route path="nuevo" element={<NuevoUsuario />} />
                  <Route path=":id/editar" element={<EditarUsuario />} />
                </Route>

                {/* Módulo: EBDI */}
                <Route path="/ebdi">
                  <Route
                    index
                    element={
                      <SoloRoles roles={PERSONAL}>
                        <ListaEbdi />
                      </SoloRoles>
                    }
                  />
                  <Route
                    path=":id/editar"
                    element={
                      <SoloRoles roles={[ROL.admin]}>
                        <EditarEbdi />
                      </SoloRoles>
                    }
                  />
                </Route>

                {/* Ruta de captura para páginas no encontradas (404) */}
                <Route path="*" element={<ErrorComponent />} />
              </Route>

              {/* RUTAS PÚBLICAS */}
              <Route
                element={
                  <Authenticated
                    key="publico"
                    fallback={<Outlet />}
                    loading={<Outlet />}
                  >
                    {/* Si el usuario ya está autenticado e intenta ir a login, se redirige al inicio */}
                    <Navigate to="/" replace />
                  </Authenticated>
                }
              >
                <Route path="/login" element={<Login />} />
              </Route>
            </Routes>
            <DocumentTitleHandler handler={() => "Padrón Infantil | ISSSTE"} />
          </Refine>
        </AntdApp>
      </ConfigProvider>
    </BrowserRouter>
  );
}
