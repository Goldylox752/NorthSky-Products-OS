import Link from "next/link";

export default function Home() {
  return (
    <main style={{ padding: 40 }}>
      <h1>North Sky OS</h1>
      <p>Welcome to your platform dashboard system.</p>

      <div style={{ marginTop: 20, display: "flex", gap: 12 }}>
        <Link href="/pricing">Pricing</Link>
        <Link href="/apply">Apply</Link>
      </div>
    </main>
  );
}