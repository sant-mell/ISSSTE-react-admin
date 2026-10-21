import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  aCapital,
  CodigoIndicador,
  COLOR_NIVEL,
  formatoEdad,
  formatoFecha,
  Identidad,
  INDICADORES,
  Infante,
  Medicion,
  MEDICION_CADA_DIAS,
  ROL,
  tallaBlancoFamiliar,
} from "../../utils/padron";
import { useGetIdentity, useList, useShow } from "@refinedev/core";
import {
  Breadcrumb,
  Button,
  Card,
  Col,
  Descriptions,
  Empty,
  Flex,
  List,
  Result,
  Row,
  Segmented,
  Skeleton,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
} from "antd";
import {
  CalendarOutlined,
  EditOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useCorregirMedicion } from "../../hooks/useCorregirMedicion";
import { GraficaCrecimiento } from "../../components";
import "./ficha.css";

export const FichaInfante = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [indicador, setIndicador] = useState<CodigoIndicador>("ha");
  const { data: yo } = useGetIdentity<Identidad>();
  const { corregir, modal } = useCorregirMedicion();

  // GET api/infantes/:id
  // GET api/mediciones?id_infante=id
  const { result: infante, query } = useShow<Infante>({
    resource: "infantes",
    id,
    queryOptions: { retry: false },
  });
  const { result: lista } = useList<Medicion>({
    resource: "mediciones",
    filters: [{ field: "id_infante", operator: "eq", value: id }],
    pagination: { mode: "off" },
  });
  const mediciones = lista.data;

  if (query.isLoading) return <Skeleton active />;
  if (query.isError || !infante) {
    return <Result status="404" title="No encontramos este expediente" />;
  }

  const esTutor = yo?.tipo === "tutor";
  const esAdmin = yo?.rol === ROL.admin;
  const puedeMedir = [ROL.admin, ROL.estancia].includes(yo?.rol ?? "");

  const ultimaMedicion: Medicion | undefined = mediciones[0];
  const estadoPeso =
    ultimaMedicion?.evaluaciones.bmi ?? ultimaMedicion?.evaluaciones.wh;
  const actual = ultimaMedicion?.evaluaciones[indicador];
  const blanco = tallaBlancoFamiliar(
    infante.talla_madre_cm,
    infante.talla_padre_cm,
    infante.sexo,
  );

  return (
    <>
      <Breadcrumb
        items={[
          { title: <Link to="/">Inicio</Link> },
          ...(esTutor
            ? []
            : [{ title: <Link to="/infantes">Niñas y niños</Link> }]),
          { title: infante.nombre_completo },
        ]}
      />

      {/* ENCABEZADO DE LA FICHA DEL INFANTE */}
      <Flex
        justify="space-between"
        align="start"
        wrap
        gap={16}
        className="ficha-encabezado"
      >
        <Space size="large" align="start">
          <div>
            <Typography.Title
              level={2}
              className="titulo-pagina"
              style={{ margin: 0 }}
            >
              {infante.nombre_completo}
            </Typography.Title>
            <Typography.Text type="secondary">
              {formatoEdad(infante.fecha_nacimiento)} - {infante.sexo_texto} -
              Matricula: {infante.matricula} | EBDI: {infante.ebdi_numero}
            </Typography.Text>
            <div style={{ marginTop: 8 }}>
              {estadoPeso && (
                <Tag color={COLOR_NIVEL[estadoPeso.nivel]}>
                  Estado Nutricional: {estadoPeso.categoria}
                </Tag>
              )}
              {ultimaMedicion && (
                <Tag icon={<CalendarOutlined />}>
                  Próxima medición:{" "}
                  {formatoFecha(
                    dayjs(ultimaMedicion.fecha)
                      .add(MEDICION_CADA_DIAS, "day")
                      .format("YYYY-MM-DD"),
                  )}
                </Tag>
              )}
            </div>
          </div>
        </Space>
        <Space wrap>
          {puedeMedir && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() =>
                navigate(`/mediciones/nueva?infante=${infante.id}`)
              }
            >
              Registrar medición
            </Button>
          )}
          {esAdmin && (
            <Button
              icon={<EditOutlined />}
              onClick={() => navigate(`/infantes/${infante.id}/editar`)}
            >
              Corregir datos
            </Button>
          )}
        </Space>
      </Flex>
      <Row gutter={[24, 24]}>
        {/* Columna de graficas */}
        <Col xs={24} lg={16}>
          <Card
            title="Gráficas de crecimiento"
            extra={
              <Typography.Text type="secondary">
                Referencia:{" "}
                {ultimaMedicion && ultimaMedicion.edad_meses < 24
                  ? "OMS"
                  : "CDC"}
              </Typography.Text>
            }
          >
            <Segmented<CodigoIndicador>
              value={indicador}
              onChange={setIndicador}
              options={Object.entries(INDICADORES).map(([value, label]) => ({
                value: value as CodigoIndicador,
                label,
              }))}
              className="ficha-indicadores"
            />
            {actual && (
              <Typography.Paragraph>
                Última medición: percentil {Math.round(actual.percentil)} (
                {actual.categoria}), z = {actual.z.toFixed(2)}
              </Typography.Paragraph>
            )}
            <GraficaCrecimiento
              indicador={indicador}
              sexo={infante.sexo}
              nombre={infante.nombre_completo}
              mediciones={mediciones}
            />
          </Card>
          <Card
            title="Mediciones"
            style={{ marginTop: 24 }}
            extra={
              <Typography.Text type="secondary">
                Cada {MEDICION_CADA_DIAS} días
              </Typography.Text>
            }
          >
            <Table
              dataSource={mediciones}
              rowKey="id"
              size="small"
              pagination={{ pageSize: 5 }}
              scroll={{ x: 560 }}
            >
              <Table.Column<Medicion>
                title="Fecha"
                render={(_, m) => formatoFecha(m.fecha)}
              />
              <Table.Column<Medicion>
                title="Edad"
                render={(_, m) =>
                  formatoEdad(infante.fecha_nacimiento, m.fecha)
                }
              />
              <Table.Column
                dataIndex="peso_kg"
                title="Peso (kg)"
                align="right"
              />
              <Table.Column
                dataIndex="talla_cm"
                title="Talla (cm)"
                align="right"
              />
              <Table.Column
                dataIndex="perimetro_cefalico_cm"
                title="P. cefálico (cm)"
                align="right"
                render={(v) => v ?? "N/A"}
              />
              <Table.Column dataIndex="imc" title="IMC" align="right" />
              {esAdmin && (
                <Table.Column<Medicion>
                  title=""
                  render={(_, m) => (
                    <Button
                      size="small"
                      type="link"
                      onClick={() => corregir(m.id)}
                    >
                      Corregir
                    </Button>
                  )}
                />
              )}
            </Table>
          </Card>
        </Col>
        {/* Columna lateral de información */}
        <Col xs={24} lg={8}>
          <Space direction="vertical" size={24} style={{ width: "100%" }}>
            <Card title="Indicadores actuales">
              {mediciones && mediciones.length > 0 ? (
                <List
                  size="small"
                  dataSource={Object.entries(INDICADORES)}
                  renderItem={([codigo, nombre]) => {
                    const ultimaMedicionConIndicador = mediciones.find(
                      (m) => m.evaluaciones[codigo as CodigoIndicador],
                    );
                    const ev =
                      ultimaMedicionConIndicador?.evaluaciones[
                        codigo as CodigoIndicador
                      ];

                    return (
                      <List.Item
                        extra={
                          ev ? (
                            <Space direction="vertical" align="end" size={0}>
                              <Tag color={COLOR_NIVEL[ev.nivel]}>
                                {ev.categoria}
                              </Tag>
                              <Typography.Text
                                type="secondary"
                                style={{ fontSize: "0.75rem" }}
                              >
                                {formatoFecha(ultimaMedicionConIndicador.fecha)}
                              </Typography.Text>
                            </Space>
                          ) : (
                            <Typography.Text type="secondary">
                              No aplica
                            </Typography.Text>
                          )
                        }
                      >
                        {nombre}
                      </List.Item>
                    );
                  }}
                />
              ) : (
                <Empty description="Aún no hay mediciones" />
              )}
            </Card>

            <Card title="Datos personales">
              <Descriptions
                column={1}
                size="small"
                layout="vertical"
                colon={false}
                items={[
                  {
                    label: "Nombre completo",
                    children: infante.nombre_completo,
                  },
                  {
                    label: "Fecha de nacimiento",
                    children: formatoFecha(infante.fecha_nacimiento),
                  },
                  { label: "Sexo", children: infante.sexo_texto },
                  { label: "CURP", children: infante.curp ?? "N/A" },
                  {
                    label: "EBDI",
                    children: `${infante.ebdi_numero} - ${infante.ebdi}`,
                  },
                  {
                    label: "Ubicación",
                    children: `${infante.estado}, ${aCapital(
                      infante.municipio,
                    )}`,
                  },
                  {
                    label: "Madre, padre o tutor",
                    children:
                      infante.tutores && infante.tutores.length > 0 ? (
                        <Space direction="vertical" size="small">
                          {infante.tutores.map((t, i) => (
                            <Space
                              direction="vertical"
                              size={0}
                              key={t.telefono || i}
                            >
                              {t.es_principal && (
                                <Tag color="blue">Principal</Tag>
                              )}
                              <span>{`${aCapital(t.nombre)} (${aCapital(
                                t.parentesco,
                              )})`}</span>
                              <span>{`Teléfono: ${t.telefono}`}</span>
                            </Space>
                          ))}
                        </Space>
                      ) : (
                        "N/A"
                      ),
                  },
                ]}
              />
            </Card>
            <Card title="Talla blanco familiar">
              <Flex justify="space-between">
                <Statistic
                  title="Madre"
                  value={infante.talla_madre_cm ?? "N/A"}
                  suffix="cm"
                />
                <Statistic
                  title="Padre"
                  value={infante.talla_padre_cm ?? "N/A"}
                  suffix="cm"
                />
                <Statistic
                  title="Blanco familiar"
                  value={blanco ?? "N/A"}
                  suffix="cm"
                />
              </Flex>
            </Card>
            <Card title="Historia clínica">
              {infante.historial?.length ? (
                <List
                  size="small"
                  dataSource={infante.historial}
                  renderItem={(h) => (
                    <List.Item>
                      <List.Item.Meta
                        title={`${formatoFecha(h.fecha)} · ${
                          h.diagnostico ?? "Sin diagnóstico"
                        }`}
                        description={
                          <Space direction="vertical" size={0}>
                            <span>{h.antecedente}</span>
                            <span>{h.observaciones}</span>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <Empty description="Sin registros" />
              )}
            </Card>
          </Space>
        </Col>
      </Row>
      {modal}
    </>
  );
};
