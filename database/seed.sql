--  LOGIN PERSONAL ISSSTE  (contraseña de todos:    !)
--    admin@issste.gob.mx            Administrador · alcance nacional
--    coord.este@issste.gob.mx       Coordinador · región Este
--    coord.norte@issste.gob.mx      Coordinador · región Norte
--    coord.cdmx@issste.gob.mx       Coordinador · estado Ciudad de México
--    estancia.002@issste.gob.mx     Personal · EBDI No. 2
--    estancia.multi@issste.gob.mx   Personal · EBDI No. 2 y No. 8
--    inactivo@issste.gob.mx         → debe responder 403 (cuenta inactiva)
--    bloqueado@issste.gob.mx        → debe responder 403 (5 intentos fallidos)
--
--  LOGIN MADRE / PADRE / TUTOR  (matrícula + CURP + apellidos del infante)
--    100001 · HERM230214HDFRZTA1 · Hernández Ruiz
--    100004 · RAXC231130MDFMXMA4 · Ramírez (sin apellido materno)
--    100006 · JIPR230509MASMRGA6 · Jiménez Pérez
--    (todos los CURP son ficticios; los demás están en la sección de Infante)
-- =============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE Evaluacion_Nutricional;
TRUNCATE TABLE Tabla_Referencia;
TRUNCATE TABLE Categoria_Nutricional;
TRUNCATE TABLE Indicador;
TRUNCATE TABLE Version_Referencia;
TRUNCATE TABLE Movimiento_Infante;
TRUNCATE TABLE Medicion_Infante;
TRUNCATE TABLE Historial_Clinico;
TRUNCATE TABLE Infante_Tutor;
TRUNCATE TABLE Tutor;
TRUNCATE TABLE Infante;
TRUNCATE TABLE Usuario_Alcance;
TRUNCATE TABLE Usuario;
TRUNCATE TABLE EBDI;
TRUNCATE TABLE Estado;
TRUNCATE TABLE Region;
TRUNCATE TABLE Rol;
SET FOREIGN_KEY_CHECKS = 1;

-- =============================================================================
-- DATOS INICIALES DE CATALOGOS
-- =============================================================================
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

