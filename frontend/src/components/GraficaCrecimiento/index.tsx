import { useCustom } from "@refinedev/core";
import { Line } from "@ant-design/plots";
import { Empty, Spin } from "antd";
import { API_URL } from "../../providers/constants.js";
import type { CodigoIndicador, Medicion } from "../../utils/padron.js";

type Props = {
  indicador: CodigoIndicador;
  sexo: number;
  nombre: string;
  mediciones: Medicion[];
};

const EJES: Record<
  CodigoIndicador,
  {
    x: (m: Medicion) => number;
    y: (m: Medicion) => number;
    ejeX: string;
    ejeY: string;
  }
> = {
  ha: {
    x: (m) => m.edad_meses,
    y: (m) => m.talla_cm,
    ejeX: "Edad (meses)",
    ejeY: "Talla (cm)",
  },
  wa: {
    x: (m) => m.edad_meses,
    y: (m) => m.peso_kg,
    ejeX: "Edad (meses)",
    ejeY: "Peso (kg)",
  },
  wh: {
    x: (m) => m.talla_cm,
    y: (m) => m.peso_kg,
    ejeX: "Talla (cm)",
    ejeY: "Peso (kg)",
  },
  bmi: {
    x: (m) => m.edad_meses,
    y: (m) => m.imc,
    ejeX: "Edad (meses)",
    ejeY: "IMC (kg/m²)",
  },
  hc: {
    x: (m) => m.edad_meses,
    y: (m) => m.perimetro_cefalico_cm ?? 0,
    ejeX: "Edad (meses)",
    ejeY: "Perímetro cefálico (cm)",
  },
};

export const GraficaCrecimiento = ({
  indicador,
  sexo,
  nombre,
  mediciones,
}: Props) => {
  const eje = EJES[indicador];
  const puntos = mediciones
    .filter((m) => m.evaluaciones[indicador])
    .map((m) => ({ x: eje.x(m), y: eje.y(m), serie: nombre }));

  const xs = puntos.map((p) => p.x);
  const margen = indicador === "wh" ? 5 : 6;
  const desde = Math.max(0, Math.floor(Math.min(...xs)) - margen);
  const hasta = Math.ceil(Math.max(...xs)) + margen;

  // Curvas con los percentiles
  const { result, query } = useCustom<
    { x: number; p5: number; p50: number; p95: number }[]
  >({
    url: `${API_URL}/referencias/curvas`,
    method: "get",
    config: {
      query: { indicador, sexo, desde, hasta, edad: mediciones[0]?.edad_meses },
    },
    queryOptions: { enabled: puntos.length > 0, retry: false },
  });

  if (puntos.length === 0) {
    return (
      <Empty description="Sin mediciones con referencia para este indicador" />
    );
  }

  if (query.isLoading) return <Spin />;

  const referencia = Array.isArray(result?.data) ? result.data : [];
  const curvas = referencia.flatMap((c) => [
    { x: c.x, y: c.p95, serie: "Percentil 95" },
    { x: c.x, y: c.p50, serie: "Percentil 50" },
    { x: c.x, y: c.p5, serie: "Percentil 5" },
  ]);

  return (
    <Line
      data={[...curvas, ...puntos]}
      xField="x"
      yField="y"
      colorField="serie"
      height={320}
      axis={{ x: { title: eje.ejeX }, y: { title: eje.ejeY } }}
      scale={{
        color: {
          domain: [nombre, "Percentil 50", "Percentil 95", "Percentil 5"],
          range: ["#9b2247", "#8c8c8c", "#c8c8c8", "#c8c8c8"],
        },
        y: { nice: true, zero: false },
      }}
      style={{
        lineWidth: (d: { serie: string }[]) =>
          d[0]?.serie === nombre ? 2.5 : 1.5,
        lineDash: (d: { serie: string }[]) =>
          d[0]?.serie.startsWith("Percentil") ? [4, 4] : undefined,
      }}
      point={{
        style: { r: (d: { serie: string }) => (d.serie === nombre ? 4 : 0) },
      }}
      legend={{ color: { position: "bottom" } }}
      tooltip={{ title: (d: { x: number }) => `${eje.ejeX}: ${d.x}` }}
    />
  );
};
