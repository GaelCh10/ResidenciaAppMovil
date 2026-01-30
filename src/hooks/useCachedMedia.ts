import { useState, useEffect } from 'react';
import * as FileSystem from 'expo-file-system';

export const useCachedMedia = (remoteUrl: string | null, type: 'image' | 'video' = 'image') => {
  const [source, setSource] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!remoteUrl) return;

    const checkCache = async () => {
      setLoading(true);
      try {
        // 1. Usamos la ruta clásica. Si esto es null, el APK está mal compilado.
        const folder = FileSystem.documentDirectory;

        if (!folder) {
            console.error("❌ [Cache] FileSystem.documentDirectory es NULL. El módulo nativo no está enlazado.");
            setSource(remoteUrl);
            return;
        }

        // 2. Aseguramos que la carpeta exista (Truco de seguridad)
        const cacheFolder = `${folder}media_cache/`;
        const dirInfo = await FileSystem.getInfoAsync(cacheFolder);
        if (!dirInfo.exists) {
            console.log("📂 Creando carpeta de caché...");
            await FileSystem.makeDirectoryAsync(cacheFolder, { intermediates: true });
        }

        // 3. Definimos la ruta del archivo
        // Usamos encodeURIComponent para evitar errores con caracteres raros en la URL
        const fileName = remoteUrl.split('/').pop()?.split('?')[0] || `file_${Date.now()}`;
        const localUri = `${cacheFolder}${fileName}`;

        // 4. Verificamos si ya existe el archivo
        const fileInfo = await FileSystem.getInfoAsync(localUri);

        if (fileInfo.exists) {
          console.log("✅ [Cache] Usando local:", localUri);
          setSource(localUri);
        } else {
          console.log("⬇️ [Cache] Descargando...");
          const { uri } = await FileSystem.downloadAsync(
            remoteUrl,
            localUri
          );
          console.log("✅ [Cache] Descarga completa:", uri);
          setSource(uri);
        }

      } catch (error) {
        console.error("❌ [Cache] Error:", error);
        setSource(remoteUrl); // Fallback: Usar URL remota si falla algo
      } finally {
        setLoading(false);
      }
    };

    checkCache();
  }, [remoteUrl]);

  return { source, loading };
};