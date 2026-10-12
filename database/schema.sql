-- =============================================================================
--  PADRÓN INFANTIL · Crecimiento y Desarrollo Saludable (ISSSTE)
--  Proyecto   : TC2007B Tec de Monterrey e ISSSTE
--  Equipo     : Fernanda Portela, Santiago Aguilar, Vladimir Reyes
-- =============================================================================

-- =============================================================================
-- Catalogo Organizacional
-- =============================================================================
CREATE TABLE Region (
    id_region   TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre      VARCHAR(50) NOT NULL,

    CONSTRAINT UQ_RegionNombre UNIQUE (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE Estado (
    id_estado   TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_region   TINYINT UNSIGNED NOT NULL,
    nombre      VARCHAR(50) NOT NULL,

    CONSTRAINT FK_EstadoRegion FOREIGN KEY (id_region)
        REFERENCES Region(id_region) ON DELETE RESTRICT ON UPDATE RESTRICT,
    
    CONSTRAINT UQ_EstadoNombre UNIQUE (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE EBDI (
    id_ebdi     SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_estado   TINYINT UNSIGNED NOT NULL,
    numero      VARCHAR(10) NOT NULL,
    nombre      VARCHAR(150) NOT NULL,
    municipio   VARCHAR(150) NOT NULL,
    tipo_ebdi   ENUM("Propias", "Contratadas", "OSC") NOT NULL,
    activo      BOOLEAN NOT NULL DEFAULT 1,

    CONSTRAINT FK_EBDIEstado FOREIGN KEY (id_estado)
        REFERENCES Estado(id_estado) ON DELETE RESTRICT ON UPDATE RESTRICT,

    CONSTRAINT UQ_EBDINumero UNIQUE (numero)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- Accesos
-- =============================================================================
CREATE TABLE Rol (
    id_rol              TINYINT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
    rol                 VARCHAR(50) NOT NULL,
    alcance_nacional    BOOLEAN NOT NULL DEFAULT 0,

    CONSTRAINT UQ_RolNombre UNIQUE (rol)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE Usuario (
    id_usuario          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_rol              TINYINT UNSIGNED  NOT NULL,
    email               VARCHAR(255) NOT NULL,
    nombre              VARCHAR(150) NOT NULL,
    contrasena_hash     VARCHAR(255) NOT NULL, 
    activo              BOOLEAN DEFAULT 1,
    intento_fallidos    TINYINT UNSIGNED NOT NULL DEFAULT 0,

    CONSTRAINT FK_UsuarioRol FOREIGN KEY (id_rol) 
        REFERENCES Rol(id_rol) ON DELETE RESTRICT ON UPDATE RESTRICT,

    CONSTRAINT UQ_UsuarioEmail UNIQUE (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE Usuario_Alcance (
    id_alcance  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_usuario  INT UNSIGNED NOT NULL,
    id_region   TINYINT UNSIGNED NULL,
    id_estado   TINYINT UNSIGNED NULL,
    id_ebdi     SMALLINT UNSIGNED NULL,

    CONSTRAINT FK_AlcanceUsuario FOREIGN KEY (id_usuario)
        REFERENCES Usuario(id_usuario) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT FK_AlcanceRegion FOREIGN KEY (id_region)
        REFERENCES Region(id_region) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT FK_AlcanceEstado FOREIGN KEY (id_estado)
        REFERENCES Estado(id_estado) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT FK_AlcanceEBDI FOREIGN KEY (id_ebdi)
        REFERENCES EBDI(id_ebdi) ON DELETE RESTRICT ON UPDATE RESTRICT,

    CONSTRAINT CHK_UsuarioAlcance_Nivel CHECK(
        (id_region IS NOT NULL) + (id_estado IS NOT NULL) + (id_ebdi IS NOT NULL) = 1
    ),

    CONSTRAINT UQ_Alcance_UsuarioRegion UNIQUE (id_usuario, id_region),
    CONSTRAINT UQ_Alcance_UsuarioEstado UNIQUE (id_usuario, id_estado),
    CONSTRAINT UQ_Alcance_UsuarioEBDI UNIQUE (id_usuario, id_ebdi)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- Referencia de Crecimiento
-- =============================================================================
CREATE TABLE Indicador (
    id_indicador    TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    codigo          VARCHAR(10) NOT NULL, -- Prefijo del SAS: wa, ha, wh, bmi, etc
    nombre          VARCHAR(60) NOT NULL,
    tipo_x          ENUM("edad", "talla") NOT NULL,

    CONSTRAINT UQ_IndicadorCodigo UNIQUE (codigo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE Version_Referencia (
    id_version          SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    fuente              ENUM("OMS", "CDC") NOT NULL,
    nombre              VARCHAR(40) NOT NULL,
    vigente             BOOLEAN NOT NULL DEFAULT 0,
    id_usuario_carga    INT UNSIGNED NOT NULL,
    fecha_carga         DATETIME NOT NULL DEFAULT(UTC_TIMESTAMP()),

    CONSTRAINT FK_VersionUsuario FOREIGN KEY (id_usuario_carga)
        REFERENCES usuario(id_usuario) ON DELETE RESTRICT ON UPDATE RESTRICT,

    CONSTRAINT UQ_VersionNombre UNIQUE (fuente, nombre),
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE Categoria_Nutricional (
    id_categoria    SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_indicador    TINYINT UNSIGNED NOT NULL,
    etiqueta        VARCHAR(40) NOT NULL,
    nivel_riesgo    ENUM("normal", "atención", "riesgo") NOT NULL,
    z_min           DECIMAL(6, 3) NOT NULL,
    z_max           DECIMAL(6, 3) NOT NULL,

    CONSTRAINT FK_CategoriaIndicador FOREIGN KEY (id_indicador)
        REFERENCES indicador(id_indicador) ON DELETE RESTRICT ON UPDATE RESTRICT,

    CONSTRAINT UQ_CategoriaIndicadorEtiqueta UNIQUE(id_categoria, etiqueta),
    CONSTRAINT UQ_CategoriaIDIndicador UNIQUE(id_categoria, id_indicador),

    CONSTRAINT CHK_Categoria_RangoZ CHECK (
        z_min IS NULL OR z_max IS NULL OR z_min < z_max
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE Tabla_Referencia (
    id_referencia   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_version      SMALLINT UNSIGNED NOT NULL,
    id_indicador    TINYINT UNSIGNED NOT NULL,
    sexo            TINYINT UNSIGNED NOT NULL,
    valor_L         DECIMAL(12, 8) NOT NULL,
    valor_M         DECIMAL(12, 8) NOT NULL,
    valor_S         DECIMAL(12, 8) NOT NULL,
    variable_X      DECIMAL(6, 2) NOT NULL, 

    CONSTRAINT FK_ReferenciaVersion FOREIGN KEY (id_version)
        REFERENCES Version_Referencia(id_version) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT FK_ReferenciaIndicador FOREIGN KEY (id_indicador)
        REFERENCES indicador (id_indicador) ON DELETE RESTRICT ON UPDATE RESTRICT,

    CONSTRAINT UQ_ReferenciaClave UNIQUE(id_version, id_indicador, sexo, variable_X),

    CONSTRAINT CHK_ReferenciaSEXO CHECK (sexo IN (1, 2)),
    CONSTRAINT CHK_ReferenciaMS CHECK (valor_M > 0 AND valor_S > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- Expediente del Infante
-- =============================================================================
CREATE TABLE Tutor (
    id_tutor            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre              VARCHAR(100) NOT NULL,
    apellido_paterno    VARCHAR(100) NOT NULL,
    apellido_materno    VARCHAR(100) NULL,
    telefono            VARCHAR(15) NOT NULL,
    email               VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE Infante (
    id_infante          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_ebdi             SMALLINT UNSIGNED NOT NULL,
    matricula           INT UNSIGNED NOT NULL,
    curp                CHAR(18) NULL,
    nombre              VARCHAR (100) NOT NULL,
    apellido_paterno    VARCHAR(100) NOT NULL,
    apellido_materno    VARCHAR(100) NOT NULL,
    sexo                TINYINT UNSIGNED NOT NULL,
    fecha_nacimiento    DATE NOT NULL,
    fecha_ingreso       DATE NOT NULL,
    talla_madre_cm      DECIMAL(5, 2) NULL,
    talla_padre_cm      DECIMAL(5, 2) NULL,
    estatus             ENUM("activo", "baja", "egresado") DEFAULT "activo",

    CONSTRAINT FK_InfanteEBDI FOREIGN KEY (id_ebdi) 
        REFERENCES EBDI(id_ebdi) ON DELETE RESTRICT ON UPDATE RESTRICT,

    CONSTRAINT UQ_InfanteMatricula UNIQUE (matricula),
    CONSTRAINT UQ_InfanteCURP UNIQUE (curp),

    CONSTRAINT CHK_InfanteSexo CHECK (sexo IN (1, 2)),
    CONSTRAINT CHK_InfanteFechas CHECK (fecha_ingreso >= fecha_nacimiento),
    CONSTRAINT CHK_InfanteCURP CHECK (curp IS NULL OR curp REGEXP '^[A-Z0-9]{18}$'),
    CONSTRAINT CHK_InfanteTallaMadre CHECK (talla_madre_cm IS NULL OR talla_madre_cm > 0),
    CONSTRAINT CHK_InfanteTallaPadre CHECK (talla_padre_cm IS NULL OR talla_padre_cm > 0),

    INDEX IX_InfanteEBDIEstatus (id_ebdi, estatus)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE Infante_Tutor (
    id_infante       INT UNSIGNED NOT NULL,
    id_tutor         INT UNSIGNED NOT NULL,
    parentesco       ENUM("madre", "padre", "abuelo/abuela", "tutor", "otro") NOT NULL,
    tutor_principal BOOLEAN NOT NULL DEFAULT 0,
    id_infantePrincipal INT UNSIGNED
        GENERATED ALWAYS AS (IF(tutor_principal = 1, id_infante, NULL)) STORED,

    PRIMARY KEY (id_infante, id_tutor),

    CONSTRAINT FK_InfanteTutorInfante FOREIGN KEY (id_infante)
        REFERENCES Infante(id_infante) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT FK_InfanteTutorTutor FOREIGN KEY (id_tutor)
        REFERENCES Tutor(id_tutor) ON DELETE RESTRICT ON UPDATE RESTRICT,

    CONSTRAINT UQ_InfanteTutorPrincipal UNIQUE (id_infantePrincipal)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE Historial_Clinico (
    id_historial    BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_infante      INT UNSIGNED NOT NULL,
    id_ebdi         SMALLINT UNSIGNED NOT NULL,
    id_usuario      INT UNSIGNED NOT NULL,
    fecha           DATE NOT NULL,
    antecedente     TEXT NULL,
    diagnostico     VARCHAR(500) NULL,
    observaciones   TEXT,

    CONSTRAINT FK_HistorialInfante FOREIGN KEY (id_infante)
        REFERENCES Infante(id_infante) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT FK_HistorialEBDI FOREIGN KEY (id_ebdi)
        REFERENCES EBDI(id_ebdi) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT FK_HistorialUsuario FOREIGN KEY (id_usuario)
        REFERENCES Usuario(id_usuario) ON DELETE RESTRICT ON UPDATE RESTRICT,

    INDEX IX_HistorialInfanteFecha (id_infante, fecha)   
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE Movimiento_Infante (
    id_movimiento       INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_infante          INT UNSIGNED NOT NULL,
    id_usuario          INT UNSIGNED NOT NULL,
    tipo                ENUM("traslado", "baja") NOT NULL,
    id_ebdi_origen      SMALLINT UNSIGNED NOT NULL,
    id_ebdi_destino     SMALLINT UNSIGNED NOT NULL,
    fecha_movimiento    DATE NOT NULL,
    motivo              VARCHAR(255) NULL,

    CONSTRAINT FK_MovimientoInfante FOREIGN KEY (id_infante)
        REFERENCES Infante(id_infante) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT FK_MovimientoUsuario FOREIGN KEY (id_usuario)
        REFERENCES Usuario(id_usuario) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT FK_MovimientoOrigen FOREIGN KEY (id_ebdi_origen)
        REFERENCES EBDI(id_ebdi) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT FK_MovimientoDestino FOREIGN KEY (id_ebdi_destino)
        REFERENCES EBDI(id_ebdi) ON DELETE RESTRICT ON UPDATE RESTRICT,

    CONSTRAINT CHK_MovimientoTipo CHECK (
        (tipo = "traslado" AND id_ebdi_destino IS NOT NULL AND id_ebdi_destino <> id_ebdi_origen)
        OR (tipo = "baja" AND id_ebdi_destino IS NULL)
    ),

    INDEX IX_Movimiento_InfanteFecha (id_infante, fecha_movimiento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- Mediciones y Evaluaciones
-- =============================================================================
CREATE TABLE Medicion_Infante (
    id_medicion             BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_infante              INT UNSIGNED NOT NULL,
    id_ebdi                 SMALLINT UNSIGNED NOT NULL,
    id_usuario              INT UNSIGNED NOT NULL,
    fecha                   DATE NOT NULL,
    peso_kg                 DECIMAL(5, 2) NOT NULL,
    talla_cm               DECIMAL(5, 2) NOT NULL,
    perimetroCefelico_cm    DECIMAL(4, 1) NULL,
    observaciones           VARCHAR(500) NULL,

    CONSTRAINT FK_MedicionInfante FOREIGN KEY (id_infante) 
        REFERENCES Infante(id_infante) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT FK_MedicionEBDI FOREIGN KEY (id_ebdi)
        REFERENCES EBDI(id_ebdi) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT FK_MedicionUsuario FOREIGN KEY (id_usuario)
        REFERENCES Usuario(id_usuario) ON DELETE RESTRICT ON UPDATE RESTRICT,

    CONSTRAINT CHK_MedicionPeso CHECK (peso_kg > 0),
    CONSTRAINT CHK_MedicionTalla CHECK (talla_cm > 0),
    CONSTRAINT CHK_MedicionPerimetro CHECK (
        perimetroCefelico_cm IS NULL OR perimetroCefelico_cm > 0
    ),

    INDEX IX_Medicion_InfanteFecha (id_infante, fecha)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE Evaluacion_Nutricional (
    id_evaluacion   BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_medicion     BIGINT UNSIGNED NOT NULL,
    id_indicador    TINYINT UNSIGNED NOT NULL,
    id_referencia   INT UNSIGNED NOT NULL,
    id_categoria    SMALLINT UNSIGNED NOT NULL,
    z_score         DECIMAL(6, 3) NOT NULL,
    percentil       DECIMAL(5, 2) NULL,
    flag_biv        TINYINT NOT NULL DEFAULT 0,
    fecha_calculo   DATE NOT NULL DEFAULT (UTC_TIMESTAMP()),

    CONSTRAINT FK_EvaluacionMedicion FOREIGN KEY (id_medicion)
        REFERENCES Medicion_Infante(id_medicion) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT FK_EvaluacionReferencia FOREIGN KEY (id_referencia, id_indicador)
        REFERENCES Tabla_Referencia(id_referencia, id_indicador)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT FK_EvaluacionCategoria FOREIGN KEY (id_categoria, id_indicador)
        REFERENCES Categoria_Nutricional(id_categoria, id_indicador)
        ON DELETE RESTRICT ON UPDATE RESTRICT,

    CONSTRAINT UQ_Evaluacion_MedicionIndicador UNIQUE (id_medicion, id_indicador),

    CONSTRAINT CHK_EvaluacionBIV CHECK (flag_biv IN (-1, 0, 1)),
    CONSTRAINT CHK_EvaluacionPercentil CHECK (percentil BETWEEN 0 AND 100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;