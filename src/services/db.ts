import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("lsm_offline.db");

export const initDB = async () => {
  try {
    console.log("🚀 [DB] Iniciando inicialización de la base de datos local...");

    // 1. Borrar tablas antiguas (Opcional, útil en desarrollo para limpiar)
    // console.log("🗑️ [DB] Limpiando esquema anterior...");
    // await db.execAsync(`
    //   DROP TABLE IF EXISTS courses;
    //   DROP TABLE IF EXISTS levels;
    //   DROP TABLE IF EXISTS categories;
    //   DROP TABLE IF EXISTS lessons;
    //   DROP TABLE IF EXISTS quiz_questions;
    //   DROP TABLE IF EXISTS dictionary_categories;
    //   DROP TABLE IF EXISTS dictionary_entries;
    // `);
    // console.log("✅ [DB] Esquema anterior limpiado.");

    // 2. Crear tablas
    console.log("🏗️ [DB] Creando tablas nuevas...");
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        order_index INTEGER
      );

      CREATE TABLE IF NOT EXISTS levels (
        id TEXT PRIMARY KEY NOT NULL,
        category_id TEXT NOT NULL,
        name TEXT NOT NULL,
        order_index INTEGER
      );

      CREATE TABLE IF NOT EXISTS courses (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        image_url TEXT,
        level_id TEXT,
        order_index INTEGER
      );

      CREATE TABLE IF NOT EXISTS lessons (
        id TEXT PRIMARY KEY NOT NULL,
        course_id TEXT NOT NULL,
        title TEXT,
        content_url TEXT,
        image_url TEXT,
        spanish_text TEXT,
        lsm_text_code TEXT,
        type TEXT,
        order_index INTEGER
      );

      CREATE TABLE IF NOT EXISTS quiz_questions (
        id TEXT PRIMARY KEY NOT NULL,
        course_id TEXT NOT NULL,
        question_text TEXT,
        media_url TEXT,
        options TEXT,
        correct_answer TEXT
      );

      CREATE TABLE IF NOT EXISTS dictionary_categories (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        image_url TEXT
      );

      CREATE TABLE IF NOT EXISTS dictionary_entries (
        id TEXT PRIMARY KEY NOT NULL,
        category_id TEXT NOT NULL,
        word TEXT NOT NULL,
        media_url TEXT,
        media_type TEXT
      );

      CREATE TABLE IF NOT EXISTS user_progress (
        id TEXT PRIMARY KEY NOT NULL,
        user_id TEXT NOT NULL,
        course_id TEXT NOT NULL,
        is_completed INTEGER DEFAULT 0,
        quiz_score INTEGER DEFAULT 0,
        last_accessed_at TEXT
      );
    `);
    
    // 3. VERIFICACIÓN: Consultamos a SQLite qué tablas existen realmente
    const tables = await db.getAllAsync(
      "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
    );
    console.log("✅ [DB] Base de datos lista. Tablas creadas:", JSON.stringify(tables, null, 2));
    
    return true; 
  } catch (error) {
    console.error("❌ [DB] Error FATAL iniciando DB local:", error);
    return false;
  }
};

export const getDB = () => db;