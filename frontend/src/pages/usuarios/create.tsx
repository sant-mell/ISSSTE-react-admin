import { Create, useForm } from "@refinedev/antd";
import { FormUsuario } from "./form";

export const NuevoUsuario = () => {
  const { formProps, saveButtonProps } = useForm({
    successNotification: () => ({ message: "Usuario creado", type: "success" }),
  });

  return (
    <Create title="Nuevo usuario" saveButtonProps={saveButtonProps}>
      <FormUsuario formProps={formProps} esNuevo />
    </Create>
  );
};
