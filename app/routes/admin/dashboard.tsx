import type { Route } from "../+types/admin";

export default function AdminIndex(_: Route.ComponentProps) {
  return (
    <section>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>Admin Dashboard</h1>
      <p style={{ color: "#6b7280" }}>Welcome to your admin dashboard.</p>
    </section>
  );
}
