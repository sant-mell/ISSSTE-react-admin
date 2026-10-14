-- DATOS INICIALES DE CATALOGOS
INSERT INTO Rol (rol, alcance_nacional) VALUES
    ('Administrador', 1),
    ('Coordinador regional', 0),
    ('Personal de estancia', 0);

INSERT INTO Region (nombre) VALUES
    ('Norte'),
    ('Sur'),
    ('Este'),
    ('Oeste');

INSERT INTO Estado (id_region, nombre) VALUES
    (4, 'Aguascalientes'),
    (1, 'Baja California'),
    (1, 'Baja California Sur'),
    (2, 'Campeche'),
    (2, 'Chiapas'),
    (1, 'Chihuahua'),
    (3, 'Ciudad de México'),
    (1, 'Coahuila'),
    (4, 'Colima'),
    (1, 'Durango'),
    (3, 'Estado de México'),
    (4, 'Guanajuato'),
    (2, 'Guerrero'),
    (3, 'Hidalgo'),
    (4, 'Jalisco'),
    (4, 'Michoacán'),
    (3, 'Morelos'),
    (4, 'Nayarit'),
    (1, 'Nuevo León'),
    (2, 'Oaxaca'),
    (3, 'Puebla'),
    (3, 'Querétaro'),
    (2, 'Quintana Roo'),
    (1, 'San Luis Potosí'),
    (1, 'Sinaloa'),
    (1, 'Sonora'),
    (2, 'Tabasco'),
    (1, 'Tamaulipas'),
    (3, 'Tlaxcala'),
    (3, 'Veracruz'),
    (2, 'Yucatán'),
    (1, 'Zacatecas');

INSERT INTO EBDI (id_estado, numero, nombre, municipio, tipo_ebdi) VALUES
    (7, '002', 'EBDI No. 2', 'BENITO JUÁREZ', 'Propias');