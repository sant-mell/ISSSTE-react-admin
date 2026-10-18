import { Edit, useForm } from "@refinedev/antd";
import { FormUsuario } from "./form";

export const EditarUsuario = () => {
  const { formProps, saveButtonProps, query } = useForm<{ bloqueado: boolean }>(
    {
      successNotification: () => ({
        message: "Usuario actualizado",
        type: "success",
      }),
    },
  );
  return (
    <Edit title="Editar usuario" saveButtonProps={saveButtonProps}>
      <FormUsuario
        formProps={formProps}
        bloqueado={query?.data?.data.bloqueado}
      />
    </Edit>
  );
};