-- =============================================================================
-- EBDI · 206 estancias del catálogo EstanciasInfantiles.xls (orden por número → '002' = id 1)
-- =============================================================================
INSERT INTO EBDI (id_estado, numero, nombre, municipio, tipo_ebdi) VALUES
    (7, '002', 'EBDI No. 2', 'BENITO JUÁREZ', 'Propias'),
    (7, '003', 'EBDI No. 3', 'CUAUHTÉMOC', 'Propias'),
    (7, '006', 'EBDI No. 6', 'IZTACALCO', 'Propias'),
    (7, '007', 'EBDI No. 7', 'VENUSTIANO CARRANZA', 'Propias'),
    (7, '008', 'EBDI No. 8', 'BENITO JUÁREZ', 'Propias'),
    (13, '009', 'EBDI No. 9', 'ACAPULCO DE JUÁREZ', 'Propias'),
    (7, '010', 'EBDI No. 10', 'CUAUHTÉMOC', 'Propias'),
    (7, '011', 'EBDI No. 11', 'CUAUHTÉMOC', 'Propias'),
    (7, '012', 'EBDI No. 12', 'CUAUHTÉMOC', 'Propias'),
    (12, '013', 'EBDI No. 13', 'GUANAJUATO', 'Propias'),
    (7, '014', 'EBDI No. 14', 'TLALPAN', 'Propias'),
    (7, '015', 'EBDI No. 15', 'GUSTAVO A. MADERO', 'Propias'),
    (7, '016', 'EBDI No. 16', 'MIGUEL HIDALGO', 'Propias'),
    (15, '017', 'EBDI No. 17', 'GUADALAJARA', 'Propias'),
    (19, '018', 'EBDI No. 18', 'MONTERREY', 'Propias'),
    (19, '019', 'EBDI No. 19', 'MONTERREY', 'Propias'),
    (1, '021', 'EBDI No. 21', 'AGUASCALIENTES', 'Propias'),
    (20, '022', 'EBDI No. 22', 'OAXACA', 'Propias'),
    (32, '023', 'EBDI No. 23', 'GUADALUPE', 'Propias'),
    (7, '024', 'EBDI No. 24', 'TLALPAN', 'Propias'),
    (7, '025', 'EBDI No. 25', 'GUSTAVO A. MADERO', 'Propias'),
    (7, '026', 'EBDI No. 26', 'COYOACÁN', 'Propias'),
    (7, '027', 'EBDI No. 27', 'MIGUEL HIDALGO', 'Propias'),
    (17, '028', 'EBDI No. 28', 'CUERNAVACA', 'Propias'),
    (15, '030', 'EBDI No. 30', 'GUADALAJARA', 'Propias'),
    (29, '031', 'EBDI No. 31', 'TLAXCALA', 'Propias'),
    (25, '033', 'EBDI No. 33', 'CULIACÁN', 'Propias'),
    (2, '034', 'EBDI No. 34', 'MEXICALI', 'Propias'),
    (10, '035', 'EBDI No. 35', 'DURANGO', 'Propias'),
    (24, '036', 'EBDI No. 36', 'SAN LUIS POTOSÍ', 'Propias'),
    (5, '037', 'EBDI No. 37', 'TUXTLA GUTIÉRREZ', 'Propias'),
    (31, '038', 'EBDI No. 38', 'MÉRIDA', 'Propias'),
    (7, '040', 'EBDI No. 40', 'BENITO JUÁREZ', 'Propias'),
    (7, '041', 'EBDI No. 41', 'MIGUEL HIDALGO', 'Propias'),
    (7, '042', 'EBDI No. 42', 'CUAUHTÉMOC', 'Propias'),
    (7, '043', 'EBDI No. 43', 'VENUSTIANO CARRANZA', 'Propias'),
    (7, '044', 'EBDI No. 44', 'BENITO JUÁREZ', 'Propias'),
    (7, '045', 'EBDI No. 45', 'VENUSTIANO CARRANZA', 'Propias'),
    (7, '046', 'EBDI No. 46', 'MIGUEL HIDALGO', 'Propias'),
    (7, '047', 'EBDI No. 47', 'BENITO JUÁREZ', 'Propias'),
    (7, '048', 'EBDI No. 48', 'CUAUHTÉMOC', 'Propias'),
    (7, '050', 'EBDI No. 50', 'CUAUHTÉMOC', 'Propias'),
    (7, '054', 'EBDI No. 54', 'GUSTAVO A. MADERO', 'Propias'),
    (7, '055', 'EBDI No. 55', 'MIGUEL HIDALGO', 'Propias'),
    (17, '057', 'EBDI No. 57', 'CUERNAVACA', 'Propias'),
    (2, '059', 'EBDI No. 59', 'MEXICALI', 'Propias'),
    (2, '060', 'EBDI No. 60', 'ENSENADA', 'Propias'),
    (3, '061', 'EBDI No. 61', 'LA PAZ', 'Propias'),
    (8, '063', 'EBDI No. 63', 'MONCLOVA', 'Propias'),
    (6, '064', 'EBDI No. 64', 'CHIHUAHUA', 'Propias'),
    (12, '065', 'EBDI No. 65', 'CELAYA', 'Propias'),
    (20, '066', 'EBDI No. 66', 'OAXACA', 'Propias'),
    (21, '067', 'EBDI No. 67', 'PUEBLA', 'Propias'),
    (26, '068', 'EBDI No. 68', 'HERMOSILLO', 'Propias'),
    (22, '069', 'EBDI No. 69', 'QUERÉTARO', 'Propias'),
    (18, '070', 'EBDI No. 70', 'TEPIC', 'Propias'),
    (28, '071', 'EBDI No. 71', 'CIUDAD VICTORIA', 'Propias'),
    (18, '072', 'EBDI No. 72', 'TEPIC', 'Propias'),
    (30, '073', 'EBDI No. 73', 'BOCA DEL RÍO', 'Propias'),
    (30, '074', 'EBDI No. 74', 'XALAPA', 'Propias'),
    (14, '075', 'EBDI No. 75', 'PACHUCA', 'Propias'),
    (14, '076', 'EBDI No. 76', 'PACHUCA', 'Propias'),
    (14, '077', 'EBDI No. 77', 'HUICHAPAN', 'Propias'),
    (26, '078', 'EBDI No. 78', 'CAJEME', 'Propias'),
    (26, '079', 'EBDI No. 79', 'NOGALES', 'Propias'),
    (9, '080', 'EBDI No. 80', 'COLIMA', 'Propias'),
    (10, '081', 'EBDI No. 81', 'DURANGO', 'Propias'),
    (25, '082', 'EBDI No. 82', 'MAZATLÁN', 'Propias'),
    (7, '083', 'EBDI No. 83', 'IZTAPALAPA', 'Propias'),
    (22, '084', 'EBDI No. 84', 'QUERÉTARO', 'Propias'),
    (12, '085', 'EBDI No. 85', 'DOLORES HIDALGO', 'Propias'),
    (31, '086', 'EBDI No. 86', 'MÉRIDA', 'Propias'),
    (20, '088', 'EBDI No. 88', 'SAN JUAN BAUTISTA TUXTEPEC', 'Propias'),
    (26, '089', 'EBDI No. 89', 'GUAYMAS', 'Propias'),
    (25, '090', 'EBDI No. 90', 'LOS MOCHIS', 'Propias'),
    (23, '091', 'EBDI No. 91', 'OTHÓN P. BLANCO', 'Propias'),
    (1, '092', 'EBDI No. 92', 'AGUASCALIENTES', 'Propias'),
    (20, '093', 'EBDI No. 93', 'HUAJUAPAN DE LEÓN', 'Propias'),
    (28, '094', 'EBDI No. 94', 'REYNOSA', 'Propias'),
    (7, '095', 'EBDI No. 95', 'CUAUHTÉMOC', 'Propias'),
    (7, '096', 'EBDI No. 96', 'BENITO JUÁREZ', 'Propias'),
    (7, '097', 'EBDI No. 97', 'BENITO JUÁREZ', 'Propias'),
    (7, '098', 'EBDI No. 98', 'COYOACÁN', 'Propias'),
    (15, '099', 'EBDI No. 99', 'GUADALAJARA', 'Propias'),
    (4, '100', 'EBDI No. 100', 'CAMPECHE', 'Propias'),
    (7, '101', 'EBDI No. 101', 'IZTAPALAPA', 'Propias'),
    (1, '102', 'EBDI No. 102', 'AGUASCALIENTES', 'Propias'),
    (16, '104', 'EBDI No. 104', 'MORELIA', 'Propias'),
    (2, '105', 'EBDI No. 105', 'TIJUANA', 'Propias'),
    (13, '106', 'EBDI No. 106', 'CHILPANCINGO', 'Propias'),
    (7, '107', 'EBDI No. 107', 'TLALPAN', 'Propias'),
    (10, '109', 'EBDI No. 109', 'GÓMEZ PALACIO', 'Propias'),
    (3, '110', 'EBDI No. 110', 'LA PAZ', 'Propias'),
    (12, '112', 'EBDI No. 112', 'LEÓN', 'Propias'),
    (27, '113', 'EBDI No. 113', 'VILLAHERMOSA', 'Propias'),
    (16, '115', 'EBDI No. 115', 'LÁZARO CÁRDENAS', 'Propias'),
    (26, '120', 'EBDI No. 120', 'HERMOSILLO', 'Propias'),
    (8, '121', 'EBDI No. 121', 'TORREÓN', 'Propias'),
    (9, '122', 'EBDI No. 122', 'MANZANILLO', 'Propias'),
    (11, '125', 'EBDI No. 125', 'CIUDAD NEZAHUALCÓYOTL', 'Propias'),
    (12, '129', 'EBDI No. 129', 'IRAPUATO', 'Propias'),
    (26, '131', 'EBDI No. 131', 'NAVOJOA', 'Propias'),
    (17, '132', 'EBDI No. 132', 'CUAUTLA', 'Propias'),
    (32, '134', 'EBDI No. 134', 'FRESNILLO', 'Propias'),
    (7, '135', 'EBDI No. 135', 'MAGDALENA CONTRERAS', 'Propias'),
    (7, '136', 'EBDI No. 136', 'COYOACÁN', 'Propias'),
    (11, '141', 'EBDI No. 141', 'CIUDAD NEZAHUALCÓYOTL', 'Propias'),
    (25, '149', 'EBDI No. 149', 'CULIACÁN', 'Propias'),
    (7, '151', 'EBDI No. 151', 'CUAUHTÉMOC', 'Propias'),
    (7, '153', 'EBDI No. 153', 'COYOACÁN', 'Propias'),
    (7, '154', 'EBDI No. 154', 'XOCHIMILCO', 'Propias'),
    (7, '155', 'EBDI No. 155', 'MIGUEL HIDALGO', 'Propias'),
    (7, '156', 'EBDI No. 156', 'MIGUEL HIDALGO', 'Propias'),
    (7, '157', 'EBDI No. 157', 'BENITO JUÁREZ', 'Propias'),
    (21, '184', 'EBDI No. 184', 'TEHUACÁN', 'Propias'),
    (5, '205', 'COLEGIO MARÍA MONTESSORI', 'COMITÁN DE DOMÍNGUEZ', 'Contratadas'),
    (26, '214', 'CENTRO DE DESARROLLO INFANTIL PICASSO', 'HERMOSILLO', 'Contratadas'),
    (30, '223', 'ASOCIACIÓN PEDAGÓGICA DE XALAPA LOS AÑOS', 'XALAPA', 'Contratadas'),
    (13, '243', 'LOS AÑOS MARAVILLOSOS', 'CHILPANCINGO', 'Contratadas'),
    (5, '264', 'CENTRO DE DESARROLLO INFANTIL EL MUNDO DE', 'SAN CRISTÓBAL DE LAS CASAS', 'Contratadas'),
    (14, '271', 'CLUB INFANTIL MI CASITA', 'PACHUCA', 'Contratadas'),
    (22, '273', 'CENDI CHIQUITINES', 'SAN JUAN DEL RÍO', 'Contratadas'),
    (15, '280', 'JARDIN DE NIÑOS OCOTLAN', 'OCOTLÁN', 'Contratadas'),
    (26, '289', 'ESTANCIA INFANTIL JUGANDO', 'HERMOSILLO', 'Contratadas'),
    (25, '338', 'COLEGIO PEDAGOGICO KIDZONE l', 'GUASAVE', 'Contratadas'),
    (5, '343', 'DESARROLLO DE LA EDUCACIÓN EN COMITAN', 'COMITÁN DE DOMÍNGUEZ', 'Contratadas'),
    (5, '376', 'INSTITUTO BILINGUE ARNOL GESELL', 'PALENQUE', 'Contratadas'),
    (24, '378', 'ESTANCIA Y JARDIN DE NIÑOS PULGARCITO', 'CIUDAD VALLES', 'Contratadas'),
    (17, '384', 'PEQUEÑOS ANGELITOS', 'ZACATEPEC', 'Contratadas'),
    (17, '385', 'ZAMNÁ', 'TEMIXCO', 'Contratadas'),
    (22, '389', 'CENDI QUETZALLI', 'TEQUISQUIAPAN', 'Contratadas'),
    (20, '400', 'GRUPO SAILE', 'ETLA', 'Contratadas'),
    (1, '404', 'CENTRO DE PSICOPEDAGOGÍA INFANTIL', 'PABELLÓN DE ARTEAGA', 'Contratadas'),
    (25, '407', 'PROYECTO DE EDUCACIÓN INTEGRAL l', 'NAVOLATO', 'Contratadas'),
    (24, '418', 'CENTRO DE DESARROLLO INFANTIL MUNDO FELIZ S.C.', 'MATEHUALA', 'Contratadas'),
    (19, '419', 'MI MUNDO MÁGICO', 'MONTERREY', 'Contratadas'),
    (16, '454', 'JORENGUARINI A.C.', 'MORELIA', 'Contratadas'),
    (11, '456', 'LA CASITA DEL SABER l', 'SAN MATEO OXTOTITLÁN', 'Contratadas'),
    (17, '464', 'TERESA TREJO TOLEDO', 'MAZATEPEC', 'Contratadas'),
    (4, '465', 'COLEGIO PARTICULAR KELLER', 'CIUDAD DEL CARMEN', 'Contratadas'),
    (1, '470', 'COLMENARES II', 'AGUASCALIENTES', 'Contratadas'),
    (25, '475', 'PROYECTO DE EDUCACIÓN INTEGRAL ll', 'CULIACÁN', 'Contratadas'),
    (1, '479', 'CENTRO DE DESARROLLO INFANTIL CASIB', 'AGUASCALIENTES', 'Contratadas'),
    (11, '483', 'LA CASITA DEL SABER ll', 'METEPEC', 'Contratadas'),
    (8, '492', 'LICEO ANNA FREUD', 'PIEDRAS NEGRAS', 'Contratadas'),
    (9, '509', 'INSTITUTO CAMBRIDGE DE COLIMA', 'COLIMA', 'Contratadas'),
    (6, '512', 'INSTITUTO PARAMERICANO TRILINGUE', 'CHIHUAHUA', 'Contratadas'),
    (23, '515', 'CENTRO DE DESARROLLO INFANTIL ADAMS', 'BENITO JUÁREZ', 'Contratadas'),
    (3, '516', 'OSITO MANDARIN III', 'LA PAZ', 'Contratadas'),
    (14, '520', 'COLEGIO REAL MOTOLINIA', 'PACHUCA', 'Contratadas'),
    (17, '523', 'W. BEECHER', 'CUERNAVACA', 'Contratadas'),
    (5, '535', 'GRUPO CUHE SANTA FE', 'TUXTLA GUTIÉRREZ', 'Contratadas'),
    (17, '541', 'COLEGIO LAYAN', 'CUERNAVACA', 'Contratadas'),
    (22, '544', 'KIDSTAR', 'QUERÉTARO', 'Contratadas'),
    (24, '546', 'JARDÍN DE NIÑOS PULGARCITO', 'CIUDAD VALLES', 'Contratadas'),
    (24, '547', 'COLEGIO MARÍA MONTESORI', 'RÍO VERDE', 'Contratadas'),
    (1, '548', 'EL MARAVILLOSO MUNDO DE LOS NIÑOS', 'RINCÓN DE ROMOS', 'Contratadas'),
    (20, '550', 'COLEGIO SWETIA', 'SANTA ROSA TANZACOLA', 'Contratadas'),
    (17, '552', 'CENTRO EDUCATIVO ROMA', 'TEMIXCO', 'Contratadas'),
    (18, '557', 'INSTITUTO BILINGUE LEV VIGOTSKY', 'TEPIC', 'Contratadas'),
    (13, '559', 'COLEGIO SAN RAFAEL', 'IGUALA', 'Contratadas'),
    (19, '566', 'INSTITUTO SANTA LUCIA', 'GUADALUPE', 'Contratadas'),
    (1, '568', 'DIF MARÍA DEL ROSARIO LUÉVANO MARTÍNEZ', 'RINCÓN DE ROMOS', 'Contratadas'),
    (1, '569', 'CENTRO DE ATENCIÓN INFANTIL DECROLY', 'AGUASCALIENTES', 'Contratadas'),
    (16, '573', 'LA CASA DEL NIÑO', 'ZAMORA', 'Contratadas'),
    (22, '579', 'MONTERO', 'JALPAN DE SERRA', 'Contratadas'),
    (17, '580', 'CENTRO EDUCATIVO CESAR COLL', 'JIUTEPEC', 'Contratadas'),
    (5, '581', 'CENTRO EDUCATIVO ACTIVO AMERICA', 'TUXTLA GUTIÉRREZ', 'Contratadas'),
    (23, '582', 'COLEGIO ASHANAO', 'CHETUMAL', 'Contratadas'),
    (8, '583', 'COLEGIO ENRIQUE REBSAMEN', 'SALTILLO', 'Contratadas'),
    (16, '590', 'ESTANCIA INFANTIL MAIN', 'URUAPAN', 'Contratadas'),
    (22, '591', 'SISTEMA EDUCATIVO DE MÉXICO', 'SAN JUAN DEL RÍO', 'Contratadas'),
    (27, '596', 'COLEGIO MARTHIN LUTHER KING', 'CÁRDENAS', 'Contratadas'),
    (25, '597', 'COLEGIO PEDAGÓGICO KIDZONE ll', 'SALVADOR ALVARADO', 'Contratadas'),
    (20, '598', 'JARDÍN DE NIÑOS HANSEL Y GRETEL', 'SALINA CRUZ', 'Contratadas'),
    (5, '599', 'COLEGIO ANTHAR', 'TAPACHULA', 'Contratadas'),
    (8, '600', 'INSTITUTO STANFORD SABINAS', 'SABINAS', 'Contratadas'),
    (15, '603', 'EL PEQUEÑO MUNDO CHAPALITA', 'ZAPOPAN', 'Contratadas'),
    (15, '604', 'ALFRED NOBEL', 'PUERTO VALLARTA', 'Contratadas'),
    (5, '607', 'CENTRO EDUCATIVO SOR JUANA INÉS DE LA CRUZ', 'VILLAFLORES', 'Contratadas'),
    (1, '608', 'CENTRO DE PSICOPEDAGOGÍA INFANTIL', 'AGUASCALIENTES', 'Contratadas'),
    (1, '609', 'CENTRO DE DESARROLLO INFANTIL GARABATILLOS', 'AGUASCALIENTES', 'Contratadas'),
    (15, '616', 'ROSAURA ZAPATA CASTRO', 'TLAJOMULCO DE ZÚÑIGA', 'Contratadas'),
    (15, '617', 'PAULO FREIRE', 'LAGOS DE MORENO', 'Contratadas'),
    (15, '618', 'ANGELITOS APRENDIENDO A.C.', 'TEPATITLÁN DE MORELOS', 'Contratadas'),
    (1, '619', 'CENDI JUGANDO', 'AGUASCALIENTES', 'Contratadas'),
    (1, '620', 'CENDI GIRASOL', 'AGUASCALIENTES', 'Contratadas'),
    (12, '621', 'PEQUEÑOS EXPLORADORES', 'LEÓN', 'Contratadas'),
    (20, '622', 'INSTITUTO ARNOLD GESELL', 'SANTA MARÍA COLOTEPEC', 'Contratadas'),
    (14, '623', 'KIDSTOPIA', 'MINERAL DE LA REFORMA', 'Contratadas'),
    (2, '624', 'COLEGIO MI PEQUEÑO MUNDO', 'ENSENADA', 'Contratadas'),
    (30, '626', 'JARDIN DE NIÑOS AMERICAS', 'CÓRDOBA', 'Contratadas'),
    (30, '627', 'BEJAMIN BLOOM', 'ORIZABA', 'Contratadas'),
    (8, '629', 'LICEO CARL R. ROGERS', 'ARTEAGA', 'Contratadas'),
    (29, '630', 'CENTRO DE DESARROLLO INFANTIL TELPOCHKALLI A.', 'YAUHQUEMEHCAN', 'Contratadas'),
    (17, '631', 'PEQUEÑOS ANGELITOS', 'YAUTEPEC', 'Contratadas'),
    (28, '632', 'INSTITUTO PANAMERICANO DE TAMPICO', 'TAMPICO', 'Contratadas'),
    (28, '634', 'AMERICA ESPANOLA CARACOLES LOMA', 'VICTORIA', 'Contratadas'),
    (28, '635', 'INSTITUTO HOREB', 'REYNOSA', 'Contratadas'),
    (8, '636', 'INSTITUTO STANFORD ACUNA', 'COAHUILA', 'Contratadas'),
    (8, '637', 'INSTITUTO ISAAC NEWTON', 'COAHUILA', 'Contratadas'),
    (8, '638', 'TALENTOS', 'COAHUILA', 'Contratadas'),
    (8, '639', 'INSTITUTO EDUCATIVO FUTUROS GENIOS', 'COAHUILA', 'Contratadas'),
    (9, '640', 'INSTITUTO EDUCATIVO TAMAITI DE COLIMA', 'COLIMA', 'Contratadas'),
    (9, '641', 'CENTRO DE ATENCION Y ESTIMULACION TEMPRANA', 'COLIMA', 'Contratadas'),
    (20, '642', 'NA JUANITA POZO S.C.', 'JUCHITÁN DE ZARAGOZA', 'Contratadas');

