import { BrowserRouter, Outlet, Route, Routes } from "react-router";
import { App as AntdApp, ConfigProvider } from "antd";
import esEs from "antd/locale/es_ES";
import { TeamOutlined } from "@ant-design/icons";
import { Authenticated, Refine } from "@refinedev/core";
import { authProvider } from "./providers/auth";
import { dataProvider } from "./providers/data";
import routerProvider, {
  CatchAllNavigate,
  DocumentTitleHandler,
  NavigateToResource,
} from "@refinedev/react-router";
import {
  ErrorComponent,
  ThemedLayout,
  ThemedSider,
  ThemedTitle,
  useNotificationProvider,
} from "@refinedev/antd";
import { Header } from "./components";
import { Login } from "./pages/login";
import { ListaInfantes } from "./pages/infantes";

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
                meta: {
                  label: "Infantes",
                  icon: <TeamOutlined />,
                },
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
                    <ThemedLayout
                      Header={Header}
                      Sider={(props) => <ThemedSider {...props} fixed />}
                      Title={({ collapsed }) => (
                        <ThemedTitle
                          collapsed={collapsed}
                          text="Padrón Infantil"
                        />
                      )}
                    >
                      <Outlet />
                      {/* Indispensable para renderizar las vistas hijas */}
                    </ThemedLayout>
                  </Authenticated>
                }
              >
                <Route
                  index
                  element={<NavigateToResource resource="infantes" />}
                />
                <Route path="/infantes" element={<ListaInfantes />} />
                <Route path="*" element={<ErrorComponent />} />
              </Route>

              {/* Rutas publicas */}
              <Route
                element={
                  <Authenticated
                    key="publico"
                    fallback={<Outlet />}
                    loading={<Outlet />}
                  >
                    <NavigateToResource />
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
