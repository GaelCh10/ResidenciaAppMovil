import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

// --- INFRAESTRUCTURA Y USUARIOS ---
export const roles = sqliteTable('roles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nombre: text('nombre').notNull().unique(),
});

export const usuarios = sqliteTable('usuarios', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  isStaff: integer('is_staff', { mode: 'boolean' }).default(false),
  rolId: integer('rol_id').references(() => roles.id),
});

export const personas = sqliteTable('personas', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nombre: text('nombre').notNull(),
  apellidoP: text('apellido_p').notNull(),
  apellidoM: text('apellido_m').notNull(),
  sexo: text('sexo').notNull(), // 'H' o 'M'
  fechaNacimiento: text('fecha_nacimiento').notNull(),
  usuarioId: integer('usuario_id').references(() => usuarios.id),
});

// --- CONTENIDO EDUCATIVO ---
export const imagenes = sqliteTable('imagenes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  imgUrl: text('img'), // Guardaremos la ruta local del archivo descargado
});

export const niveles = sqliteTable('niveles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nombre: text('nombre').notNull().unique(),
  descripcion: text('descripcion'),
});

export const categorias = sqliteTable('categorias', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nombre: text('nombre').notNull().unique(),
  descripcion: text('descripcion'),
  nivelId: integer('nivel_id').references(() => niveles.id),
});

export const cursos = sqliteTable('cursos', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  titulo: text('titulo').notNull().unique(),
  descripcion: text('descripcion'),
  categoriaId: integer('categoria_id').references(() => categorias.id),
  imagenId: integer('imagen_id').references(() => imagenes.id),
});

export const temas = sqliteTable('temas', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  titulo: text('titulo').notNull(),
  contenido: text('contenido'),
  videoUrl: text('video'), // URL o ruta local
  cursoId: integer('curso_id').references(() => cursos.id),
  imagenSeniaId: integer('imagen_id').references(() => imagenes.id), // Imagen de la seña
  imagenRepresentativaId: integer('representativo_img_id').references(() => imagenes.id),
});

// --- JUEGOS ---
export const tiposJuego = sqliteTable('tipos_juego', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tipo: text('tipo').notNull().unique(),
});

export const juegos = sqliteTable('juegos', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nombre: text('nombre').notNull(),
  descripcion: text('descripcion'),
  instruccion: text('instruccion').notNull(),
  tipoId: integer('tipo_id').references(() => tiposJuego.id),
  imagenPortada: text('imagen_portada'), // ImageField en Django
});

export const memoramas = sqliteTable('memoramas', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  parId: text('par_id').notNull(),
  tipo: text('tipo').notNull(), // 'letra' o 'imagen'
  texto: text('texto'),
  juegoId: integer('juego_id').references(() => juegos.id),
  imagenId: integer('imagen_id').references(() => imagenes.id),
});

export const escribirSenas = sqliteTable('escribir_senas', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  texto: text('texto').notNull(),
  juegoId: integer('juego_id').references(() => juegos.id),
  imagenId: integer('imagen_id').references(() => imagenes.id),
});

// --- EVALUACIÓN Y PROGRESO ---
export const evaluaciones = sqliteTable('evaluaciones', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  titulo: text('titulo').notNull(),
  descripcion: text('descripcion'),
  cursoId: integer('curso_id').references(() => cursos.id),
});

export const preguntas = sqliteTable('preguntas', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  pregunta: text('pregunta'),
  tipo: text('tipo'),
  evaluacionId: integer('evaluacion_id').references(() => evaluaciones.id),
  imagenId: integer('img_pregunta_id').references(() => imagenes.id),
});

export const opciones = sqliteTable('opciones', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  respuesta: text('respuesta'),
  esCorrecto: integer('es_correcto', { mode: 'boolean' }).notNull(),
  preguntaId: integer('pregunta_id').references(() => preguntas.id),
  imagenId: integer('respuesta_img_id').references(() => imagenes.id),
});

// --- SEGUIMIENTO DE USUARIO (LO QUE SE SINCRONIZA) ---
export const avances = sqliteTable('avances', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  temaId: integer('tema_id').references(() => temas.id),
  usuarioId: integer('usuario_id').references(() => usuarios.id),
  fechaCompletado: text('fecha_completado').default('CURRENT_TIMESTAMP'),
});

export const progresoEvaluaciones = sqliteTable('progreso_evaluaciones', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  calificacion: real('calificacion').notNull(),
  evaluacionId: integer('evaluacion_id').references(() => evaluaciones.id),
  usuarioId: integer('usuario_id').references(() => usuarios.id),
});
// --- ÚLTIMAS ADICIONES: JUEGOS ESPECÍFICOS ---

export const ordenarPalabras = sqliteTable('ordenar_palabras', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  palabra: text('palabra').notNull(),
  juegoId: integer('juego_id').references(() => juegos.id),
});

export const formarPalabras = sqliteTable('formar_palabras', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  letras: text('letras').notNull(), // Ejemplo: "A,B,C,D"
  juegoId: integer('juego_id').references(() => juegos.id),
});

export const palabrasFormarDetalle = sqliteTable('palabras_formar_detalle', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  palabra: text('palabra').notNull(),
  pista: text('pista'),
  formarPalabraId: integer('formar_palabra_id').references(() => formarPalabras.id),
});

export const encontrarPares = sqliteTable('encontrar_pares', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  palabra: text('palabra').notNull(),
  imagenId: integer('imagen_id').references(() => imagenes.id),
  juegoId: integer('juego_id').references(() => juegos.id),
});

// --- DICCIONARIO ---

export const categoriasDiccionario = sqliteTable('categorias_diccionario', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  categoria: text('categoria').notNull(),
});

export const diccionario = sqliteTable('diccionario', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  palabra: text('palabra').notNull(),
  categoriaId: integer('categoria_id').references(() => categoriasDiccionario.id),
  imagenId: integer('imagen_id').references(() => imagenes.id),
});

// --- FORO (Opcional para Offline) ---
// Nota: El foro requiere internet, pero puedes guardar una copia local para lectura rápida.

export const foro = sqliteTable('foro', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  titulo: text('titulo').notNull(),
  contenido: text('contenido').notNull(),
  fecha: text('fecha').notNull(),
  usuarioId: integer('usuario_id').references(() => usuarios.id),
});

export const comentariosForo = sqliteTable('comentarios_foro', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  comentario: text('comentario').notNull(),
  fecha: text('fecha').notNull(),
  foroId: integer('foro_id').references(() => foro.id),
  usuarioId: integer('usuario_id').references(() => usuarios.id),
});

// --- DETALLE DE EVALUACIÓN (Actualización 0026) ---

export const detalleEvaluacion = sqliteTable('detalle_evaluacion', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  calificacion: real('calificacion').notNull(),
  evaluacionId: integer('evaluacion_id').references(() => evaluaciones.id),
  personaId: integer('persona_id').references(() => personas.id),
});