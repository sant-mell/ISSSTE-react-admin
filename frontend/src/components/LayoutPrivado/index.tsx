import type { ReactNode } from "react";
import { useGetIdentity } from "@refinedev/core";
import { Menu } from "antd";
import { useLocation, useNavigate } from "react-router";
import { PlantillaGob } from "../Plantilla_GobMX";
import { Header } from "../Header";
import { PERSONAL, ROL, type Identidad } from "../../utils/padron";
import "./layoutPrivado.css";

// Opciones del menu y quien puede verlas
const MENU = [
  { key: "/infantes", label: "Niñas y niños", roles: PERSONAL },
  {
    key: "/mediciones/nueva",
    label: "Registrar medición",
    roles: [ROL.admin, ROL.estancia],
  },
  { key: "/usuarios", label: "Usuarios", roles: [ROL.admin] },
  { key: "/ebdi", label: "EBDIs", roles: [ROL.admin, ROL.coordinador] },
];

export const LayoutPrivado = ({ children }: { children: ReactNode }) => {
  const { data: yo } = useGetIdentity<Identidad>();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const items =
    yo?.tipo === "tutor"
      ? [{ key: `/infantes/${yo.id_infante}`, label: "Mi hija o hijo" }]
      : MENU.filter((m) => m.roles.includes(yo?.rol ?? "")).map(
          ({ key, label }) => ({ key, label }),
        );

  const seleccionado = items.find((i) => pathname.startsWith(i.key))?.key;

  return (
    <PlantillaGob acciones={<Header />}>
      <nav className="menu-privado">
        <div className="gob-contenedor">
          <Menu
            mode="horizontal"
            items={items}
            selectedKeys={seleccionado ? [seleccionado] : []}
            onClick={({ key }) => navigate(key)}
          />
        </div>
      </nav>
      <main className="gob-contenedor contenido-privado">{children}</main>
    </PlantillaGob>
  );
};
