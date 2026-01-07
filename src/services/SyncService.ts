import * as FileSystem from 'expo-file-system';
import { cacheDirectory, documentDirectory } from 'expo-file-system';
import { db } from '../db/client';
import { cursos, imagenes } from '../db/schema';

const BASE_DIR = documentDirectory || cacheDirectory;
const ASSETS_DIR = `${BASE_DIR}assets/`;
export const SyncService = {
  ensureDir: async () => {
    // getStorageStateSnapshot o StorageState no son necesarios aquí, 
    // usamos la API estándar pero corregimos el warning de deprecación.
    const dirInfo = await FileSystem.getInfoAsync(ASSETS_DIR);
    
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(ASSETS_DIR, { intermediates: true });
    }
  },

  downloadFile: async (remoteUrl: string, fileName: string) => {
    const localPath = `${ASSETS_DIR}${fileName}`;
    
    // getInfoAsync devuelve un objeto que tiene la propiedad exists
    const fileInfo = await FileSystem.getInfoAsync(localPath);
    
    if (fileInfo.exists) return localPath;

    try {
      const download = await FileSystem.downloadAsync(remoteUrl, localPath);
      return download.uri;
    } catch (e) {
      console.error("Error descargando:", remoteUrl);
      return null;
    }
  },
  // 3. Sincronizar Cursos (Basado en tu CursoSerializers)
  syncCursos: async (apiData: any[]) => {
    await SyncService.ensureDir();

    for (const item of apiData) {
      let localImageUri = null;

      if (item.imagen_url) {
        // Extraemos un nombre único para el archivo basado en el ID
        const extension = item.imagen_url.split('.').pop();
        localImageUri = await SyncService.downloadFile(
          item.imagen_url, 
          `curso_${item.id}.${extension}`
        );
      }

      // Insertar o actualizar en SQLite
      await db.insert(cursos).values({
        id: item.id,
        titulo: item.titulo,
        descripcion: item.descripcion,
        categoriaId: item.categoria,
        // Guardamos la ruta del CABLE local, no la URL de Django
        imagenId: localImageUri ? item.imagen : null, 
      }).onConflictDoUpdate({
        target: cursos.id,
        set: { titulo: item.titulo, descripcion: item.descripcion }
      });
      
      // Si descargamos imagen, actualizamos la tabla de imágenes local
      if (localImageUri) {
        await db.insert(imagenes).values({
          id: item.imagen,
          imgUrl: localImageUri
        }).onConflictDoNothing();
      }
    }
  }
};