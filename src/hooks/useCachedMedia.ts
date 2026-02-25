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

        const folder = FileSystem.documentDirectory;

        if (!folder) {

            setSource(remoteUrl);
            return;
        }

        const cacheFolder = `${folder}media_cache/`;
        const dirInfo = await FileSystem.getInfoAsync(cacheFolder);
        if (!dirInfo.exists) {
            await FileSystem.makeDirectoryAsync(cacheFolder, { intermediates: true });
        }

        const fileName = remoteUrl.split('/').pop()?.split('?')[0] || `file_${Date.now()}`;
        const localUri = `${cacheFolder}${fileName}`;

        const fileInfo = await FileSystem.getInfoAsync(localUri);

        if (fileInfo.exists) {
          setSource(localUri);
        } else {
          const { uri } = await FileSystem.downloadAsync(
            remoteUrl,
            localUri
          );
          setSource(uri);
        }

      } catch (error) {
        setSource(remoteUrl); 
      } finally {
        setLoading(false);
      }
    };

    checkCache();
  }, [remoteUrl]);

  return { source, loading };
};