-- =============================================================================
-- USUARIOS DE PRUEBA · contraseña argon2id de: Prueba123!
-- =============================================================================
INSERT INTO Usuario (id_rol, email, nombre, contrasena_hash, activo, intentos_fallidos) VALUES
    ((SELECT id_rol FROM Rol WHERE rol = 'Administrador'), 'admin@issste.gob.mx', 'Administrador Nacional', '$argon2id$v=19$m=65536,p=4,t=3$8mgPtUw/TpZUn7HcQwZhxg$a3EHfO5cGw/wjNvVLtA0RvUqE+Y6qGM7PR5UnUyXzSI', 1, 0),
    ((SELECT id_rol FROM Rol WHERE rol = 'Coordinador regional'), 'coord.este@issste.gob.mx', 'Coordinación Región Este', '$argon2id$v=19$m=65536,p=4,t=3$5Lb8gZK5EoqopI/L9X4QgA$NnbanrJznOSlsYlmAN/KlK1xI7upjaIbVUdpoo9RG6Y', 1, 0),
    ((SELECT id_rol FROM Rol WHERE rol = 'Coordinador regional'), 'coord.norte@issste.gob.mx', 'Coordinación Región Norte', '$argon2id$v=19$m=65536,p=4,t=3$i8o8zep6TJKRdBgP4Un2wg$A5WBDzoYBJj18e0k94nL7Z6hXYWs2pp3x534sGgum5k', 1, 0),
    ((SELECT id_rol FROM Rol WHERE rol = 'Coordinador regional'), 'coord.cdmx@issste.gob.mx', 'Coordinación Ciudad de México', '$argon2id$v=19$m=65536,p=4,t=3$s7jK6En+DuQL0t2nuABNHA$OnktmNoxNI9Hk525FIRF1uwGHD2Naj8P6w5cqRWg0sc', 1, 0),
    ((SELECT id_rol FROM Rol WHERE rol = 'Personal de estancia'), 'estancia.002@issste.gob.mx', 'Personal EBDI No. 2', '$argon2id$v=19$m=65536,p=4,t=3$Ye9FSfWVvn9bBpIAbp9HNw$eHAAGt9lJ4oCrASB/4o+S3vHOuK/4v+Fu5AwObPyAHQ', 1, 0),
    ((SELECT id_rol FROM Rol WHERE rol = 'Personal de estancia'), 'estancia.multi@issste.gob.mx', 'Personal EBDI No. 2 y No. 8', '$argon2id$v=19$m=65536,p=4,t=3$aEYRudWAmF8LlNYN2jISmQ$7uUIPiSLgHtDhc55G2jDMuiaiu8hm1qGaNU8qZsf7Kw', 1, 0),
    ((SELECT id_rol FROM Rol WHERE rol = 'Personal de estancia'), 'inactivo@issste.gob.mx', 'Usuario Inactivo (prueba 403)', '$argon2id$v=19$m=65536,p=4,t=3$c2wxlOxo7grCU/EiUmF1og$CtQxG98CTegQilhB5Pt0gkYcFyUOdy8gQw6x+GgHk2Y', 0, 0),
    ((SELECT id_rol FROM Rol WHERE rol = 'Personal de estancia'), 'bloqueado@issste.gob.mx', 'Usuario Bloqueado (prueba 403)', '$argon2id$v=19$m=65536,p=4,t=3$2DqmrEiVXU0ELPueAbX9zg$VpQUxoggvqVFNIaw6rbQO0rmsZiEqdqkFjVi4EwZihE', 1, 5);

