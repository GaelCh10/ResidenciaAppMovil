
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('lsm_offline.db');

export const initDB = async () => {
  try {
    console.log("♻️ Reiniciando base de datos...");
    
    await db.execAsync(`
      DROP TABLE IF EXISTS courses;
      DROP TABLE IF EXISTS levels;
      DROP TABLE IF EXISTS categories;
      DROP TABLE IF EXISTS lessons;
      DROP TABLE IF EXISTS quiz_questions;
      DROP TABLE IF EXISTS dictionary_categories;
      DROP TABLE IF EXISTS dictionary_entries;
    `);

    // 2. CREAMOS TODO NUEVO (Con las columnas order_index faltantes)
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
    `);
    console.log("Base de datos lista y actualizada");
    return true; // Retornamos true para avisar que acabó
  } catch (error) {
    console.error("Error iniciando DB local:", error);
    return false;
  }
};

export const getDB = () => db;