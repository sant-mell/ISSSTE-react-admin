import { List, useTable } from "@refinedev/antd";
import { Table } from "antd";

type Infante = {
  id: number;
  matricula: number;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string | null;
  sexo: string;
  fecha_nacimiento: string;
  curp: string;
  estatus: string;
  ebdi: string;
};

export const ListaInfantes = () => {
  const { tableProps } = useTable<Infante>();

  return (
    <List title="Infantes">
      <Table {...tableProps} rowKey={"id"}>
        <Table.Column dataIndex={"matricula"} title="Matrícula" />
        <Table.Column<Infante>
          title="Nombre"
          render={(_, fila) =>
            `${fila.nombre} ${fila.apellido_paterno} ${fila.apellido_materno}`
          }
        />
        <Table.Column dataIndex={"sexo"} title="Sexo" />
        <Table.Column dataIndex={"ebdi"} title="EBDI" />
        <Table.Column dataIndex={"curp"} title="EBDI" />
      </Table>
    </List>
  );
};
