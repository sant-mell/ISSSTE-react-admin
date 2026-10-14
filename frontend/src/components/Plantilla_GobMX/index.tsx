import type { ReactNode } from "react";
import "./plantilla_gob.css";

export const PlantillaGob = ({ children }: { children: ReactNode }) => (
  <div className="gob">
    <header>
      {/* Franja guinda: logo del Gobierno de México */}
      <div className="gob-barra">
        <div className="gob-contenedor">
          <a href="https://www.gob.mx" className="gob-marca">
            <img
              src="/Logo_GobiernoMexico.png"
              alt="Logo del Gobierno de México"
              className="gob-marca-img"
            />
          </a>
        </div>
      </div>

      {/* Logo ISSSTE + nombre de la plataforma */}
      <div className="gob-encabezado">
        <div className="gob-contenedor">
          <img
            src="/Logo_ISSSTE.svg"
            alt="Logo del ISSSTE"
            className="gob-logo-img"
          />
          <div className="gob-sistema">
            <strong>Padrón Infantil</strong>
            <span>Crecimiento y Desarrollo Saludable</span>
          </div>
        </div>
      </div>
    </header>

    {children}

    <footer className="gob-pie">
      <div className="gob-contenedor gob-pie-columnas">
        <div>
          <strong className="gob-pie-titulo">Padrón Infantil</strong>
          <p>
            Registro y seguimiento del crecimiento infantil en las EBDIs del
            ISSSTE
          </p>
        </div>
        <div>
          <h3>Enlaces</h3>
          <a href="#">Aviso de privacidad</a>
        </div>
        <div>
          <h3>Soporte</h3>
          <p>Correo de soporte: atencionciudadana@issste.gob.mx</p>
        </div>
      </div>
    </footer>
  </div>
);
