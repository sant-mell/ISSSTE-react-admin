import { useGetIdentity } from "@refinedev/core";
import { Identidad } from "../../utils/padron";
import { Spin } from "antd";
import { Navigate } from "react-router";

export const Inicio = () => {
  const { data: yo } = useGetIdentity<Identidad>();
  if (!yo) return <Spin />;
  return (
    <Navigate
      to={yo.tipo === "tutor" ? `/infantes/${yo.id_infante}` : "/infantes"}
      replace
    />
  );
};
