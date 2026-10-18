import { useList } from "@refinedev/core";
import {
  Alert,
  Card,
  Col,
  Form,
  Input,
  Row,
  Select,
  Switch,
  type FormProps,
} from "antd";
import { useCatalogos } from "../../hooks/useCatalogos";

type Props = { formProps: FormProps; esNuevo?: boolean; bloqueado?: boolean };

export const FormUsuario = ({ formProps, esNuevo, bloqueado }: Props) => {
  const { regiones, estados, ebdis } = useCatalogos();
  const { result: roles } = useList<{
    id: number;
    rol: string;
    alcance_nacional: number;
  }>({
    resource: "catalogos/roles",
    pagination: { mode: "off" },
  });

  // El alcance solo se pide si el rol no es nacional
  const idRol = Form.useWatch("id_rol", formProps.form);
  const nacional = roles.data.find((r) => r.id === idRol)?.alcance_nacional;

  return (
    <Form
      {...formProps}
      layout="vertical"
      initialValues={{
        activo: true,
        regiones: [],
        estados: [],
        ebdis: [],
        ...formProps.initialValues,
      }}
    >
      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item label="Nombre" name="nombre" rules={[{ required: true }]}>
            <Input maxLength={150} />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            label="Correo institucional"
            name="email"
            rules={[{ required: true, type: "email" }]}
          >
            <Input maxLength={255} />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item label="Rol" name="id_rol" rules={[{ required: true }]}>
            <Select
              options={roles.data.map((r) => ({ value: r.id, label: r.rol }))}
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            label="Contraseña"
            name="password"
            rules={[
              { required: esNuevo },
              { min: 8, message: "Mínimo 8 caracteres" },
            ]}
            extra={
              esNuevo ? undefined : "Déjala vacía para conservar la actual"
            }
          >
            <Input.Password autoComplete="new-password" />
          </Form.Item>
        </Col>
        <Col xs={24}>
          <Form.Item
            label="Cuenta activa"
            name="activo"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Col>
        {bloqueado && (
          <Col xs={12}>
            <Form.Item
              label="Desbloquear"
              name="desbloquear"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Col>
        )}
      </Row>

      {nacional ? (
        <Alert type="info" showIcon message="Rol con alcance nacional" />
      ) : (
        <Card size="small" title="Alcance">
          <Form.Item label="Regiones" name="regiones">
            <Select
              mode="multiple"
              options={regiones}
              optionFilterProp="label"
            />
          </Form.Item>
          <Form.Item label="Estados" name="estados">
            <Select
              mode="multiple"
              options={estados}
              optionFilterProp="label"
            />
          </Form.Item>
          <Form.Item label="EBDIs" name="ebdis">
            <Select
              mode="multiple"
              options={ebdis.map((e) => ({
                value: e.id,
                label: `${e.numero} - ${e.nombre}`,
              }))}
              optionFilterProp="label"
            />
          </Form.Item>
        </Card>
      )}
    </Form>
  );
};
