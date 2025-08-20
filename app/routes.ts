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
    route("campaign-outbox", "routes/admin/campaign-outbox.tsx"),
    route("landingpage", "routes/admin/landingpage.tsx"),
    route("landingpage/create", "routes/admin/landingpage-form.tsx", { id: "landingpage-create" }),
    route("landingpage/:id/edit", "routes/admin/landingpage-form.tsx", { id: "landingpage-edit" }),
  ]),
] satisfies RouteConfig;