-- Alcance de cada usuario (región, estado o EBDI)
INSERT INTO Usuario_Alcance (id_usuario, id_region, id_estado, id_ebdi) VALUES
    ((SELECT id_usuario FROM Usuario WHERE email = 'coord.este@issste.gob.mx'), (SELECT id_region FROM Region WHERE nombre = 'Este'), NULL, NULL),
    ((SELECT id_usuario FROM Usuario WHERE email = 'coord.norte@issste.gob.mx'), (SELECT id_region FROM Region WHERE nombre = 'Norte'), NULL, NULL),
    ((SELECT id_usuario FROM Usuario WHERE email = 'coord.cdmx@issste.gob.mx'), NULL, (SELECT id_estado FROM Estado WHERE nombre = 'Ciudad de México'), NULL),
    ((SELECT id_usuario FROM Usuario WHERE email = 'estancia.002@issste.gob.mx'), NULL, NULL, (SELECT id_ebdi FROM EBDI WHERE numero = '002')),
    ((SELECT id_usuario FROM Usuario WHERE email = 'estancia.multi@issste.gob.mx'), NULL, NULL, (SELECT id_ebdi FROM EBDI WHERE numero = '002')),
    ((SELECT id_usuario FROM Usuario WHERE email = 'estancia.multi@issste.gob.mx'), NULL, NULL, (SELECT id_ebdi FROM EBDI WHERE numero = '008')),
    ((SELECT id_usuario FROM Usuario WHERE email = 'inactivo@issste.gob.mx'), NULL, NULL, (SELECT id_ebdi FROM EBDI WHERE numero = '002')),
    ((SELECT id_usuario FROM Usuario WHERE email = 'bloqueado@issste.gob.mx'), NULL, NULL, (SELECT id_ebdi FROM EBDI WHERE numero = '002'));

-- =============================================================================
-- REFERENCIA DE CRECIMIENTO · indicadores, categorías (cortes OMS en z-score) y versión
-- =============================================================================
INSERT INTO Indicador (codigo, nombre, tipo_x) VALUES
    ('wa', 'Peso para la edad', 'edad'),
    ('ha', 'Talla para la edad', 'edad'),
    ('wh', 'Peso para la talla', 'talla'),
    ('bmi', 'IMC para la edad', 'edad');

-- Convención de rangos: z_min <= z < z_max (NULL = sin límite)
INSERT INTO Categoria_Nutricional (id_indicador, etiqueta, nivel_riesgo, z_min, z_max) VALUES
    ((SELECT id_indicador FROM Indicador WHERE codigo = 'wa'), 'Peso bajo severo', 'riesgo', NULL, -3),
    ((SELECT id_indicador FROM Indicador WHERE codigo = 'wa'), 'Peso bajo', 'atención', -3, -2),
    ((SELECT id_indicador FROM Indicador WHERE codigo = 'wa'), 'Peso normal', 'normal', -2, 2),
    ((SELECT id_indicador FROM Indicador WHERE codigo = 'wa'), 'Peso alto', 'atención', 2, NULL),
    ((SELECT id_indicador FROM Indicador WHERE codigo = 'ha'), 'Talla baja severa', 'riesgo', NULL, -3),
    ((SELECT id_indicador FROM Indicador WHERE codigo = 'ha'), 'Talla baja', 'atención', -3, -2),
    ((SELECT id_indicador FROM Indicador WHERE codigo = 'ha'), 'Talla normal', 'normal', -2, 3),
    ((SELECT id_indicador FROM Indicador WHERE codigo = 'ha'), 'Talla alta', 'atención', 3, NULL),
    ((SELECT id_indicador FROM Indicador WHERE codigo = 'wh'), 'Desnutrición severa', 'riesgo', NULL, -3),
    ((SELECT id_indicador FROM Indicador WHERE codigo = 'wh'), 'Desnutrición moderada', 'atención', -3, -2),
    ((SELECT id_indicador FROM Indicador WHERE codigo = 'wh'), 'Normal', 'normal', -2, 1),
    ((SELECT id_indicador FROM Indicador WHERE codigo = 'wh'), 'Riesgo de sobrepeso', 'atención', 1, 2),
    ((SELECT id_indicador FROM Indicador WHERE codigo = 'wh'), 'Sobrepeso', 'atención', 2, 3),
    ((SELECT id_indicador FROM Indicador WHERE codigo = 'wh'), 'Obesidad', 'riesgo', 3, NULL),
    ((SELECT id_indicador FROM Indicador WHERE codigo = 'bmi'), 'Desnutrición severa', 'riesgo', NULL, -3),
    ((SELECT id_indicador FROM Indicador WHERE codigo = 'bmi'), 'Desnutrición moderada', 'atención', -3, -2),
    ((SELECT id_indicador FROM Indicador WHERE codigo = 'bmi'), 'Normal', 'normal', -2, 1),
    ((SELECT id_indicador FROM Indicador WHERE codigo = 'bmi'), 'Riesgo de sobrepeso', 'atención', 1, 2),
    ((SELECT id_indicador FROM Indicador WHERE codigo = 'bmi'), 'Sobrepeso', 'atención', 2, 3),
    ((SELECT id_indicador FROM Indicador WHERE codigo = 'bmi'), 'Obesidad', 'riesgo', 3, NULL);

INSERT INTO Version_Referencia (fuente, nombre, vigente, id_usuario_carga) VALUES
    ('OMS', 'OMS 2006-2007', 1, (SELECT id_usuario FROM Usuario WHERE email = 'admin@issste.gob.mx')),
    ('CDC', 'CDC 2000', 0, (SELECT id_usuario FROM Usuario WHERE email = 'admin@issste.gob.mx'));

