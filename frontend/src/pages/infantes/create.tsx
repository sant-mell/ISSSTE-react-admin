import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Alert,
  Breadcrumb,
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Radio,
  Row,
  Select,
  Space,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { Link, useNavigate } from "react-router";
import { useCatalogos } from "../../hooks/useCatalogos";
import { useForm } from "@refinedev/antd";
import { propsFecha, tallaBlancoFamiliar } from "../../utils/padron";
import { useEffect } from "react";

const MAX_TUTORES = 3;

const PARENTESCOS = [
  { value: "madre", label: "Madre" },
  { value: "padre", label: "Padre" },
  { value: "abuelo/abuela", label: "Abuelo / Abuela" },
  { value: "tutor", label: "Tutor o tutora" },
  { value: "otro", label: "Otro" },
];

const PATRON_CURP = /^[A-Z]{4}\d{6}[HMX][A-Z]{5}[A-Z0-9]\d$/;

type Persona = {
  nombre?: string;
  apellido_paterno?: string;
  apellido_materno?: string;
  telefono?: string;
  email?: string;
  parentesco?: string;
};

type Valores = Record<string, unknown> & {
  tutores: Persona[];
  indicePrincipal?: number;
};

export const CrearInfante = () => {
  const navigate = useNavigate();
  const { ebdis } = useCatalogos();

  // POST /api/infantes
  const { formProps, saveButtonProps } = useForm({
    resource: "infantes",
    action: "create",
    onMutationSuccess: (respuesta) =>
      navigate(`/infantes/${respuesta.data.id}`),
    successNotification: () => ({
      message: "Niña o niño registrado",
      type: "success",
    }),
  });
  const { form } = formProps;

  function armarPaquete(valores: Valores) {
    const { indicePrincipal, ...resto } = valores;
    return {
      ...resto,
      tutores: valores.tutores.map((persona, i) => ({
        ...persona,
        principal: i === (indicePrincipal ?? 0),
      })),
    };
  }

  // Revisar campos que depende de otros campos
  const tutores = Form.useWatch("tutores", form) as Persona[] | undefined;
  const indicePrincipal = Form.useWatch("indicePrincipal", form) as
    | number
    | undefined;
  const nacimiento = Form.useWatch("fecha_nacimiento", form) as
    | string
    | undefined;
  const sexo = Form.useWatch("sexo", form) as number | undefined;
  const tallaMadre = Form.useWatch("talla_madre_cm", form) as
    | number
    | null
    | undefined;
  const tallaPadre = Form.useWatch("talla_padre_cm", form) as
    | number
    | null
    | undefined;
  const blanco = tallaBlancoFamiliar(tallaMadre, tallaPadre, sexo);
  const soloUnaEbdi = ebdis.length === 1;

  useEffect(() => {
    if (ebdis.length === 1) form?.setFieldValue("id_ebdi", ebdis[0].id);
  }, [ebdis, form]);

  useEffect(() => {
    if ((indicePrincipal ?? 0) >= (tutores?.length ?? 1)) {
      form?.setFieldValue("indicePrincipal", 0);
    }
  }, [tutores?.length, indicePrincipal, form]);

  const opcionesPrincipal = (tutores ?? []).map((persona, i) => ({
    value: i,
    label: `Persona ${i + 1}${
      persona?.nombre
        ? ` — ${persona.nombre} ${persona.apellido_paterno ?? ""}`
        : ""
    }`,
  }));

  return (
    <>
      <Breadcrumb
        items={[
          { title: <Link to="/">Inicio</Link> },
          { title: <Link to="/infantes">Niñas y niños</Link> },
          { title: "Registrar" },
        ]}
      />
      <Typography.Title level={1} className="titulo-pagina">
        Registrar un nuevo infante
      </Typography.Title>
      <Typography.Paragraph type="secondary">
        Los campos obligatorios deben llenarse para guardar
      </Typography.Paragraph>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={18}>
          <Form
            {...formProps}
            layout="vertical"
            requiredMark="optional"
            scrollToFirstError
            initialValues={{
              fecha_ingreso: dayjs().format("YYYY-MM-DD"),
              tutores: [{}],
              indicePrincipal: 0,
            }}
            onFinish={(valores) =>
              formProps.onFinish?.(armarPaquete(valores as Valores))
            }
          >
            {/* ------------- DATOS de la niña o niño ------------- */}
            <Card title="Datos de la niña o niño" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col xs={24} md={8}>
                  <Form.Item
                    label="Nombre(s)"
                    name="nombre"
                    rules={[
                      {
                        required: true,
                        whitespace: true,
                        message: "El nombre es obligatorio",
                      },
                    ]}
                  >
                    <Input maxLength={150} autoComplete="off" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item
                    label="Apellido paterno"
                    name="apellido_paterno"
                    rules={[{ required: true }]}
                  >
                    <Input maxLength={150} />
                  </Form.Item>
                </Col>

                <Col xs={24} md={8}>
                  <Form.Item label="Apellido materno" name="apellido_materno">
                    <Input maxLength={150} />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    label="CURP"
                    name="curp"
                    normalize={(v: string) => v?.toUpperCase().trim()}
                    rules={[
                      {
                        pattern: PATRON_CURP,
                        message: "CURP no válida",
                        required: true,
                      },
                    ]}
                  >
                    <Input maxLength={18} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Fecha de nacimiento"
                    name="fecha_nacimiento"
                    rules={[{ required: true }]}
                    {...propsFecha}
                  >
                    <DatePicker
                      format="DD/MM/YYYY"
                      style={{ width: "100%" }}
                      disabledDate={(d) => d.isAfter(dayjs())}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={24}>
                  <Form.Item
                    label="Sexo"
                    name="sexo"
                    rules={[{ required: true }]}
                  >
                    <Radio.Group aria-label="Sexo">
                      <Radio value={1}>Masculino</Radio>
                      <Radio value={2}>Femenino</Radio>
                    </Radio.Group>
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* ------------- Estancia ------------- */}
            <Card title="Estancia" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="EBDI"
                    name="id_ebdi"
                    rules={[{ required: true }]}
                  >
                    <Select
                      showSearch
                      optionFilterProp="label"
                      disabled={soloUnaEbdi}
                      options={ebdis.map((e) => ({
                        value: e.id,
                        label: `${e.numero} - ${e.nombre}`,
                      }))}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={6}>
                  <Form.Item
                    label="Matrícula"
                    name="matricula"
                    rules={[{ required: true }]}
                  >
                    <InputNumber
                      controls={false}
                      min={1}
                      precision={0}
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={6}>
                  <Form.Item
                    label="Fecha de ingreso"
                    name="fecha_ingreso"
                    dependencies={["fecha_nacimiento"]}
                    rules={[{ required: true }]}
                    {...propsFecha}
                  >
                    <DatePicker
                      format="DD/MM/YYYY"
                      style={{ width: "100%" }}
                      disabledDate={(d) =>
                        d.isAfter(dayjs()) ||
                        (!!nacimiento && d.isBefore(dayjs(nacimiento)))
                      }
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Card title="Madre, padre o tutor" style={{ marginBottom: 16 }}>
              <Typography.Paragraph type="secondary">
                Registra de 1 a {MAX_TUTORES} personas. Una será la persona
                principal de contacto
              </Typography.Paragraph>
              <Form.List name="tutores" initialValue={[{}]}>
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name }, i) => (
                      <Card
                        key={key}
                        type="inner"
                        size="small"
                        title={`Persona ${i + 1}`}
                        style={{ marginBottom: 12 }}
                        extra={
                          fields.length > 1 && (
                            <Button
                              type="text"
                              danger
                              icon={<MinusCircleOutlined />}
                              onClick={() => remove(name)}
                            >
                              Quitar
                            </Button>
                          )
                        }
                      >
                        <Row gutter={16} key={key} align="middle">
                          <Col xs={24} md={8}>
                            <Form.Item
                              label="Nombre(s)"
                              name={[name, "nombre"]}
                              rules={[{ required: true }]}
                            >
                              <Input maxLength={150} />
                            </Form.Item>
                          </Col>
                          <Col xs={24} md={8}>
                            <Form.Item
                              label="Apellido paterno"
                              name={[name, "apellido_paterno"]}
                              rules={[{ required: true }]}
                            >
                              <Input maxLength={150} />
                            </Form.Item>
                          </Col>
                          <Col xs={24} md={8}>
                            <Form.Item
                              label="Apellido materno"
                              name={[name, "apellido_materno"]}
                            >
                              <Input maxLength={150} />
                            </Form.Item>
                          </Col>
                          <Col xs={24} md={8}>
                            <Form.Item
                              label="Telefono"
                              name={[name, "telefono"]}
                              normalize={(v: string) => v?.replace(/\D/g, "")}
                              rules={[{ required: true }]}
                            >
                              <Input
                                maxLength={10}
                                inputMode="numeric"
                                autoComplete="tel"
                              />
                            </Form.Item>
                          </Col>
                          <Col xs={24} md={8}>
                            <Form.Item
                              label="Correo"
                              name={[name, "email"]}
                              rules={[{ required: true }]}
                            >
                              <Input
                                maxLength={255}
                                type="email"
                                autoComplete="email"
                              />
                            </Form.Item>
                          </Col>
                          <Col xs={24} md={8}>
                            <Form.Item
                              label="Parentesco"
                              name={[name, "parentesco"]}
                              rules={[{ required: true }]}
                            >
                              <Select options={PARENTESCOS} aria-label="Parentesco"></Select>
                            </Form.Item>
                          </Col>
                        </Row>
                      </Card>
                    ))}
                    <Button
                      type="dashed"
                      icon={<PlusOutlined />}
                      onClick={() => add()}
                      disabled={fields.length >= MAX_TUTORES}
                    >
                      Agregar tutor ({fields.length} / {MAX_TUTORES})
                    </Button>
                  </>
                )}
              </Form.List>

              <Form.Item
                label="Persona principal de contacto"
                name="indicePrincipal"
                required
                style={{ marginTop: 16, marginBottom: 0 }}
              >
                <Radio.Group options={opcionesPrincipal} aria-label="Persona principal de contacto" />
              </Form.Item>
            </Card>
            <Card
              title="Talla de los padres (recomendado)"
              style={{ marginBottom: 16 }}
            >
              <Row gutter={16}>
                <Col xs={16} md={12}>
                  <Form.Item
                    label="Talla de la madre (cm)"
                    name="talla_madre_cm"
                  >
                    <InputNumber
                      min={100}
                      max={200}
                      step={1}
                      suffix="cm"
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>
                <Col xs={16} md={12}>
                  <Form.Item label="Talla del padre (cm)" name="talla_padre_cm">
                    <InputNumber
                      min={100}
                      max={200}
                      step={1}
                      suffix="cm"
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>
              </Row>
              {blanco !== null && (
                <Alert
                  type="info"
                  showIcon
                  message={`Talla blanco familiar calculada: ${blanco.toFixed(
                    2,
                  )}`}
                />
              )}
            </Card>

            <Space wrap>
              <Button type="primary" {...saveButtonProps}>
                Registrar niña o niño
              </Button>
              <Button onClick={() => navigate("/infantes")}>Cancelar</Button>
            </Space>
          </Form>
        </Col>
        {/* --------- COLUMNA DERECHA --------- */}
        <Col xs={24} lg={6}>
          <Card title="Datos previos necesarios" style={{ marginBottom: 16 }}>
            <ul style={{ paddingLeft: 18, margin: 0 }}>
              <li>Matrícula</li>
              <li>CURP</li>
              <li>Datos de la familia</li>
            </ul>
          </Card>
          <Alert
            showIcon
            type="info"
            message={
              <span>
                <strong>Acceso de la familia:</strong> Explica que el acceso es
                con matrícula, CURP y apellidos
              </span>
            }
          />
        </Col>
      </Row>
    </>
  );
};
