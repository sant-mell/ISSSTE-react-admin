import { useGetIdentity } from "@refinedev/core";
import { CreateButton, useTable } from "@refinedev/antd";
import {
  Button,
  Card,
  Flex,
  Input,
  Select,
  Space,
  Table,
  Typography,
} from "antd";
import { Link, useNavigate } from "react-router";
import { useCatalogos } from "../../hooks/useCatalogos.ts";
import {
  aCapital,
  ROL,
  type Identidad,
  type Infante,
} from "../../utils/padron";

// Lista de Infantes
export const ListaInfantes = () => {
  const navigate = useNavigate();
  const { data: yo } = useGetIdentity<Identidad>();
  const { regiones, estados, ebdis } = useCatalogos();

  const { tableProps, filters, setFilters } = useTable<Infante>({
    syncWithLocation: true,
    pagination: { pageSize: 10 },
  });

  const valor = (campo: string) =>
    filters.find((f) => "field" in f && f.field === campo)?.value;
  const aplicar = (cambios: Record<string, unknown>) =>
    setFilters(
      Object.entries(cambios).map(([field, value]) => ({
        field,
        operator: "eq",
        value,
      })),
    );

  const region = valor("id_region");
  const estado = valor("id_estado");
  const puedeMedir = [ROL.admin, ROL.estancia].includes(yo?.rol ?? "");

  return (
    <>
      <Flex justify="space-between" align="center">
        <Typography.Title level={2} className="titulo-pagina">
          Niñas y niños
        </Typography.Title>
        <CreateButton>Nuevo infante</CreateButton>
      </Flex>

      <Card style={{ marginBottom: 16 }}>
        <Space wrap size="middle">
          {regiones.length > 1 && (
            <Select
              allowClear
              placeholder="Región"
              style={{ width: 160 }}
              options={regiones}
              value={region}
              onChange={(v) =>
                aplicar({
                  id_region: v,
                  id_estado: undefined,
                  id_ebdi: undefined,
                })
              }
            />
          )}
          {estados.length > 1 && (
            <Select
              allowClear
              showSearch
              optionFilterProp="label"
              placeholder="Estado"
              style={{ width: 200 }}
              value={estado}
              options={estados.filter((e) => !region || e.id_region === region)}
              onChange={(v) => aplicar({ id_estado: v, id_ebdi: undefined })}
            />
          )}
          {ebdis.length > 1 && (
            <Select
              allowClear
              showSearch
              optionFilterProp="label"
              placeholder="EBDI"
              style={{ width: 220 }}
              value={valor("id_ebdi")}
              options={ebdis
                .filter(
                  (e) =>
                    (!region || e.id_region === region) &&
                    (!estado || e.id_estado === estado),
                )
                .map((e) => ({
                  value: e.id,
                  label: `${e.numero} - ${e.nombre}`,
                }))}
              onChange={(v) => aplicar({ id_ebdi: v })}
            />
          )}
          <Input.Search
            allowClear
            placeholder="Buscar por nombre o matrícula"
            style={{ width: 280 }}
            defaultValue={valor("q")}
            onSearch={(texto) => aplicar({ q: texto || undefined })}
          />
        </Space>
      </Card>

      <Table {...tableProps} rowKey={"id"} scroll={{ x: 900 }}>
        <Table.Column<Infante>
          title="Nombre completo"
          render={(_, n) => (
            <Link to={`/infantes/${n.id}`}>{n.nombre_completo}</Link>
          )}
        />
        <Table.Column dataIndex="sexo_texto" title="Sexo" />
        <Table.Column dataIndex="curp" title="CURP" />
        <Table.Column dataIndex="ebdi" title="EBDI" />
        <Table.Column dataIndex="estado" title="Estado" />
        <Table.Column
          dataIndex="municipio"
          title="Municipio"
          render={(m) => aCapital(m)}
        />
        {puedeMedir && (
          <Table.Column<Infante>
            title=""
            render={(_, n) => (
              <Button
                size="small"
                onClick={() => navigate(`/mediciones/nueva?infante=${n.id}`)}
              >
                Registrar medición
              </Button>
            )}
          />
        )}
      </Table>
    </>
  );
};