-- =============================================================================
-- EXPEDIENTE DEL INFANTE · datos ficticios; nombre, apellidos, CURP, teléfono y email van cifrados (AES-256-GCM)
-- =============================================================================
-- Tutores (id_tutor 1..13 en este orden)
INSERT INTO Tutor (id_tutor, nombre, apellido_paterno, apellido_materno, telefono, email) VALUES
    (1, X'64e5841826af4ab79ff7bd4e73af2de2e569e2cc5745a761b3a4c6ade2e7bb4093', X'745582ffabe7507b8168956feed924e9f4ed2bdcf20600d0eaa716f45b16b648', X'57f690012e47e74892aaeaa6bcb78d164ac356f3317dd94425432491f6142b68d075', X'9ac788139bc65edff283d5cd05e716b76f05f6a6564cec4b60257674e4b54fa9fb578188eb66', X'1eab7c6ff291cffe25c62017635603a2e5370c03e92317af0c851542a89b5566bfb85adcaa0c54328660004b4f6e9e46803f'),  -- Laura Ruiz Pineda
    (2, X'53f5810aa3d83c0361714b315325a448958d2595a38ce4fdec954c76e55961daf7', X'bde040c91e3bd4b0eff37214d6f208c2439fbe793aea643f91cbccce2671724d1abba8f568ca', X'2313f8cb1f6b737e4f4dcaba1470729cfa190176fb4f46fa310349eb357711671b', X'd4de2a2fff8008e83d764493e9a72083a8318ac23124dc9698efedca5c8c111c836c4789f54a', X'47e9b593f576a75d5d7a5c941bfcd0cd5a4756443eda12422173e9c6ac94b8880b549f1746b2bf2c024d810133c179de0e2b624d680076'),  -- Jorge Hernández Salas
    (3, X'56edb42817266fbc195b2fab7db6532250f45c241aa91afcb368e5a278ebf34b1a83d48d', X'b2f902f7d63dbd792a039fa14f511c6673874805c102c68d66ec1ef0ee6f69da', X'08282064512647ec630ab714f7c02ed92f469146d3e68149dee633a407ac0947', X'79bda694c4a898f2495f50160b284dd544f0fb93c0e4d50b585c433b40e2e00e0a5afeb73a4d', X'e55973cc51f6365fd4dfea601d927dd2b3cffe5dbe336b1189788e2f9fa1df1be369fb85b607ccd8585b3e66935d70e528ea1e6fcd'),  -- Patricia Vega Luna
    (4, X'a1ccac3e82db6ad4662bd3a0f1b8509f621c6030fb21e7d1ff61891f2d9cfced9cee', X'1450eecfccb8cd75ca17f4028697950996523ab7bbccf963aac704e3c9679e0a23e6', X'285dbbe5d74a285dc3bb87d072f327eee4b8b8e6b33e26d659af1c4261aa8790bdad', X'76ac6093d5d70af23b73844619cb8dddfc8380ad0ecef54bbbd4cfddb6faf5dba279f69c2e7e', X'a6b3f30189f3c7b7278d65b602c27481934b7ade36511f839846ceb25197b5f79315b52dfa4e9347e78deb3d9bc70b466aecdb3a20'),  -- Andrea Ortega Mejía
    (5, X'dabdc0c7364d6ac19aece8f96fcb8938f95fc25cbcda3c017060d5fca7ca6176b5a306', X'ed9968dea9f2f8da5656466675152ffce21f5ebddb0c77ec7955527a2b7f7296041a', X'312f91e87cfa15ba1a2b818071394a6d0057d1c44b6e8aa16ba2408a9b3583b7c44489', X'ec754f7d552c9164da9a0c0f05b22d37ca91e0e3593fbe2403cd3ccb36830ff3d0a5bcc083a3', X'db195717842decd4205a00cbf7dafa35e80cc749b8a12f6af3ac951ef87fa8c2a0651d9f227a6b17d097d9a16035c462f7f836a1a901'),  -- Ricardo Flores Navarro
    (6, X'01bec0746c148cbbfb92ac4fa3ae047b5aa9920f853e4b4f9c77087936c3d6357f16', X'f0c0e9c8fd2d37bfbeaea46a88e38c6e42dfddc5ef4df5c5a1954dfe1ccec9345e7f', X'ca43bf9c6a858b52b75a513f5d422537320260f474ec7bdba3590509212de11473e3', X'7a3bcd13a61bd490dc8b47bee78d95095ab46f11c738252daa2bf30f2865165f626483327e11', X'3ac96c81e70326eb01bda6d8c7d3f77925988d7f8437af83cc37a234eb52de1f5f5d82fab076302ab6510d52ccfe5deed64323'),  -- Sofía Pérez Alonso
    (7, X'078ccb8c0c8fe5fafe1302c619ecbe0a617993450ff4b763bbc1e8cfdb4b7a9bba98', X'9fa53d0cc3646844e1bfbaa9d5173bf941779fffc29b3abb50c81a84efeb632d027c76', X'3678e4644d917c12add4c1865df4f2379187ee75d20e655784cf9f18bb4685db9fcb', X'3f5d26a467c29a92e3eb31d22e86c3ecbc8565506d24f431edca120503f4fca219f02acbff8a', X'9342cf710a305fea6f4364590e84b15dca731173cf9ac3865e6359e203af058f66a672c352a701563033586a1fac22bb5269cbe9ae06'),  -- Marcos Navarro Rangel
    (8, X'6ef94f2afcc9f3598f7a5acf034de5709937d542e403a8eacc851dd55cc2fbc69416842a', X'd07b7109e98abe6615bb43e0fcd5acbe7cb31f91c3de7f95e540a0fc80cfa2d872', X'103ba540adc69dc58e102fd757474c2ec2afc095b797d68327cd1416a73454762336', X'1ec1bb621de63922af00a903f06ba086a84ec54d723e6773d2056e509863e320e274d483f662', X'f85ab8edc1ef4e56051ebf3c34b03eff2d1fd40cfc5bdf6ce4fff0238e519f1bf7252432999f66142023f12a0123ef118c44da916636'),  -- Gabriela Garza Montes
    (9, X'ffe7985c315a54026d7a58bbf1d4f536cf8b1554a876e1fc2dd8a0bfcfdb59dd764951', X'a85555163a14f2a9aad990d23288fdd6ddcd6c0059e2f1dca3490f73c4bd607a9570', X'760883ad2047c0342442ed313ad74df97429c1f240f59f4606275a895d3a1f46', X'55c1b3bd314d0b3f5a30f99f6bf0587bd88af6c1d70a87648b7a21276664a04c83ad5370940a', X'd258b9e4c724eaa282870f89fb07882ab536c644ed178679fe7bacba66e545ab407fc0be8569e3e9793bfd77eec0aa77e05b8077'),  -- Héctor Cantú Lara
    (10, X'9f3f35c23a78ce9525df185b85744c3597bb4ff80c3115ebea7821c3ff9179a493b6', X'8d35041a65c26533479e6e26f9be4b6abed48528c214eec7f4ebcead5a462d5e', X'606fb6b879625da0540e06ccd15feaed5e6fd700a5cfe6ed7744e88fd138f91197885cf0', X'5c9b7328892239fae3823eb1be2df84a07327f34b856c6e1dca886a149ebf214f81f8b2055d0', X'86f53be6acd0c17a75a52aad02d10cc2ff02346ac04b3dd43d2f9374663731117661c6f7c37bfbcba9187412550c158e0280'),  -- Lucía Cruz Ibáñez
    (11, X'e645c8be5b1ea0aa40b0cccd93f0e1c430f9ed57e82029f0b8f185c486a3e41514c37691d4', X'd7b835603e3dea5688b6ffc6df4e0762d2ae278ac7f524f1dcf01a85cf5d95972e', X'075f1cbd539a53918dfc46270680ce0e1120cdae3b2f159704622dd184f2ece437c860', X'461b41474a454a6d40dd18d51cfeb34a41a583ca52e5f30839cf00bb6e0ad75aeee961c82496', X'5858fc18ad39e0ba72ca6f75380defd7fbaff3c07ac7670fc80a490aa5f6e2b204711211dbeca1b1a06c19a61dff6168cceccde10cfb9a'),  -- Alejandro Rojas Fuentes
    (12, X'a528ed9dae75040fc7775350fcc5760f14fbe7435b40a92f880e97c0c23b33dfe81dbc', X'11f53fabc7c037ce637d70974f1e920a9d5070f6bb6ce93e3611646b45fb09196df84f', X'0bb1735dbf11b3064ea0b757dfb45b333893808b0c9e29ceda86ef4e87c09b0a751fcf', X'19e6b88609c59051cf90759ff3f9f886a97e63caeef2d86133253be941952a77d31005855147', X'fea5d8c441acbb6e9ebdf58b6fcb26caacd9b7c474b74acbf0cf52b3039432bd33c37b75ad7e5ffed3b5ddcac1cde0ae05d6fd965914'),  -- Mónica Aguilar Pacheco
    (13, X'3d81f85496817176078d1569f857658711c2a436bd915b91ee642d248efc5743fd', X'cbd19749e22a46bdcd839f254dbb0cc4c789c335642f77d953c2a1b0a178b8e71078', X'c7f176a3c339da2d2bb24797d0f83f8f83febea41d83b73e45593224f6c9a849a4ca', X'472abe77b40574f29e5bce524adc011e666bd2b9bf74d5d952055cd1a73c2cc99df5e746e0f2', X'3b6bbc4aa97764f02d250d3095862fa63a3f0b60618ad34e9d83325ffb039f5e4b9078037e77de902df526da40170df5f883df');  -- Karla Solís Duarte

