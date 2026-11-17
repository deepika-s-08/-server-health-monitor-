
import express from "express";
import axios from "axios";
import Health from "../models/Health.js";

const router = express.Router();

// DFA TRANSITION FUNCTION
function getNextState(currentState, input) {
  const transitions = {
    Unknown: { Success: "Healthy", Failure: "Down" },
    Healthy: { Success: "Healthy", Failure: "Down" },
    Down: { Success: "Healthy", Failure: "Down" }
  };

  return transitions[currentState][input];
}

// Get all servers
router.get("/", async (req, res) => {
  try {
    const servers = await Health.find().sort({ _id: -1 });
    res.json(servers);
  } catch (error) {
    console.error(error);
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

    try {
      const parsed = new URL(url);

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
      status: "Unknown",
      httpStatusCode: null,
      transitionHistory: []
    });

    res.status(201).json(server);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Unable to add server" });
  }
});

// Check server health using DFA and HTTP status code
router.post("/:id/check", async (req, res) => {
  try {
    const server = await Health.findById(req.params.id);

    if (!server) {
      return res.status(404).json({
        message: "Server not found"
      });
    }

    const start = Date.now();
    let input;

    try {
      const response = await axios.get(server.url, {
        timeout: 5000,
        validateStatus: () => true
      });

      server.responseTime = Date.now() - start;
      server.httpStatusCode = response.status;

      input =
        response.status >= 200 && response.status < 400
          ? "Success"
          : "Failure";

    } catch (error) {
      server.responseTime = Date.now() - start;
      server.httpStatusCode = error.response?.status ?? null;
      input = "Failure";
    }

    // Apply DFA transition
    const previousState = server.status || "Unknown";
    const nextState = getNextState(previousState, input);

    server.status = nextState;
    server.lastChecked = new Date();

    // Preserve transition history
    server.transitionHistory.push({
      previousState,
      input,
      nextState,
      timestamp: new Date()
    });

    await server.save();

    res.json(server);
  } catch (error) {
    console.error("Health check error:", error);
    res.status(500).json({
      message: "Health check failed"
    });
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

    res.json({
      message: "Server deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Delete failed"
    });
  }
});

export default router;
