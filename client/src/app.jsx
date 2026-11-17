
import { useEffect, useState } from "react";
import "./app.css";

const API = `${import.meta.env.VITE_API_URL || "https://server-health-monitor-1.onrender.com"}/api/health`;

function App() {
  const [servers, setServers] = useState([]);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadServers = async () => {
    try {
      const response = await fetch(API);

      if (!response.ok) {
        throw new Error("Could not load servers");
      }

      const data = await response.json();
      setServers(data);
      setError("");
    } catch (err) {
      setError(
        "Cannot connect to backend. Make sure the server is running on port 5000."
      );
    }
  };

  useEffect(() => {
    loadServers();
  }, []);

  const addServer = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (name.trim().length < 2) {
      setError("Server name must contain at least 2 characters.");
      return;
    }

    try {
      const parsedUrl = new URL(url);

      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        throw new Error("Invalid URL");
      }
    } catch {
      setError("Enter a valid HTTP or HTTPS URL.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          url: url.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not add server");
      }

      setName("");
      setUrl("");
      setMessage("Server added successfully.");

      await loadServers();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const checkHealth = async (id) => {
    setChecking(id);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API}/${id}/check`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Health check failed");
      }

      setMessage("Health check completed.");
      await loadServers();
    } catch (err) {
      setError(err.message);
    } finally {
      setChecking("");
    }
  };

  const deleteServer = async (id) => {
    if (!window.confirm("Are you sure you want to delete this server?")) {
      return;
    }

    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Could not delete server");
      }

      setMessage("Server deleted successfully.");
      await loadServers();
    } catch (err) {
      setError(err.message);
    }
  };

  const healthy = servers.filter(
    (server) => server.status === "Healthy"
  ).length;

  const down = servers.filter(
    (server) => server.status === "Down"
  ).length;

  const unknown = servers.filter(
    (server) => server.status === "Unknown"
  ).length;

  const getHttpStatus = (code) => {
    if (code === null || code === undefined) {
      return "Not available";
    }

    if (code >= 200 && code < 300) {
      return `${code} OK`;
    }

    if (code >= 300 && code < 400) {
      return `${code} Redirect`;
    }

    if (code >= 400) {
      return `${code} Error`;
    }

    return `${code}`;
  };

  return (
    <main className="dashboard">
      <header className="topbar">
        <div>
          <p className="eyebrow">MONITORING SYSTEM</p>
          <h1>Server Health Dashboard</h1>
          <p className="subtitle">
            Monitor your servers in real time.
          </p>
        </div>

        <button className="refresh-btn" onClick={loadServers}>
          ↻ Refresh
        </button>
      </header>

      <section className="stats">
        <div className="stat-card total">
          <span>Total Servers</span>
          <strong>{servers.length}</strong>
        </div>

        <div className="stat-card healthy">
          <span>Healthy</span>
          <strong>{healthy}</strong>
        </div>

        <div className="stat-card down">
          <span>Down</span>
          <strong>{down}</strong>
        </div>

        <div className="stat-card unknown">
          <span>Unknown</span>
          <strong>{unknown}</strong>
        </div>
      </section>

      <section className="panel">
        <h2>Add a Server</h2>

        <p className="panel-description">
          Register a website or server to monitor.
        </p>

        <form onSubmit={addServer} className="server-form">
          <label>
            Server name

            <input
              type="text"
              placeholder="Example: Google"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>

          <label>
            Server URL

            <input
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
          </label>

          <button type="submit" disabled={loading}>
            {loading ? "Adding..." : "+ Add Server"}
          </button>
        </form>

        {error && (
          <p className="alert error">
            {error}
          </p>
        )}

        {message && (
          <p className="alert success">
            {message}
          </p>
        )}
      </section>

      <section className="panel">
        <div className="list-heading">
          <div>
            <h2>Monitored Servers</h2>

            <p className="panel-description">
              Check the current health of each server.
            </p>
          </div>

          <span className="server-count">
            {servers.length} servers
          </span>
        </div>

        {servers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">⌁</div>
            <h3>No servers added yet</h3>
            <p>Add your first server using the form above.</p>
          </div>
        ) : (
          <div className="server-list">
            {servers.map((server) => (
              <article className="server-item" key={server._id}>
                <div className="server-info">
                  <h3>{server.name}</h3>

                  <a
                    href={server.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {server.url}
                  </a>

                  <div className="server-meta">
                    <span>
                      HTTP Status Code:{" "}
                      {getHttpStatus(server.httpStatusCode)}
                    </span>

                    <span>
                      Response time:{" "}
                      {server.responseTime ?? 0} ms
                    </span>

                    <span>
                      Last checked:{" "}
                      {server.lastChecked
                        ? new Date(
                            server.lastChecked
                          ).toLocaleString()
                        : "Not checked yet"}
                    </span>
                  </div>
                </div>

                <div className="server-actions">
                  <span
                    className={`status ${
                      server.status?.toLowerCase() || "unknown"
                    }`}
                  >
                    {server.status || "Unknown"}
                  </span>

                  <button
                    className="check-btn"
                    onClick={() => checkHealth(server._id)}
                    disabled={checking === server._id}
                  >
                    {checking === server._id
                      ? "Checking..."
                      : "Check Health"}
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() => deleteServer(server._id)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <footer>
        Server Health Monitoring System · React · Node.js · MongoDB
      </footer>
    </main>
  );
}

export default App;

