import { useGetIdentity, useList, useShow } from "@refinedev/core";
import { useNavigate, useSearchParams } from "react-router";
import {
  formatoEdad,
  formatoFecha,
  Identidad,
  Infante,
  Medicion,
  MEDICION_CADA_DIAS,
  propsFecha,
} from "../../utils/padron.ts";
import { useForm, useSelect } from "@refinedev/antd";
import {
  Alert,
  Button,
  Card,
  Col,
  DatePicker,
  Flex,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Statistic,
  Typography,
} from "antd";
import { useEffect } from "react";
import dayjs from "dayjs";

export const RegistrarMedicion = () => {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const idInfante = params.get("infante");
  const { data: yo } = useGetIdentity<Identidad>();

  // POST /api/mediciones
  const { formProps, saveButtonProps } = useForm({
    resource: "mediciones",
    action: "create",
    redirect: false,
    onMutationSuccess: () => navigate(`/infantes/${idInfante}`),
    successNotification: () => ({
      message: "Medición registrada",
      type: "success",
    }),
  });

  const { result: infanteCargado } = useShow<Infante>({
    resource: "infantes",
    id: idInfante ?? "",
    queryOptions: { enabled: !!idInfante },
  });

  const { result: lista } = useList<Medicion>({
    resource: "mediciones",
    filters: [{ field: "id_infante", operator: "eq", value: idInfante }],
    pagination: { mode: "off" },
    queryOptions: { enabled: !!idInfante },
  });
  const infante = idInfante ? infanteCargado : undefined;
  const ultima = idInfante ? lista.data[0] : undefined;

  // Buscador de niñas y niños
  const { selectProps } = useSelect<Infante>({
    resource: "infantes",
    optionLabel: "nombre_completo",
    optionValue: "id",
    onSearch: (texto) => [{ field: "q", operator: "eq", value: texto }],
  });

  // Al elegir infante, se cargan las tallas de los padres
  useEffect(() => {
    formProps.form?.setFieldsValue({
      talla_madre_cm: infante?.talla_madre_cm ?? undefined,
      talla_padre_cm: infante?.talla_padre_cm ?? undefined,
    });
  }, [infante, formProps.form]);

  const diasDesdeUltima = ultima
    ? dayjs().diff(dayjs(ultima.fecha), "day")
    : null;

  return (
    <>
      <Typography.Title level={2} className="titulo-pagina">
        Registrar medición
      </Typography.Title>
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          {/* Seleccionar quien se mide */}
          <Card style={{ marginBottom: 16, background: "#fafafa" }}>
            {infante ? (
              <Flex justify="space-between" align="center" wrap gap={8}>
                <Space>
                  <div>
                    <Typography.Text strong>
                      {infante.nombre_completo}
                    </Typography.Text>
                    <br />
                    <Typography.Text type="secondary">
                      {formatoEdad(infante.fecha_nacimiento)} -{" "}
                      {infante.sexo_texto} - Matricula: {infante.matricula} |
                      EBDI: {infante.ebdi_numero}
                    </Typography.Text>
                  </div>
                </Space>
                <Button type="link" onClick={() => setParams({})}>
                  Cambiar niña o niño
                </Button>
              </Flex>
            ) : (
              <Space direction="vertical" style={{ width: "100%" }}>
                <Typography.Text strong>
                  Selecciona una niña o un niño
                </Typography.Text>
                <Select
                  {...selectProps}
                  showSearch
                  aria-label="Buscar niña o niño por nombre o matrícula"
                  placeholder="Escribe nombre o matrícula"
                  style={{ width: "100%" }}
                  onChange={(valor) => setParams({ infante: String(valor) })}
                />
              </Space>
            )}
          </Card>
          {infante && (
            <Form
              {...formProps}
              layout="vertical"
              requiredMark="optional"
              initialValues={{ fecha: dayjs().format("YYYY-MM-DD") }}
              onFinish={(valores) =>
                formProps.onFinish?.({ ...valores, id_infante: infante.id })
              }
            >
              <Card
                title="Datos de la medición"
                size="small"
                style={{ marginBottom: 16 }}
              >
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Fecha de medición"
                      name="fecha"
                      rules={[{ required: true }]}
                      {...propsFecha}
                    >
                      <DatePicker
                        format="DD/MM/YYYY"
                        style={{ width: "100%" }}
                        disabledDate={(d) =>
                          d.isAfter(dayjs()) ||
                          d.isBefore(dayjs(infante.fecha_nacimiento))
                        }
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item label="Responsable de la medición" required>
                      <Input value={yo?.nombre} disabled aria-hidden="true"/>
                    </Form.Item>
                  </Col>
                </Row>
              </Card>

              <Card
                title="Medidas antropométricas"
                size="small"
                style={{ marginBottom: 16 }}
              >
                <Row gutter={16}>
                  <Col xs={24} md={8}>
                    <Form.Item
                      label="Peso"
                      name="peso_kg"
                      rules={[{ required: true }]}
                    >
                      <InputNumber
                        min={0.1}
                        max={80}
                        step={0.1}
                        suffix="kg"
                        style={{ width: "100%" }}
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={8}>
                    <Form.Item
                      label="Talla"
                      name="talla_cm"
                      rules={[{ required: true }]}
                    >
                      <InputNumber
                        min={10}
                        max={200}
                        step={0.1}
                        suffix="cm"
                        style={{ width: "100%" }}
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={8}>
                    <Form.Item
                      label="Perímetro cefálico"
                      name="perimetro_cefalico_cm"
                    >
                      <InputNumber
                        min={20}
                        max={70}
                        step={0.1}
                        suffix="cm"
                        style={{ width: "100%" }}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>

              <Form.Item label="Observaciones" name="observaciones">
                <Input.TextArea rows={3} maxLength={300} />
              </Form.Item>

              <Space>
                <Button type="primary" {...saveButtonProps}>
                  Guardar medición
                </Button>
                <Button onClick={() => navigate(-1)}>Cancelar</Button>
              </Space>
            </Form>
          )}
        </Col>
        {/* ------- COLUMNA LATERAL ------- */}
        {infante && (
          <Col xs={24} lg={8}>
            <Space direction="vertical" size={24} style={{ width: "100%" }}>
              <Card title="Última medición">
                {ultima ? (
                  <>
                    <Typography.Text type="secondary">
                      {formatoFecha(ultima.fecha)}
                    </Typography.Text>
                    <Flex justify="space-between" style={{ margin: "12px 0" }}>
                      <Statistic
                        title="Peso"
                        value={ultima.peso_kg}
                        suffix="kg"
                      />
                      <Statistic
                        title="Talla"
                        value={ultima.talla_cm}
                        suffix="cm"
                      />
                      <Statistic
                        title="Perímetro Cefálico"
                        value={ultima.perimetro_cefalico_cm ?? "-"}
                        suffix="cm"
                      />
                    </Flex>
                    <Alert
                      showIcon
                      type={
                        diasDesdeUltima! > MEDICION_CADA_DIAS
                          ? "warning"
                          : "info"
                      }
                      message={`Día ${diasDesdeUltima} de ${MEDICION_CADA_DIAS} desde la última medición`}
                    />
                  </>
                ) : (
                  <Typography.Text type="secondary">
                    Sin registro de mediciones
                  </Typography.Text>
                )}
              </Card>
              <Card title="Instrucciones">
                <ul style={{ paddingLeft: 18, margin: 0 }}>
                  <li>Menores de 2 años: se miden acostados</li>
                  <li>2 años para adelante: talla de pie y sin zapatos</li>
                  <li>Peso con ropa ligera y báscula en cero</li>
                  <li>
                    Perímetro cefálico: cinta sobre cejas y la parte mas
                    saliente de la nuca
                  </li>
                </ul>
              </Card>
            </Space>
          </Col>
        )}
      </Row>
    </>
  );
};
