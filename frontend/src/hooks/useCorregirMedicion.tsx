import { useModalForm } from "@refinedev/antd";
import { Form, Modal, DatePicker, Space, InputNumber, Input } from "antd";
import { propsFecha } from "../utils/padron";
import dayjs from "dayjs";

export function useCorregirMedicion() {
  const { modalProps, formProps, show } = useModalForm({
    resource: "mediciones",
    action: "edit",
    warnWhenUnsavedChanges: false,
    successNotification: () => ({
      message: "Medición corregida y recalculada",
      type: "success",
    }),
  });

  const modal = (
    <Modal
      {...modalProps}
      title="Corregir medición"
      okText="Guardar"
      cancelText="Cancelar"
    >
      <Form {...formProps} layout="vertical">
        <Form.Item
          label="Fecha"
          name="fecha"
          rules={[{ required: true }]}
          {...propsFecha}
        >
          <DatePicker
            format="DD/MM/YYYY"
            disabledDate={(d) => d.isAfter(dayjs())}
          />
        </Form.Item>
        <Space wrap>
          <Form.Item label="Peso" name="peso_kg" rules={[{ required: true }]}>
            <InputNumber min={0.5} max={80} step={0.1} suffix="kg" />
          </Form.Item>
          <Form.Item label="Talla" name="talla_cm" rules={[{ required: true }]}>
            <InputNumber min={10} max={200} step={0.1} suffix="cm" />
          </Form.Item>
          <Form.Item label="Perímetro cefálico" name="perimetro_cefalico_cm">
            <InputNumber min={20} max={70} step={0.1} suffix="cm" />
          </Form.Item>
        </Space>
        <Form.Item label="Observaciones" name="observaciones">
          <Input.TextArea rows={2} maxLength={500} />
        </Form.Item>
      </Form>
    </Modal>
  );

  return { corregir: show, modal };
}
