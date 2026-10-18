import { Edit, useForm } from "@refinedev/antd";
import { Infante, propsFecha } from "../../utils/padron";
import {
  Alert,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
} from "antd";
import dayjs from "dayjs";

export const EditarInfante = () => {
  // GET /api/infantes/:id
  const { formProps, saveButtonProps } = useForm<Infante>({
    redirect: "show",
    successNotification: () => ({
      message: "Datos corregidos",
      type: "success",
    }),
  });

  return (
    <Edit title="Corregir datos personales" saveButtonProps={saveButtonProps}>
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message="Si cambias el sexo o la fecha de nacimiento, se recalculan todas las evaluaciones"
      />
      <Form {...formProps} layout="vertical">
        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Form.Item
              label="Nombre(s)"
              name="nombre"
              rules={[{ required: true }]}
            >
              <Input maxLength={100} />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              label="Apellido paterno"
              name="apellido_paterno"
              rules={[{ required: true }]}
            >
              <Input maxLength={100} />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label="Apellido materno" name="apellido_materno">
              <Input maxLength={100} />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              label="CURP"
              name="curp"
              normalize={(v: string) => v?.toUpperCase().trim()}
              rules={[
                {
                  pattern: /^[A-Z]{4}\d{6}[HMX][A-Z]{5}[A-Z0-9]\d$/,
                  message: "CURP no válida",
                },
              ]}
            >
              <Input maxLength={100} />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label="Sexo" name="sexo" rules={[{ required: true }]}>
              <Select
                options={[
                  { value: 2, label: "Femenino" },
                  { value: 1, label: "Masculino" },
                ]}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
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
          <Col xs={24} md={8}>
            <Form.Item label="Talla del padre" name="talla_padre_cm">
              <InputNumber
                min={100}
                max={220}
                suffix="cm"
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label="Talla de la madre" name="talla_madre_cm">
              <InputNumber
                min={100}
                max={220}
                suffix="cm"
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              label="Estatus"
              name="estatus"
              rules={[{ required: true }]}
            >
              <Select
                options={["activo", "baja", "egresado"].map((e) => ({
                  value: e,
                  label: e,
                }))}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Edit>
  );
};
