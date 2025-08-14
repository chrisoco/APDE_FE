import { Outlet, NavLink, redirect, useLoaderData, Form } from "react-router";
import type { Route } from "./+types/_layout";
import { apiHelpers } from "../../lib/api";

export async function clientLoader() {
  try {
    const user = await apiHelpers.get("/api/user");
    return { user };
  } catch (error) {
    throw redirect("/login");
  }
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "logout") {
    try {
      await apiHelpers.post("/logout", {}, {
        requiresAuth: true,
        includeCSRF: true
      });
    } catch (error) {
      // Even if logout fails, redirect to login
      console.warn("Logout failed:", error);
    }
    return redirect("/login");
  }

  return null;
}

export default function AdminLayout() {
  const { user } = useLoaderData<typeof clientLoader>();

  return (
    <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", minHeight: "100vh" }}>
      <aside style={{ borderRight: "1px solid #e5e7eb", padding: "1rem" }}>
        <div style={{ fontWeight: 700, marginBottom: "1rem" }}>My CMS</div>
        <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 12 }}>
          Signed in as <br /> <strong>{user?.name || user?.email || "User"}</strong>
        </div>
        <nav style={{ display: "grid", gap: "8px" }}>
          <NavItem to="/admin" end label="Dashboard" />
          <NavItem to="/admin/prospects" label="Prospects" />
          <NavItem to="/admin/campaign" label="Campaign" />
          <NavItem to="/admin/landingpage" label="Landingpage" />
        </nav>
        <Form method="post" style={{ marginTop: "auto" }}>
          <input type="hidden" name="intent" value="logout" />
          <button type="submit" style={{ marginTop: 16, padding: "8px 10px", border: "1px solid #d1d5db", borderRadius: 8 }}>
            Log out
          </button>
        </Form>
      </aside>
      <main style={{ padding: "1.25rem 1.5rem" }}>
        <Outlet />
      </main>
    </div>
  );
}

function NavItem({ to, label, end = false }: { to: string; label: string; end?: boolean }) {
  return (
    <NavLink
      to={to}
      end={end}
      style={({ isActive }) => ({
        padding: "8px 10px",
        borderRadius: 8,
        textDecoration: "none",
        color: isActive ? "#111827" : "#374151",
        background: isActive ? "#eef2ff" : "transparent",
        border: isActive ? "1px solid #c7d2fe" : "1px solid transparent",
        fontWeight: isActive ? 600 : 500,
      })}
    >
      {label}
    </NavLink>
  );
}