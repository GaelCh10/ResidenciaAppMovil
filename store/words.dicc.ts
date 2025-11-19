// src/data/words.dicc.ts
export interface Word {
  id: number;
  palabra: string;
  categoria: string;
  imagen_url: string;
}

export const palabrasDiccionario: Word[] = [
  {
    id: 1,
    palabra: "Hola",
    categoria: "Saludos",
    imagen_url: "https://tse4.mm.bing.net/th/id/OIP.C5E6fIiN5qwgD0UZQnIiGAHaHa?cb=ucfimg2ucfimg=1&rs=1&pid=ImgDetMain&o=7&rm=3",
  },
  {
    id: 2,
    palabra: "Gracias",
    categoria: "Cortesía",
    imagen_url: "https://source.unsplash.com/200x200/?thanks,gesture",
  },
  {
    id: 3,
    palabra: "Por favor",
    categoria: "Cortesía",
    imagen_url: "https://source.unsplash.com/200x200/?please,hand",
  },
  {
    id: 4,
    palabra: "Adiós",
    categoria: "Saludos",
    imagen_url: "https://source.unsplash.com/200x200/?goodbye,handwave",
  },
];
