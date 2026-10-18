import { CreateButton, EditButton, useTable } from "@refinedev/antd";
import { useList } from "@refinedev/core";
import { Card, Flex, Input, Select, Space, Table, Tag, Typography } from "antd";

type Usuario = {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  activo: number;
  bloqueado: number;
  alcance_nacional: number;
  alcance: string | null;
};

export const ListaUsuarios = () => {
  const { tableProps, filters, setFilters } = useTable<Usuario>({
    syncWithLocation: true,
  });
  const { result: roles } = useList<{ id: number; rol: string }>({
    resource: "catalogos/roles",
    pagination: { mode: "off" },
  });

  const valor = (campo: string) =>
    filters.find((f) => "field" in f && f.field === campo)?.value;
  const aplicar = (field: string, value: unknown) =>
    setFilters([{ field, operator: "eq", value }]);

  return (
    <>
      <Flex justify="space-between" align="center">
        <Typography.Title level={2} className="titulo-pagina">
          Usuarios
        </Typography.Title>
        <CreateButton>Nuevo usuario</CreateButton>
      </Flex>

      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Input.Search
            allowClear
            placeholder="Nombre o correo"
            style={{ width: 260 }}
            defaultValue={valor("q")}
            onSearch={(t) => aplicar("q", t || undefined)}
          />
          <Select
            allowClear
            placeholder="Rol"
            style={{ width: 220 }}
            value={valor("id_rol")}
            options={roles.data.map((r) => ({ value: r.id, label: r.rol }))}
            onChange={(v) => aplicar("id_rol", v)}
          />
        </Space>

        <Table {...tableProps} rowKey="id" scroll={{ x: 800 }}>
          <Table.Column dataIndex="nombre" title="Nombre" />
          <Table.Column dataIndex="email" title="Correo" />
          <Table.Column dataIndex="rol" title="Rol" />
          <Table.Column<Usuario>
            title="Alcance"
            render={(_, u) =>
              u.alcance_nacional ? "Nacional" : u.alcance ?? "—"
            }
          />
          <Table.Column<Usuario>
            title="Estado"
            render={(_, u) =>
              u.bloqueado ? (
                <Tag color="red">Bloqueado</Tag>
              ) : u.activo ? (
                <Tag color="green">Activo</Tag>
              ) : (
                <Tag>Inactivo</Tag>
              )
            }
          />
          <Table.Column<Usuario>
            title=""
            render={(_, u) => (
              <EditButton size="small" recordItemId={u.id}>
                Editar
              </EditButton>
            )}
          />
        </Table>
      </Card>
    </>
  );
};
