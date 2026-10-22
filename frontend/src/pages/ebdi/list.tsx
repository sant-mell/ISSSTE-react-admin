import { EditButton, useTable } from "@refinedev/antd";
import { useGetIdentity } from "@refinedev/core";
import { Card, Input, Select, Space, Table, Tag, Typography } from "antd";
import { aCapital, ROL, type Identidad } from "../../utils/padron";

type Ebdi = {
  id: number;
  numero: string;
  nombre: string;
  tipo_ebdi: string;
  municipio: string;
  estado: string;
  region: string;
  activo: number;
  infantes_activos: number;
};

export const ListaEbdi = () => {
  const { data: yo } = useGetIdentity<Identidad>();
  const { tableProps, filters, setFilters } = useTable<Ebdi>({
    syncWithLocation: true,
    filters: {
      initial: [{ field: "tipo_ebdi", operator: "eq", value: "Propias" }],
    },
  });
  const valor = (campo: string) =>
    filters.find((f) => "field" in f && f.field === campo)?.value;
  const aplicar = (field: string, value: unknown) =>
    setFilters([{ field, operator: "eq", value }]);

  return (
    <>
      <Typography.Title level={2} className="titulo-pagina">
        EBDIs
      </Typography.Title>
      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Select
            allowClear
            placeholder="Tipo"
            aria-label="Tipo"
            style={{ width: 180 }}
            value={valor("tipo_ebdi")}
            options={["Propias", "Contratadas", "OSC"].map((t) => ({
              value: t,
              label: t,
            }))}
            onChange={(v) => aplicar("tipo_ebdi", v)}
          />
          <Input.Search
            allowClear
            placeholder="Nombre, número o municipio"
            style={{ width: 280 }}
            defaultValue={valor("q")}
            onSearch={(t) => aplicar("q", t || undefined)}
          />
        </Space>
      </Card>

      <Table {...tableProps} rowKey="id" scroll={{ x: 900 }}>
        <Table.Column dataIndex="numero" title="Número" />
        <Table.Column dataIndex="nombre" title="Nombre" />
        <Table.Column dataIndex="tipo_ebdi" title="Tipo" />
        <Table.Column dataIndex="estado" title="Estado" />
        <Table.Column
          dataIndex="municipio"
          title="Municipio"
          render={(m) => aCapital(m)}
        />
        <Table.Column dataIndex="region" title="Región" />
        <Table.Column
          dataIndex="infantes_activos"
          title="Cantidad de Infantes"
          align="right"
        />
        <Table.Column
          dataIndex="activo"
          title="Estado"
          render={(a: number) =>
            a ? <Tag style={{ backgroundColor: "#f6ffed", color: "#30860b", borderColor: "#b7eb8f",}}>Activa</Tag> : <Tag>Inactiva</Tag>
          }
        />
        {yo?.rol === ROL.admin && (
          <Table.Column<Ebdi>
            title=""
            render={(_, e) => (
              <EditButton size="small" recordItemId={e.id}>
                Editar
              </EditButton>
            )}
          />
        )}
      </Table>
    </>
  );
};
