import dayjs from "dayjs";

export const ROL = {
  admin: "Administrador",
  coordinador: "Coordinador Regional",
  estancia: "Personal de estancia",
};
export const PERSONAL = [ROL.admin, ROL.coordinador, ROL.estancia];

export type Identidad = {
  id: number | string;
  id_infante?: number;
  tipo: "personal" | "tutor";
  rol: string;
  nombre: string;
};

export type Evaluacion = {
  z: number;
  percentil: number;
  categoria: string;
  nivel: "normal" | "precaución" | "riesgo";
  biv: number;
};

export type Medicion = {
  id: number;
  fecha: string;
  peso_kg: number;
  talla_cm: number;
  perimetro_cefalico_cm: number | null;
  observaciones: string | null;
  edad_meses: number;
  imc: number;
  evaluaciones: Partial<Record<"wa" | "ha" | "wh" | "bmi", Evaluacion>>;
};

export type Infante = {
  id: number;
  matricula: number;
  curp: string | null;
  apellido_paterno: string;
  apellido_materno: string | null;
  nombre_completo: string;
  sexo: 1 | 2;
  sexo_texto: string;
  fecha_nacimiento: string;
  talla_madre_cm: number | null;
  talla_padre_cm: number | null;
  estatus: string;
  ebdi: string;
  ebdi_numero: string;
  tipo_ebdi: string;
  municipio: string;
  estado: string;
  region: string;
  tutor?: { nombre: string; telefono: string; parentesco: string } | null;
  historial?: {
    id: number;
    fecha: string;
    antecedente: string | null;
    diagnostico: string | null;
    observaciones: string | null;
  }[];
};

export const INDICADORES = {
  ha: "Talla para la edad",
  wa: "Peso para la edad",
  wh: "Peso para la talla",
  bmi: "IMC para la edad",
} as const;
export type CodigoIndicador = keyof typeof INDICADORES;

export const COLOR_NIVEL: Record<string, string> = {
  normal: "green",
  precaución: "gold",
  riesgo: "red",
};

export const MEDICION_CADA_DIAS = 45;

export const formatoFecha = (fecha: string) =>
  dayjs(fecha).format("DD/MM/YYYY");

export function formatoEdad(fechaNacimiento: string) {
  const meses = dayjs().diff(dayjs(fechaNacimiento), "month");
  const years = Math.floor(meses / 12);
  return `${years} ${years === 1 ? "año" : "años"} ${meses % 12} ${
    meses % 12 === 1 ? "mes" : "meses"
  }`;
}

export function tallaBlancoFamiliar(
  madre?: number | null,
  padre?: number | null,
  sexo?: number,
) {
  if (!madre || !padre) return null;
  return (Number(madre) + Number(padre) + (sexo === 1 ? 13 : -13)) / 2;
}

export const propsFecha = {
  getValueProps: (valor?: string) => ({
    value: valor ? dayjs(valor) : undefined,
  }),
  normalize: (valor?: dayjs.Dayjs) => valor?.format("YYYY-MM-DD"),
};

export const aCapital = (texto?: string) => {
  if (!texto) return "";
  return texto
    .toLowerCase()
    .replace(/(^\p{L}|[\s\-_]\p{L})/gu, (c) => c.toUpperCase());
};
