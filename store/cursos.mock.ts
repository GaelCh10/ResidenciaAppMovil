// src/data/cursos.mock.ts
export interface Opcion {
  id: number;
  respuesta: string;
  esCorrecto: boolean;
}

export interface Pregunta {
  id: number;
  pregunta: string;
  tipo: "texto" | "imagen";
  opciones: Opcion[];
}

export interface Tema {
  id: number;
  titulo: string;
  imagen_url: string;
}

export interface Curso {
  id: number;
  titulo: string;
  descripcion: string;
  categoria_nombre: string;
  temas: Tema[];
  evaluacion: Pregunta[];
}

export interface Nivel {
  id: number;
  nombre: string;
  categoria: {
    id: number;
    nombre: string;
    cursos: Curso[];
  }[];
}

export const cursosMock: Nivel[] = [
  {
    id: 1,
    nombre: "Nivel Básico",
    categoria: [
      {
        id: 101,
        nombre: "Saludos y Cortesía",
        cursos: [
          {
            id: 1001,
            titulo: "Saludos Iniciales en LSM",
            descripcion: "Aprende cómo saludar, presentarte y despedirte en LSM.",
            categoria_nombre: "Saludos",
            temas: [
              { id: 1, titulo: "Hola y Adiós", imagen_url: "https://source.unsplash.com/200x200/?hello,hand" },
              { id: 2, titulo: "Gracias", imagen_url: "https://source.unsplash.com/200x200/?thank,you" },
            ],
            evaluacion: [
              {
                id: 1,
                pregunta: "¿Cuál seña representa 'Hola'?",
                tipo: "texto",
                opciones: [
                  { id: 1, respuesta: "Levantar la mano abierta", esCorrecto: true },
                  { id: 2, respuesta: "Cruzar los brazos", esCorrecto: false },
                  { id: 3, respuesta: "Mover la cabeza", esCorrecto: false },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];