-- Infantes
INSERT INTO Infante (id_ebdi, matricula, curp, curp_hash, nombre, apellido_paterno, apellido_materno, sexo, fecha_nacimiento, fecha_ingreso, talla_madre_cm, talla_padre_cm, estatus) VALUES
    ((SELECT id_ebdi FROM EBDI WHERE numero = '002'), 100001, X'194769816ab792ae4574ce0eb3c5c4c2708d11337b14c9f375b115aecbbb69955d235eda916799287ae1fd45e032', '2b9c4942d68f7c96d93b7fadeea4dc20a84cdd10356dc822a1ff5c288d849982', X'5719f0b3da200320f037178f5d60d083925de783ab8f8d87683dcb79be08aac429', X'f5474a7c96e991ab7051e51ac173d96cb45208225f67b30272cbdea9e44b9808595f38d3dc26', X'f636b7e75ce61f1b0541ff97e62bd775de8abc5a7f6ba44b453e1c57ef34f9b4', 1, '2023-02-14', '2024-08-19', 162.0, 175.5, 'activo'),  -- Mateo Hernández Ruiz · CURP HERM230214HDFRZTA1
    ((SELECT id_ebdi FROM EBDI WHERE numero = '002'), 100002, X'c2327d94d4b71739ec48826c3f748977a46d079427474ee85c85e846cf1671b752c2f546be36163e67ca6724bd05', 'f9f1149134052fb009377f2acbb37bafe5698bad40693f2995f7961d9238b371', X'bcd615df8f538e142de6f99c11ec6ef1c7ab01c4bf45e18c0fe9b3198ad908928488bea020', X'f5474a7c96e991ab7051e51ac173d96cb45208225f67b30272cbdea9e44b9808595f38d3dc26', X'f636b7e75ce61f1b0541ff97e62bd775de8abc5a7f6ba44b453e1c57ef34f9b4', 2, '2024-06-03', '2025-01-13', 162.0, 175.5, 'activo'),  -- Valentina Hernández Ruiz · CURP HERV240603MDFRZLA2
    ((SELECT id_ebdi FROM EBDI WHERE numero = '002'), 100003, X'a60c8fb1495abe1aa93d76a35146617874f4ee8dba113f23836877dc31b5e3448f665f095e11f1742894da26e315', '8f0f073de093856ce661d1bd1745b568c332051c3113301ac69c08efd5793020', X'959d59cb7783fbaac06d782cfa56fa897487f4c3d62009450a238bba55897ac2e86d89e0', X'd2d31f4a4c6a044762ae64afb130a16f4e03a425fdbc0c5d8446ed82e8d2db298af8', X'fe238ab4bf1a1390a387860e788cac6074d8d41e2b60882b486a5c454321efe1', 1, '2020-07-10', '2021-08-23', 158.5, 171.0, 'egresado'),  -- Emiliano Torres Vega · CURP TOVE200710HDFRGMA3
    ((SELECT id_ebdi FROM EBDI WHERE numero = '008'), 100004, X'7fd673ddf6d1e36ce42a88725f24a637247fdef3f6d440808c56edca680c134a0b4402c212676ded74b24a8ad397', '4f1f0ef9fdb8c1c34d33cb422ada758bc333dee3a61b197ebdfd6d9b6661b148', X'945f645bef46d04f06ff8a97592bb61b13ca141b8393196f1a2bd98cf144d89e7088', X'f31432ec646377847fb9eee79bc6f203d0a5c5fe255c9b000b16999345b758d16b0dbb35', NULL, 2, '2023-11-30', '2025-02-03', 165.0, NULL, 'activo'),  -- Camila Ramírez (sin materno) · CURP RAXC231130MDFMXMA4
    ((SELECT id_ebdi FROM EBDI WHERE numero = '008'), 100005, X'7df6e3a4f0776d890aef8a432fe9d5e20392ca10af90366962991cfdb1160a6fdf04356e41b37c60857376e889d4', '700e9a624ab81e4c4f571a9b37a3bdecf268b366142a4bfda6181f9b928485b2', X'7ada1762986b462f1569fcb5ca868c639d61415141d3b7eca82495b796ea416a44', X'e8b4e56712c8e61c5162acc3b4b174390a29ad1b236199dc7c9deabebef4beae131d', X'6244584fbf7d2dbb7fbcd5c9ed295323d8e7a5816162804e0d5ba4c571495f87ef4e4917', 1, '2022-04-18', '2023-01-09', 160.0, 178.0, 'activo'),  -- Diego Flores Castillo · CURP FOCD220418HMCLSGA5
    ((SELECT id_ebdi FROM EBDI WHERE numero = '021'), 100006, X'73b1b16ec50c2161dfc1dea0b927fd9a61492d4cd1921c5d689914ab0eac5e8468c2076e0ae6484be35d19badc7a', 'ac58f499d584db6c7ee1ad514d71a76772036fe32a6071127e601b08384ab213', X'72b70a4115673554489d348ed3a6d668d6c30883ab10bf7f214c83baeab5087b751f', X'8f1289d00221a70b932c836597b1a5ccf8b43d223632c5b42decb83cca024a3cd574e30d', X'63c12afa963c2a6db4b4c902e1cf5b0effff6c88d912934b44235e281615f92660f9', 2, '2023-05-09', '2024-03-04', 157.0, 168.0, 'activo'),  -- Regina Jiménez Pérez · CURP JIPR230509MASMRGA6
    ((SELECT id_ebdi FROM EBDI WHERE numero = '021'), 100007, X'a10f6c6d31c427b69bc2639e0fbddd2fe33c8893ecdd73c1fe999ba9d26067177cff27123708c3e4825b4dd5845e', '06dcbfa328564cca948991d5076fb573304405d39966f0db154d063abf9847a0', X'4cec334d7eb8f7524e9dc4cbae44cfdb438da1fb12336d4b5e455e17cd3e25c14f8f01e3', X'f879dc24626f7ad9e53040323ee4dbc9ce928dfc1ff317561ea2c238bbdccc09696070', X'5254d87719c449307f65d4675b1382932a471263d1655de855ab0569d46b0764fd', 1, '2024-01-25', '2025-02-17', 163.0, 172.0, 'activo'),  -- Leonardo Navarro Díaz · CURP NADL240125HASVZNA7
    ((SELECT id_ebdi FROM EBDI WHERE numero = '018'), 100008, X'34bc7200ea74c3af62faab3c1e291c29705b81b99656159bb7fdbca4b19db088e2adaedc326045c5e43b3a6f8605', '7800c073595f857051a3e0f27e4cf96d3f2dcd739d2646f21d5211806b2191aa', X'f12ec9020ff76667426da3798de890f5b89f7c0841c37d3bb5523e77d4d20a95a174', X'9b1da02c0bfcf5f9368a1289f10aa2f27a9084d555e571101538b0fabf1674b5bf43e45e', X'ba0b220e08d80dd3dd99cedf702d10740f2b5f242671e55953e803ac6e297602d9', 2, '2022-12-12', '2024-01-08', 166.0, 180.0, 'activo'),  -- Ximena Treviño Garza · CURP TEGX221212MNLRRMA8
    ((SELECT id_ebdi FROM EBDI WHERE numero = '018'), 100009, X'994f92aafd1c161a5790e3c26308e86741fe6a138ede2401bb56bcbe417eef4a3ea1e0c2203759dc4df6ba06dc10', '0d9d54660e0082227ecdb1ad5c7b6cda9f24c0bae09d94e30a43355347bd2d61', X'c79355c92a2c986484dd54ac7240d001b2594cdd2b380ecb44207a8101b1a26c88fdcc72964d', X'7670a207770355409157e2e6bb90752b1f928fd822fb403b2173f7bfc9fee365346a', X'46d0b22270115bc66d8c5b9e8540dbd660da41e0dc7d5a0bdc0d0d82db204c307d0a6e', 1, '2023-08-07', '2024-09-02', 161.0, 174.0, 'activo'),  -- Sebastián Cantú Salinas · CURP CASS230807HNLNLBA9
    ((SELECT id_ebdi FROM EBDI WHERE numero = '074'), 100010, X'9eceb477069d8bb658190175f9c68c8b6939936e655dd6258538e5f3d113dd932806cbaadf60d9086a7aad0504a3', '0ad60c92ef11ad128e23851ca66e650e33cc7c17dd573b1cb55062beb7b181fd', X'd18d355afac11554b0323048aed436ea934e252ad5b1030052a68458fb9cfb7b3c1f3cb0', X'c933462ff4922b217eec19cb36c71c1301e1fe9e739b5d093f9f5138995d7b735f9fe69687b3', X'4aab1ce9e5126aeca394211dce49a1674b3eb62d9607aca67810fed4a7bb5e04', 2, '2023-03-22', '2024-04-15', 159.0, 170.0, 'activo'),  -- Fernanda Domínguez Cruz · CURP DOCF230322MVZMRRA0
    ((SELECT id_ebdi FROM EBDI WHERE numero = '104'), 100011, X'9023e61ba0150779bc508a826f6b0bd694eb894692a65e29d98da1d303fa99861230cdb2b8276b75cc7fa978e2b3', '545d2517a7a54bda0f20768ae8a01a0cf68dd8b74c8e63d3716e6e9460278924', X'948f99372de2833f736ccf6776fe18d2d60226c71ec22573c87caa3f00840ba4', X'8b9d65e1d80d7c8f0e535902e9ca8a9f84a5b47e9944ae28f152892b78d4f94d39f2f2', X'ec8f626624f76490ed4f82d41afea9ec4d88573e816a788b762cd5f4a0936c228a', 1, '2024-04-02', '2025-05-12', 164.0, 176.0, 'activo'),  -- Iker Mendoza Rojas · CURP MERI240402HMNNJKA1
    ((SELECT id_ebdi FROM EBDI WHERE numero = '002'), 100012, X'6efd15d16b9b413928e92ab901c23ad370b386b6940a7f1496cddccd64c04120a438febf038f801de4bf12269f82', '41b6f548a01a18b07a0f87c60e0b22955bd3c79fb1e4a9b047a65026d5e1299b', X'4054d92212063e0eda38f4913b6b94f59f2f0d02efe25f3ac367c72aa4a2dc18f338', X'baef9d2e1ecc0b66cf09aa6ce553254146ba35f99e7710792293921fcf20b8e807fe4aef', X'0b5f2b9c127c74759add7d38a29957dce893d64d1deff74855528d0871b6861d24bcc6', 2, '2023-10-15', '2025-03-10', 160.5, 173.0, 'activo'),  -- Renata Vázquez Aguilar · CURP VAAR231015MDFZGNA2
    ((SELECT id_ebdi FROM EBDI WHERE numero = '008'), 100013, X'c138e19801fa8732089d6b851e4e24298b0bd02f8e19afcd1bbe9bf4f9198078b76512ed87a66887bb1c2c5bcc2f', '8e9562cbaf91d7bc084971f396ace2404dc3096db82a51bc7694fffc36077c96', X'303991c95bd09404ac3788a5e367786ef074f337ef3e3ef73adc793ea4657c3b18', X'bbaa4a22e0a6f8104750d9e2acdb8f54fd4ddf56f07a347d7b3cab144efe11d80893', X'3b0f36bc55565211b748934a4151c120c9735e3e610cf163352c9ea9d7cf2fe645b3', 1, '2022-02-28', '2023-01-16', 162.0, 177.0, 'baja');  -- Dante Ibarra Solís · CURP IASD220228HDFBLNA3

