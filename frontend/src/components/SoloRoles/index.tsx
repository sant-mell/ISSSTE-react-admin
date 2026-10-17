import type { ReactNode } from "react";
import { usePermissions } from "@refinedev/core";
import { Result, Spin } from "antd";
import { Link } from "react-router";

export const SoloRoles = ({
  roles,
  children,
}: {
  roles: string[];
  children: ReactNode;
}) => {
  const { data: rol, isLoading } = usePermissions<string>({});

  if (isLoading) return <Spin />;
  if (!roles.includes(rol ?? "")) {
    return (
      <Result
        status="403"
        title="Sin acceso"
        subTitle="Tu perfile no tiene permiso para ver esta página"
        extra={<Link to="/">Ir al inicio</Link>}
      />
    );
  }
  return <>{children}</>
};
