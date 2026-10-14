import { useGetIdentity, useLogout } from "@refinedev/core";
import type { RefineThemedLayoutHeaderProps } from "@refinedev/antd";
import { Button, Layout, Space, Tag, theme } from "antd";
import { LogoutOutlined } from "@ant-design/icons";

export const Header = ({ sticky = true }: RefineThemedLayoutHeaderProps) => {
  const { token } = theme.useToken();
  const { data: rol } = useGetIdentity<string | null>();
  const { mutate: cerrarSesion, isPending } = useLogout();

  return (
    <Layout.Header
      style={{
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        padding: "0 24px",
        height: 64,
        background: token.colorBgElevated,
        ...(sticky ? { position: "sticky", top: 0, zIndex: 1 } : {}),
      }}
    >
      <Space>
        {rol && <Tag color="#9b2247">{rol}</Tag>}
        <Button
          icon={<LogoutOutlined />}
          loading={isPending}
          onClick={() => cerrarSesion()}
        >
          Cerrar sesión
        </Button>
      </Space>
    </Layout.Header>
  );
};