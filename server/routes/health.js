import express from "express";
import axios from "axios";
import Health from "../models/Health.js";

const router = express.Router();

// Get all servers
router.get("/", async (req, res) => {
  try {
    const servers = await Health.find().sort({ _id: -1 });
    res.json(servers);
  } catch (error) {
    res.status(500).json({ message: "Database error" });
  }
});

// Add server
router.post("/", async (req, res) => {
  try {
    const { name, url } = req.body;

    if (!name || !url || name.trim().length < 2) {
      return res.status(400).json({
        message: "Valid name and URL are required"
      });
    }

    let parsed;
    try {
      parsed = new URL(url);
      if (!["http:", "https:"].includes(parsed.protocol)) {
        throw new Error();
      }
    } catch {
      return res.status(400).json({
        message: "Enter a valid HTTP or HTTPS URL"
      });
    }

    const server = await Health.create({
      name: name.trim(),
      url,
      status: "Unknown"
    });

    res.status(201).json(server);
  } catch (error) {
    res.status(500).json({ message: "Unable to add server" });
  }
});

// Check server health
router.post("/:id/check", async (req, res) => {
  try {
    const server = await Health.findById(req.params.id);

    if (!server) {
      return res.status(404).json({
        message: "Server not found"
      });
    }

    const start = Date.now();

    try {
      const response = await axios.get(server.url, {
        timeout: 5000,
        validateStatus: () => true
      });

      server.responseTime = Date.now() - start;
      server.status =
        response.status >= 200 && response.status < 400
          ? "Healthy"
          : "Down";

    } catch {
      server.status = "Down";
      server.responseTime = Date.now() - start;
    }

    server.lastChecked = new Date();
    await server.save();

    res.json(server);
  } catch (error) {
    res.status(500).json({ message: "Health check failed" });
  }
});

// Delete server
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Health.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        message: "Server not found"
      });
    }

    res.json({ message: "Server deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed" });
  }
});

export default router;
