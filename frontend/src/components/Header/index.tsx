import { useGetIdentity } from "@refinedev/core";
import { Layout, Space, Typography } from "antd";

type Identidad = { nombre: string; rol: string };

export const Header = () => {
  const { data: usuario } = useGetIdentity<Identidad>();

  return (
    <Layout.Header
      style={{
        background: "#fff",
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        padding: "0 2rem",
        borderBottom: "1px solid #e6e6e6",
      }}
    >
      <Space
        direction="vertical"
        size={0}
        style={{ lineHeight: 1.3, textAlign: "right" }}
      >
        <Typography.Text strong>{usuario?.nombre}</Typography.Text>
        <Typography.Text type="secondary">{usuario?.rol}</Typography.Text>
      </Space>
    </Layout.Header>
  );
};
