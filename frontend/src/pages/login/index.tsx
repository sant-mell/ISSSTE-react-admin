import { useLogin } from "@refinedev/core";
import { useState } from "react";
import { Button, Form, Input } from "antd";
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import { PlantillaGob } from "../../components/Plantilla_GobMX";
import "./login.css";

type TipoAcceso = "Personal" | "Tutor";

const PATRON_CURP = /^[A-Z]{4}\d{6}[HMX][A-Z]{5}[A-Z0-9]\d$/;

export const Login = () => {
  const [tipo, setTipo] = useState<TipoAcceso>("Personal");
  const [verContrasena, setVerContrasena] = useState(false);
  const { mutate: login, isPending } = useLogin();

  const enviar = (valores: Record<string, string>) => {
    login({ tipo, ...valores });
  };

  return (
    <PlantillaGob>
      <main className="login gob-contenedor">
        <section className="login-info">
          <p className="login-antetitulo">
            ISSSTE | Estancias para el Bienestar y Desarrollo Infantil
          </p>
          <h1>Padrón Infantil</h1>
          <span className="login-linea"></span>
          <p className="login-descripcion">
            Plataforma de registro y seguimiento del crecimiento de niñas y
            niños
          </p>
        </section>

        <section className="login-tarjeta">
          <h2>Iniciar sesión</h2>

          <div className="login-pestanas" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={tipo === "Personal"}
              onClick={() => setTipo("Personal")}
            >
              Personal ISSSTE
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tipo === "Tutor"}
              onClick={() => setTipo("Tutor")}
            >
              Madre, Padre o Tutor
            </button>
          </div>
          <Form
            key={tipo}
            layout="vertical"
            requiredMark={false}
            onFinish={enviar}
          >
            {tipo === "Personal" ? (
              <>
                <Form.Item
                  label="Correo institucional"
                  name="email"
                  rules={[
                    {
                      required: true,
                      type: "email",
                      message: "Escribe un correo válido",
                    },
                  ]}
                >
                  <Input
                    size="large"
                    placeholder="nombre.apellido@issste.gob.mx"
                    autoComplete="username"
                  />
                </Form.Item>

                <Form.Item label="Contraseña" required>
                  <div className="login-contrasena">
                    <Form.Item
                      name="password"
                      noStyle
                      rules={[
                        { required: true, message: "Escribe tu contraseña" },
                      ]}
                    >
                      <Input
                        size="large"
                        type={verContrasena ? "text" : "password"}
                        autoComplete="current-password"
                      />
                    </Form.Item>
                    <Button
                      size="large"
                      icon={
                        verContrasena ? (
                          <EyeInvisibleOutlined />
                        ) : (
                          <EyeOutlined />
                        )
                      }
                      onClick={() => setVerContrasena(!verContrasena)}
                    >
                      {verContrasena ? "Ocultar" : "Mostrar"}
                    </Button>
                  </div>
                </Form.Item>
              </>
            ) : (
              <>
                <Form.Item
                  label="Matrícula de la niña o niño"
                  name="matricula"
                  rules={[
                    {
                      required: true,
                      pattern: /^\d+$/,
                      message: "Solo números",
                    },
                  ]}
                >
                  <Input
                    size="large"
                    inputMode="numeric"
                    placeholder="Ej. 100245"
                  />
                </Form.Item>

                <Form.Item
                  label="Curp de la niña o niño"
                  name="curp"
                  normalize={(valor: string) => valor?.toUpperCase().trim()}
                  rules={[
                    {
                      required: true,
                      pattern: PATRON_CURP,
                      message: "CURP no válido",
                    },
                  ]}
                >
                  <Input
                    size="large"
                    maxLength={18}
                    placeholder="18 caracteres"
                  />
                </Form.Item>
                <div className="login-fila">
                  <Form.Item
                    label="Apellido paterno"
                    name="apellidoPaterno"
                    rules={[{ required: true, message: "Obligatorio" }]}
                  >
                    <Input size="large" />
                  </Form.Item>
                  <Form.Item label="Apellido materno" name="apellidoMaterno">
                    <Input size="large" />
                  </Form.Item>
                </div>
              </>
            )}

            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={isPending}
            >
              Iniciar sesión
            </Button>
          </Form>
        </section>
      </main>
    </PlantillaGob>
  );
};