-- Relación infante ↔ tutor (hermanos 100001 y 100002 comparten madre; 100001 tiene 2 tutores)
INSERT INTO Infante_Tutor (id_infante, id_tutor, parentesco, tutor_principal) VALUES
    ((SELECT id_infante FROM Infante WHERE matricula = 100001), 1, 'madre', 1),
    ((SELECT id_infante FROM Infante WHERE matricula = 100001), 2, 'padre', 0),
    ((SELECT id_infante FROM Infante WHERE matricula = 100002), 1, 'madre', 1),
    ((SELECT id_infante FROM Infante WHERE matricula = 100003), 3, 'abuelo/abuela', 1),
    ((SELECT id_infante FROM Infante WHERE matricula = 100004), 4, 'madre', 1),
    ((SELECT id_infante FROM Infante WHERE matricula = 100005), 5, 'padre', 1),
    ((SELECT id_infante FROM Infante WHERE matricula = 100006), 6, 'madre', 1),
    ((SELECT id_infante FROM Infante WHERE matricula = 100007), 7, 'padre', 1),
    ((SELECT id_infante FROM Infante WHERE matricula = 100008), 8, 'madre', 1),
    ((SELECT id_infante FROM Infante WHERE matricula = 100009), 9, 'padre', 1),
    ((SELECT id_infante FROM Infante WHERE matricula = 100010), 10, 'madre', 1),
    ((SELECT id_infante FROM Infante WHERE matricula = 100011), 11, 'padre', 1),
    ((SELECT id_infante FROM Infante WHERE matricula = 100012), 12, 'madre', 1),
    ((SELECT id_infante FROM Infante WHERE matricula = 100013), 13, 'madre', 1);

-- Historial clínico
INSERT INTO Historial_Clinico (id_infante, id_ebdi, id_usuario, fecha, antecedente, diagnostico, observaciones) VALUES
    ((SELECT id_infante FROM Infante WHERE matricula = 100001), (SELECT id_ebdi FROM EBDI WHERE numero = '002'), (SELECT id_usuario FROM Usuario WHERE email = 'estancia.002@issste.gob.mx'), '2026-02-03', 'Esquema de vacunación completo', 'Niño sano', 'Control de rutina sin hallazgos'),
    ((SELECT id_infante FROM Infante WHERE matricula = 100002), (SELECT id_ebdi FROM EBDI WHERE numero = '002'), (SELECT id_usuario FROM Usuario WHERE email = 'estancia.002@issste.gob.mx'), '2026-03-10', NULL, 'Rinofaringitis leve', 'Reposo e hidratación; se reincorpora en 3 días'),
    ((SELECT id_infante FROM Infante WHERE matricula = 100004), (SELECT id_ebdi FROM EBDI WHERE numero = '008'), (SELECT id_usuario FROM Usuario WHERE email = 'estancia.multi@issste.gob.mx'), '2026-05-18', 'Antecedente de bajo peso al nacer', 'Seguimiento de crecimiento', 'Se recomienda revisión nutricional mensual'),
    ((SELECT id_infante FROM Infante WHERE matricula = 100005), (SELECT id_ebdi FROM EBDI WHERE numero = '008'), (SELECT id_usuario FROM Usuario WHERE email = 'estancia.multi@issste.gob.mx'), '2026-06-22', NULL, 'Bajo peso para la talla', 'Referido a nutrición; plan de alimentación en estancia'),
    ((SELECT id_infante FROM Infante WHERE matricula = 100012), (SELECT id_ebdi FROM EBDI WHERE numero = '002'), (SELECT id_usuario FROM Usuario WHERE email = 'estancia.002@issste.gob.mx'), '2026-03-04', 'Traslado desde EBDI No. 26', 'Niña sana', 'Expediente recibido y revisado');

-- Movimientos: un traslado (026 → 002) y una baja
INSERT INTO Movimiento_Infante (id_infante, id_usuario, tipo, id_ebdi_origen, id_ebdi_destino, fecha_movimiento, motivo) VALUES
    ((SELECT id_infante FROM Infante WHERE matricula = 100012), (SELECT id_usuario FROM Usuario WHERE email = 'admin@issste.gob.mx'), 'traslado', (SELECT id_ebdi FROM EBDI WHERE numero = '026'), (SELECT id_ebdi FROM EBDI WHERE numero = '002'), '2026-03-02', 'Cambio de domicilio de la familia'),
    ((SELECT id_infante FROM Infante WHERE matricula = 100013), (SELECT id_usuario FROM Usuario WHERE email = 'estancia.multi@issste.gob.mx'), 'baja', (SELECT id_ebdi FROM EBDI WHERE numero = '008'), NULL, '2025-03-03', 'Baja voluntaria por mudanza fuera de la ciudad');

