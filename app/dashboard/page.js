"use client";

import { useEffect, useState } from "react";

export default function Dashboard() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchLeads = async () => {
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/leads", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to load leads");
      }

      // supports both formats safely
      const normalized = Array.isArray(data)
        ? data
        : data?.leads || [];

      setLeads(normalized);

    } catch (err) {
      setError(err.message || "Unable to load leads");
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  return (
    <div style={styles.page}>

      {/* HEADER */}
      <div style={styles.header}>
        <h1 style={styles.title}>Skymaster Dashboard</h1>

        <button
          onClick={fetchLeads}
          style={styles.button}
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <p style={styles.sub}>
        Live contractor leads + applications
      </p>

      {/* ERROR */}
      {error && <p style={styles.error}>{error}</p>}

      {/* LOADING */}
      {loading && <p style={styles.text}>Loading data...</p>}

      {/* EMPTY */}
      {!loading && leads.length === 0 && !error && (
        <p style={styles.text}>No leads yet.</p>
      )}

      {/* LEADS */}
      <div style={styles.grid}>
        {leads.map((lead, i) => (
          <div key={lead.id || i} style={styles.card}>

            <div style={styles.email}>
              {lead.email || "No email"}
            </div>

            <div style={styles.meta}>
              <span>Phone: {lead.phone || "N/A"}</span>
            </div>

            <div style={styles.meta}>
              <span>Company: {lead.company || "N/A"}</span>
            </div>

            <div style={styles.badge}>
              Score: {lead.score ?? "0"}
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#0b1220",
    color: "white",
    padding: 30,
    fontFamily: "Arial",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    fontSize: 26,
    fontWeight: 800,
  },

  sub: {
    opacity: 0.6,
    marginBottom: 20,
    fontSize: 13,
  },

  button: {
    padding: "8px 12px",
    borderRadius: 8,
    border: "1px solid #374151",
    background: "#111827",
    color: "white",
    cursor: "pointer",
    fontSize: 12,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: 12,
    marginTop: 10,
  },

  card: {
    background: "#111827",
    border: "1px solid #1f2937",
    padding: 14,
    borderRadius: 12,
  },

  email: {
    fontWeight: 700,
    marginBottom: 6,
  },

  meta: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
  },

  badge: {
    marginTop: 10,
    fontSize: 12,
    color: "#22c55e",
    fontWeight: 700,
  },

  text: {
    opacity: 0.7,
    marginTop: 20,
  },

  error: {
    color: "#f87171",
    marginTop: 10,
  },
};