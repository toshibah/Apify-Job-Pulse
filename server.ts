import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Database setup
  const db = new Database("jobs.db");
  db.exec(`
    CREATE TABLE IF NOT EXISTS saved_jobs (
      id TEXT PRIMARY KEY,
      title TEXT,
      company TEXT,
      location TEXT,
      salary TEXT,
      source TEXT,
      url TEXT,
      description TEXT,
      posted_at TEXT,
      saved_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS search_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      query TEXT,
      filters TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS websites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  app.use(express.json());

  // API Routes
  app.get("/api/saved-jobs", (req, res) => {
    const jobs = db.prepare("SELECT * FROM saved_jobs ORDER BY saved_at DESC").all();
    res.json(jobs);
  });

  app.post("/api/saved-jobs", (req, res) => {
    const { id, title, company, location, salary, source, url, description, posted_at } = req.body;
    try {
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO saved_jobs (id, title, company, location, salary, source, url, description, posted_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(id, title, company, location, salary, source, url, description, posted_at);
      res.status(201).json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to save job" });
    }
  });

  app.delete("/api/saved-jobs/:id", (req, res) => {
    const { id } = req.params;
    db.prepare("DELETE FROM saved_jobs WHERE id = ?").run(id);
    res.json({ success: true });
  });

  // Website API Routes
  app.get("/api/websites", (req, res) => {
    const websites = db.prepare("SELECT * FROM websites ORDER BY created_at DESC").all();
    res.json(websites);
  });

  app.post("/api/websites", (req, res) => {
    const { name, url } = req.body;
    try {
      const stmt = db.prepare("INSERT INTO websites (name, url) VALUES (?, ?)");
      stmt.run(name, url);
      res.status(201).json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to add website" });
    }
  });

  app.delete("/api/websites/:id", (req, res) => {
    const { id } = req.params;
    db.prepare("DELETE FROM websites WHERE id = ?").run(id);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