-- =============================================================================
-- MEDICIONES · valores aproximados a la mediana OMS con variación por niño (algunos bajo peso / sobrepeso a propósito)
-- =============================================================================
INSERT INTO Medicion_Infante (id_infante, id_ebdi, id_usuario, fecha, peso_kg, talla_cm, perimetro_cefalico_cm, observaciones) VALUES
    ((SELECT id_infante FROM Infante WHERE matricula = 100001), (SELECT id_ebdi FROM EBDI WHERE numero = '002'), (SELECT id_usuario FROM Usuario WHERE email = 'estancia.002@issste.gob.mx'), '2026-01-20', 14.17, 95.5, 53.0, 'Primera medición del año'),
    ((SELECT id_infante FROM Infante WHERE matricula = 100001), (SELECT id_ebdi FROM EBDI WHERE numero = '002'), (SELECT id_usuario FROM Usuario WHERE email = 'estancia.002@issste.gob.mx'), '2026-04-21', 14.82, 97.5, NULL, NULL),
    ((SELECT id_infante FROM Infante WHERE matricula = 100001), (SELECT id_ebdi FROM EBDI WHERE numero = '002'), (SELECT id_usuario FROM Usuario WHERE email = 'estancia.002@issste.gob.mx'), '2026-07-14', 15.44, 99.3, NULL, NULL),
    ((SELECT id_infante FROM Infante WHERE matricula = 100002), (SELECT id_ebdi FROM EBDI WHERE numero = '002'), (SELECT id_usuario FROM Usuario WHERE email = 'estancia.002@issste.gob.mx'), '2026-01-20', 9.27, 80.4, 49.9, 'Primera medición del año'),
    ((SELECT id_infante FROM Infante WHERE matricula = 100002), (SELECT id_ebdi FROM EBDI WHERE numero = '002'), (SELECT id_usuario FROM Usuario WHERE email = 'estancia.002@issste.gob.mx'), '2026-04-21', 9.95, 82.8, NULL, NULL),
    ((SELECT id_infante FROM Infante WHERE matricula = 100002), (SELECT id_ebdi FROM EBDI WHERE numero = '002'), (SELECT id_usuario FROM Usuario WHERE email = 'estancia.002@issste.gob.mx'), '2026-07-14', 10.57, 85.1, NULL, NULL),
    ((SELECT id_infante FROM Infante WHERE matricula = 100003), (SELECT id_ebdi FROM EBDI WHERE numero = '002'), (SELECT id_usuario FROM Usuario WHERE email = 'estancia.002@issste.gob.mx'), '2025-02-11', 18.35, 107.3, 57.0, 'Primera medición del año'),
    ((SELECT id_infante FROM Infante WHERE matricula = 100003), (SELECT id_ebdi FROM EBDI WHERE numero = '002'), (SELECT id_usuario FROM Usuario WHERE email = 'estancia.002@issste.gob.mx'), '2025-06-10', 19.23, 109.5, NULL, NULL),
    ((SELECT id_infante FROM Infante WHERE matricula = 100003), (SELECT id_ebdi FROM EBDI WHERE numero = '002'), (SELECT id_usuario FROM Usuario WHERE email = 'estancia.002@issste.gob.mx'), '2025-10-14', 20.21, 111.6, NULL, NULL),
    ((SELECT id_infante FROM Infante WHERE matricula = 100004), (SELECT id_ebdi FROM EBDI WHERE numero = '008'), (SELECT id_usuario FROM Usuario WHERE email = 'estancia.multi@issste.gob.mx'), '2026-01-20', 15.15, 88.0, 51.1, 'Primera medición del año'),
    ((SELECT id_infante FROM Infante WHERE matricula = 100004), (SELECT id_ebdi FROM EBDI WHERE numero = '008'), (SELECT id_usuario FROM Usuario WHERE email = 'estancia.multi@issste.gob.mx'), '2026-04-21', 16.08, 90.5, NULL, NULL),
    ((SELECT id_infante FROM Infante WHERE matricula = 100004), (SELECT id_ebdi FROM EBDI WHERE numero = '008'), (SELECT id_usuario FROM Usuario WHERE email = 'estancia.multi@issste.gob.mx'), '2026-07-14', 16.97, 92.7, NULL, NULL),
    ((SELECT id_infante FROM Infante WHERE matricula = 100005), (SELECT id_ebdi FROM EBDI WHERE numero = '008'), (SELECT id_usuario FROM Usuario WHERE email = 'estancia.multi@issste.gob.mx'), '2026-01-20', 12.96, 97.6, 55.0, 'Primera medición del año'),
    ((SELECT id_infante FROM Infante WHERE matricula = 100005), (SELECT id_ebdi FROM EBDI WHERE numero = '008'), (SELECT id_usuario FROM Usuario WHERE email = 'estancia.multi@issste.gob.mx'), '2026-04-21', 13.51, 99.2, NULL, NULL),
    ((SELECT id_infante FROM Infante WHERE matricula = 100005), (SELECT id_ebdi FROM EBDI WHERE numero = '008'), (SELECT id_usuario FROM Usuario WHERE email = 'estancia.multi@issste.gob.mx'), '2026-07-14', 14.03, 100.7, NULL, NULL),
    ((SELECT id_infante FROM Infante WHERE matricula = 100006), (SELECT id_ebdi FROM EBDI WHERE numero = '021'), (SELECT id_usuario FROM Usuario WHERE email = 'admin@issste.gob.mx'), '2026-01-20', 13.17, 92.4, 52.5, 'Primera medición del año'),
    ((SELECT id_infante FROM Infante WHERE matricula = 100006), (SELECT id_ebdi FROM EBDI WHERE numero = '021'), (SELECT id_usuario FROM Usuario WHERE email = 'admin@issste.gob.mx'), '2026-04-21', 13.92, 94.7, NULL, NULL),
    ((SELECT id_infante FROM Infante WHERE matricula = 100006), (SELECT id_ebdi FROM EBDI WHERE numero = '021'), (SELECT id_usuario FROM Usuario WHERE email = 'admin@issste.gob.mx'), '2026-07-14', 14.58, 96.5, NULL, NULL),
    ((SELECT id_infante FROM Infante WHERE matricula = 100007), (SELECT id_ebdi FROM EBDI WHERE numero = '021'), (SELECT id_usuario FROM Usuario WHERE email = 'admin@issste.gob.mx'), '2026-01-20', 13.38, 88.7, 50.8, 'Primera medición del año'),
    ((SELECT id_infante FROM Infante WHERE matricula = 100007), (SELECT id_ebdi FROM EBDI WHERE numero = '021'), (SELECT id_usuario FROM Usuario WHERE email = 'admin@issste.gob.mx'), '2026-04-21', 14.14, 91.2, NULL, NULL),
    ((SELECT id_infante FROM Infante WHERE matricula = 100007), (SELECT id_ebdi FROM EBDI WHERE numero = '021'), (SELECT id_usuario FROM Usuario WHERE email = 'admin@issste.gob.mx'), '2026-07-14', 14.85, 93.4, NULL, NULL),
    ((SELECT id_infante FROM Infante WHERE matricula = 100008), (SELECT id_ebdi FROM EBDI WHERE numero = '018'), (SELECT id_usuario FROM Usuario WHERE email = 'admin@issste.gob.mx'), '2026-01-20', 14.13, 98.8, 53.5, 'Primera medición del año'),
    ((SELECT id_infante FROM Infante WHERE matricula = 100008), (SELECT id_ebdi FROM EBDI WHERE numero = '018'), (SELECT id_usuario FROM Usuario WHERE email = 'admin@issste.gob.mx'), '2026-04-21', 14.83, 100.8, NULL, NULL),
    ((SELECT id_infante FROM Infante WHERE matricula = 100008), (SELECT id_ebdi FROM EBDI WHERE numero = '018'), (SELECT id_usuario FROM Usuario WHERE email = 'admin@issste.gob.mx'), '2026-07-14', 15.5, 102.6, NULL, NULL),
    ((SELECT id_infante FROM Infante WHERE matricula = 100009), (SELECT id_ebdi FROM EBDI WHERE numero = '018'), (SELECT id_usuario FROM Usuario WHERE email = 'admin@issste.gob.mx'), '2026-01-20', 12.14, 90.5, 51.9, 'Primera medición del año'),
    ((SELECT id_infante FROM Infante WHERE matricula = 100009), (SELECT id_ebdi FROM EBDI WHERE numero = '018'), (SELECT id_usuario FROM Usuario WHERE email = 'admin@issste.gob.mx'), '2026-04-21', 12.74, 92.7, NULL, NULL),
    ((SELECT id_infante FROM Infante WHERE matricula = 100009), (SELECT id_ebdi FROM EBDI WHERE numero = '018'), (SELECT id_usuario FROM Usuario WHERE email = 'admin@issste.gob.mx'), '2026-07-14', 13.3, 94.6, NULL, NULL),
    ((SELECT id_infante FROM Infante WHERE matricula = 100010), (SELECT id_ebdi FROM EBDI WHERE numero = '074'), (SELECT id_usuario FROM Usuario WHERE email = 'admin@issste.gob.mx'), '2026-01-20', 13.49, 93.6, 52.8, 'Primera medición del año'),
    ((SELECT id_infante FROM Infante WHERE matricula = 100010), (SELECT id_ebdi FROM EBDI WHERE numero = '074'), (SELECT id_usuario FROM Usuario WHERE email = 'admin@issste.gob.mx'), '2026-04-21', 14.22, 95.7, NULL, NULL),
    ((SELECT id_infante FROM Infante WHERE matricula = 100010), (SELECT id_ebdi FROM EBDI WHERE numero = '074'), (SELECT id_usuario FROM Usuario WHERE email = 'admin@issste.gob.mx'), '2026-07-14', 14.88, 97.5, NULL, NULL),
    ((SELECT id_infante FROM Infante WHERE matricula = 100011), (SELECT id_ebdi FROM EBDI WHERE numero = '104'), (SELECT id_usuario FROM Usuario WHERE email = 'admin@issste.gob.mx'), '2026-01-20', 11.68, 85.2, 50.3, 'Primera medición del año'),
    ((SELECT id_infante FROM Infante WHERE matricula = 100011), (SELECT id_ebdi FROM EBDI WHERE numero = '104'), (SELECT id_usuario FROM Usuario WHERE email = 'admin@issste.gob.mx'), '2026-04-21', 12.44, 87.6, NULL, NULL),
    ((SELECT id_infante FROM Infante WHERE matricula = 100011), (SELECT id_ebdi FROM EBDI WHERE numero = '104'), (SELECT id_usuario FROM Usuario WHERE email = 'admin@issste.gob.mx'), '2026-07-14', 13.08, 89.8, NULL, NULL),
    ((SELECT id_infante FROM Infante WHERE matricula = 100012), (SELECT id_ebdi FROM EBDI WHERE numero = '026'), (SELECT id_usuario FROM Usuario WHERE email = 'admin@issste.gob.mx'), '2026-01-20', 12.13, 88.3, 51.4, 'Primera medición del año'),
    ((SELECT id_infante FROM Infante WHERE matricula = 100012), (SELECT id_ebdi FROM EBDI WHERE numero = '002'), (SELECT id_usuario FROM Usuario WHERE email = 'estancia.002@issste.gob.mx'), '2026-04-21', 12.87, 90.8, NULL, NULL),
    ((SELECT id_infante FROM Infante WHERE matricula = 100012), (SELECT id_ebdi FROM EBDI WHERE numero = '002'), (SELECT id_usuario FROM Usuario WHERE email = 'estancia.002@issste.gob.mx'), '2026-07-14', 13.56, 92.9, NULL, NULL),
    ((SELECT id_infante FROM Infante WHERE matricula = 100013), (SELECT id_ebdi FROM EBDI WHERE numero = '008'), (SELECT id_usuario FROM Usuario WHERE email = 'estancia.multi@issste.gob.mx'), '2024-03-12', 12.29, 87.5, 50.9, 'Primera medición del año'),
    ((SELECT id_infante FROM Infante WHERE matricula = 100013), (SELECT id_ebdi FROM EBDI WHERE numero = '008'), (SELECT id_usuario FROM Usuario WHERE email = 'estancia.multi@issste.gob.mx'), '2024-09-10', 13.5, 92.2, NULL, NULL),
    ((SELECT id_infante FROM Infante WHERE matricula = 100013), (SELECT id_ebdi FROM EBDI WHERE numero = '008'), (SELECT id_usuario FROM Usuario WHERE email = 'estancia.multi@issste.gob.mx'), '2025-02-18', 14.53, 95.9, NULL, NULL);

-- =============================================================================
-- RESUMEN (conteos tras cargar el seed)
-- =============================================================================
SELECT 'Region' AS tabla, COUNT(*) AS filas FROM Region
UNION ALL SELECT 'Estado', COUNT(*) FROM Estado
UNION ALL SELECT 'EBDI', COUNT(*) FROM EBDI
UNION ALL SELECT 'Rol', COUNT(*) FROM Rol
UNION ALL SELECT 'Usuario', COUNT(*) FROM Usuario
UNION ALL SELECT 'Usuario_Alcance', COUNT(*) FROM Usuario_Alcance
UNION ALL SELECT 'Indicador', COUNT(*) FROM Indicador
UNION ALL SELECT 'Categoria_Nutricional', COUNT(*) FROM Categoria_Nutricional
UNION ALL SELECT 'Infante', COUNT(*) FROM Infante
UNION ALL SELECT 'Tutor', COUNT(*) FROM Tutor
UNION ALL SELECT 'Infante_Tutor', COUNT(*) FROM Infante_Tutor
UNION ALL SELECT 'Medicion_Infante', COUNT(*) FROM Medicion_Infante
UNION ALL SELECT 'Historial_Clinico', COUNT(*) FROM Historial_Clinico
UNION ALL SELECT 'Movimiento_Infante', COUNT(*) FROM Movimiento_Infante;