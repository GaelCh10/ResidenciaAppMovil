import { useState, useEffect } from 'react';
// 1. CAMBIO AQUÍ: Importamos destructurando
import { downloadAsync, getInfoAsync, documentDirectory } from 'expo-file-system';

export const useCachedMedia = (remoteUrl: string | null, type: 'image' | 'video' = 'image') => {
  const [source, setSource] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!remoteUrl) return;

    const checkCache = async () => {
      setLoading(true);
      try {
        // 2. CAMBIO AQUÍ: Validación de seguridad para TypeScript
        if (!documentDirectory) {
            console.warn("El sistema de archivos no está disponible");
            setSource(remoteUrl);
            return;
        }

        const fileName = remoteUrl.split('/').pop();
        // Usamos la variable importada directamente
        const localUri = `${documentDirectory}${fileName}`;

        const fileInfo = await getInfoAsync(localUri);

        if (fileInfo.exists) {
          setSource(localUri);
        } else {
          const { uri } = await downloadAsync(
            remoteUrl,
            localUri
          );
          setSource(uri);
        }
      } catch (error) {
        console.error("Error cacheando media:", error);
        setSource(remoteUrl); 
      } finally {
        setLoading(false);
      }
    };

    checkCache();
  }, [remoteUrl]);

  return { source, loading };
};