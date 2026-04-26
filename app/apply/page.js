"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";

export default function Apply() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [volume, setVolume] = useState("low");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isValidEmail = (v) => /\S+@\S+\.\S+/.test(v);
  const normalizePhone = (v) => v.replace(/\D/g, "");

  const cleanPhone = useMemo(() => normalizePhone(phone), [phone]);

  const score = useMemo(() => {
    let s = 0;
    if (isValidEmail(email)) s += 40;
    if (cleanPhone.length === 10) s += 30;
    if (company.length > 2) s += 20;
    if (volume === "high") s += 10;
    return s;
  }, [email, cleanPhone, company, volume]);

  const qualified = score >= 60;

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isValidEmail(email)) return setError("Enter a valid email.");
    if (cleanPhone.length !== 10) return setError("Enter a valid phone number.");
    if (!company) return setError("Company name required.");

    setLoading(true);

    try {
      const payload = {
        email,
        phone: cleanPhone,
        company,
        volume,
        score,
        source: "drone_apply"
      };

      // optional: lead capture first
      await fetch("/api/leads/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // send to checkout / offer flow
      const res = await fetch("/api/checkout-drone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data?.error || "Checkout failed");

      if (data.url) {
        router.push(data.url);
      }

    } catch (err) {
      setError(err.message || "Something went wrong.");
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        <h1 style={styles.title}>
          Apply for Skymaster X1 v2 Access
        </h1>

        <p style={styles.sub}>
          Contractor-only inspection system. Limited availability per region.
        </p>

        <div style={styles.score}>
          Qualification Score: <b>{score}/100</b>
          <span style={{ color: qualified ? "#22c55e" : "#fbbf24" }}>
            {qualified ? " (Pre-qualified)" : " (Review required)"}
          </span>
        </div>

        <form onSubmit={submit} style={styles.form}>

          <input
            placeholder="Business Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
          />

          <input
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={styles.input}
          />

          <input
            placeholder="Company Name"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            style={styles.input}
          />

          <select
            value={volume}
            onChange={(e) => setVolume(e.target.value)}
            style={styles.input}
          >
            <option value="low">Low inspection volume</option>
            <option value="medium">Medium volume</option>
            <option value="high">High-volume contractor</option>
          </select>

          {error && <p style={styles.error}>{error}</p>}

          <button disabled={loading} style={styles.button}>
            {loading ? "Processing..." : "Continue to Access"}
          </button>

        </form>

        <p style={styles.note}>
          By applying, you request access to contractor-only drone inspection system.
        </p>

      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#0b1220",
    fontFamily: "Arial",
    padding: 20,
    color: "white",
  },
  card: {
    width: "100%",
    maxWidth: 520,
    background: "#111827",
    padding: 30,
    borderRadius: 16,
    border: "1px solid #1f2937",
  },
  title: {
    fontSize: 24,
    fontWeight: 800,
  },
  sub: {
    opacity: 0.7,
    marginTop: 8,
    fontSize: 13,
  },
  score: {
    marginTop: 15,
    fontSize: 13,
    opacity: 0.9,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    marginTop: 20,
  },
  input: {
    padding: 12,
    borderRadius: 10,
    border: "1px solid #374151",
    background: "#0b1220",
    color: "white",
  },
  button: {
    padding: 14,
    borderRadius: 10,
    border: "none",
    background: "#22c55e",
    fontWeight: 700,
    cursor: "pointer",
  },
  error: {
    color: "#f87171",
    fontSize: 13,
  },
  note: {
    marginTop: 15,
    fontSize: 11,
    opacity: 0.6,
  },
};