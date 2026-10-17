import { useGetIdentity, useLogout } from "@refinedev/core";
import { Button, Space, Typography } from "antd";
import { LogoutOutlined } from "@ant-design/icons";
import type { Identidad } from "../../utils/padron";

export const Header = () => {
  const { data: usuario } = useGetIdentity<Identidad>();
  const { mutate: cerrarSesion } = useLogout();

  return (
    <Space size="middle">
      <div style={{ textAlign: "right", lineHeight: 1.3 }}>
        <Typography.Text strong>{usuario?.nombre}</Typography.Text>
        <br />
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          {usuario?.rol}
        </Typography.Text>
      </div>
      <Button icon={<LogoutOutlined />} onClick={() => cerrarSesion()}>
        Cerrar sesión
      </Button>
    </Space>
  );
};
