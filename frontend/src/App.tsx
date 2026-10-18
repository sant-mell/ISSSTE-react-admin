import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router";
import { App as AntdApp, ConfigProvider } from "antd";
import esEs from "antd/locale/es_ES";
import "dayjs/locale/es";
import dayjs from "dayjs";
import { Authenticated, Refine } from "@refinedev/core";
import { useNotificationProvider } from "@refinedev/antd";
import routerProvider, {
  CatchAllNavigate,
  DocumentTitleHandler,
} from "@refinedev/react-router";
import { authProvider } from "./providers/auth";
import { dataProvider } from "./providers/data";
import { LayoutPrivado, SoloRoles } from "./components";
import { Login } from "./pages/login";
import "@ant-design/v5-patch-for-react-19";
import { Inicio } from "./pages/inicio/index.tsx";
import { PERSONAL } from "./utils/padron";
import { ListaInfantes, FichaInfante } from "./pages/infantes";
//import { EditarInfante, FichaInfante, ListaInfantes } from "./pages/infantes";
//import { RegistrarMedicion } from "./pages/mediciones";
//import { EditarUsuario, ListaUsuarios, NuevoUsuario } from "./pages/usuarios";
//import { EditarEbdi, ListaEbdi } from "./pages/ebdi";
//import { PERSONAL, ROL } from "./utils/padron";

dayjs.locale("es");

// Colores y tipografia para todos los componentes de Ant Design
const tema = {
  token: {
    colorPrimary: "#9b2247",
    colorLink: "#9b2247",
    fontFamily: "'Noto Sans', system-ui, sans-serif",
    borderRadius: 4,
  },
};

const traducciones: Record<string, string> = {
  "buttons.logout": "Cerrar sesión",
};

const i18nProvider = {
  translate: (clave: string, _opciones?: unknown, porDefecto?: string) =>
    traducciones[clave] ?? porDefecto ?? clave,
  changeLocale: async () => {},
  getLocale: () => "es",
};

export default function App() {
  return (
    <BrowserRouter>
      <ConfigProvider theme={tema} locale={esEs}>
        <AntdApp>
          <Refine
            authProvider={authProvider}
            dataProvider={dataProvider}
            routerProvider={routerProvider}
            notificationProvider={useNotificationProvider}
            i18nProvider={i18nProvider}
            resources={[
              {
                name: "infantes",
                list: "/infantes",
              },
            ]}
            options={{ syncWithLocation: true, disableTelemetry: true }}
          >
            <Routes>
              {/* RUTAS PRIVADAS */}
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
                <Route index element={<Inicio />} />
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
                </Route>
              </Route>

              {/* Rutas publicas */}
              <Route
                element={
                  <Authenticated
                    key="publico"
                    fallback={<Outlet />}
                    loading={<Outlet />}
                  >
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
