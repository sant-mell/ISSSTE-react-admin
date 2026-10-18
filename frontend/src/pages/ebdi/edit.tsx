import { Edit, useForm } from "@refinedev/antd";
import { Form, Input, Select, Switch } from "antd";

export const EditarEbdi = () => {
  const { formProps, saveButtonProps } = useForm({
    successNotification: () => ({
      message: "EBDI actualizada",
      type: "success",
    }),
  });

  return (
    <Edit title="Editar EBDI" saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical" style={{ maxWidth: 600 }}>
        <Form.Item label="Nombre" name="nombre" rules={[{ required: true }]}>
          <Input maxLength={150} />
        </Form.Item>
        <Form.Item
          label="Municipio"
          name="municipio"
          rules={[{ required: true }]}
        >
          <Input maxLength={150} />
        </Form.Item>
        <Form.Item label="Tipo" name="tipo_ebdi" rules={[{ required: true }]}>
          <Select
            options={["Propias", "Contratadas", "OSC"].map((t) => ({
              value: t,
              label: t,
            }))}
          />
        </Form.Item>
        <Form.Item label="Activa" name="activo" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </Edit>
  );
};
