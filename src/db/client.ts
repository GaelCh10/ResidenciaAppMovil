import * as SQLite from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';

// Abrimos la base de datos de forma sincrónica (API Next)
const expoDb = SQLite.openDatabaseSync('sign_language.db');

export const db = drizzle(expoDb);

/**
 * Hook personalizado para inicializar la base de datos en tu App.tsx
 */
export const useDatabaseConfig = () => {
    // Nota: Necesitarás generar las migraciones con drizzle-kit (te explico abajo)
    // Por ahora, si solo quieres probar sin archivos de migración,
    // puedes usar db.run(sql`CREATE TABLE...`) pero lo ideal es esto:
    const migrations = require('../../drizzle/migrations'); // Ruta a tus migraciones generadas
    return useMigrations(db, migrations);
};