import { useList } from "@refinedev/core";

type EbdiCatalogo = {
  id: number;
  numero: string;
  nombre: string;
  id_estado: number;
  estado: string;
  id_region: number;
  region: string;
};

// Opciones de región, estado y EBDIs dentro del alcance de un usuario
export function useCatalogos() {
  const { result } = useList<EbdiCatalogo>({
    resource: "catalogos/ebdi",
    pagination: { mode: "off" },
  });

  const ebdis = result.data;

  const regiones = [...new Map(ebdis.map((e) => [e.id_region, e.region]))].map(
    ([value, label]) => ({ value, label }),
  );

  const estados = [...new Map(ebdis.map((e) => [e.id_estado, e]))]
    .map(([value, e]) => ({ value, label: e.estado, id_region: e.id_region }))
    .sort((a, b) => a.label.localeCompare(b.label, "es"));

  return { ebdis, regiones, estados };
}
