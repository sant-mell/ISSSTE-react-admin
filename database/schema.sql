-- 

CREATE TABLE Rol (
    id_rol  TINYINT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
    rol     VARCHAR(50) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE Region (
    id_region   TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre      VARCHAR(50) NOT NULL,

    UNIQUE (nombre),
) ENGINE=InnoDB;

CREATE TABLE Categoria_Nutricional (
    id_categoria    SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    indicador       ENUM("altura/edad", "peso/edad", "circunferencia/edad", "peso/altura") NOT NULL,
    etiqueta        VARCHAR(40) NOT NULL,
    nivel_riesgo    ENUM("normal", "atención", "riesgo") NOT NULL,
    z_min           DECIMAL(6, 3) NOT NULL,
    z_max           DECIMAL(6, 3) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE Tutor (
    id_tutor            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre              VARCHAR(100) NOT NULL,
    apellido_paterno    VARCHAR(100) NOT NULL,
    apellido_materno    VARCHAR(100) NULL,
    telefono            VARCHAR(15) NOT NULL,
    email               VARCHAR(255) NOT NULL,
    talla_cm            DECIMAL(5, 2) NOT NULL,
    matricula           INT UNSIGNED NOT NULL
) ENGINE=InnoDB;

CREATE TABLE Estado (
    id_estado   TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_region   TINYINT UNSIGNED NOT NULL,
    nombre      VARCHAR(50) UNIQUE KEY NOT NULL,

    CONSTRAINT fk_estado_region
        FOREIGN KEY (id_region) REFERENCES Region(id_region) 
        ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE Usuario (
    id_usuario          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_rol              TINYINT UNSIGNED  NOT NULL,
    email               VARCHAR(255) NOT NULL,
    nombre              VARCHAR(150) NOT NULL,
    contrasena_hash     VARCHAR(255) NOT NULL, 
    activo              BOOLEAN DEFAULT 1,
    intento_fallidos    TINYINT UNSIGNED DEFAULT 0,

    CONSTRAINT fk_usuario_rol
        FOREIGN KEY (id_rol) REFERENCES Rol(id_rol)
        ON DELETE CASCADE,

    UNIQUE (email)
) ENGINE=InnoDB;

CREATE TABLE EBDI (
    id_ebdi     SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_estado   TINYINT UNSIGNED NOT NULL,
    numero      VARCHAR(10) NOT NULL,
    nombre      VARCHAR(150) NOT NULL,
    municipio   VARCHAR(150) NOT NULL,
    tipo_ebdi   ENUM("Propias", "Contratadas", "OSC") NOT NULL,
    activo      BOOLEAN DEFAULT 1,

    CONSTRAINT fk_EBDI_estado
        FOREIGN KEY (id_estado) REFERENCES Estado(id_estado)
        ON DELETE CASCADE,

    UNIQUE (numero)
) ENGINE=InnoDB;