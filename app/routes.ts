import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("login", "routes/login.tsx"),

  route("admin", "routes/admin/_layout.tsx", [
    index("routes/admin/dashboard.tsx"),
    route("prospects", "routes/admin/prospects.tsx"),
    route("campaign", "routes/admin/campaign.tsx"),
    route("campaign/create", "routes/admin/campaign-form.tsx", { id: "campaign-create" }),
    route("campaign/:id/edit", "routes/admin/campaign-form.tsx", { id: "campaign-edit" }),
    route("landingpage", "routes/admin/landingpage.tsx"),
  ]),
] satisfies RouteConfig;
