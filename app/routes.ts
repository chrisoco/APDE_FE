import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("login", "routes/login.tsx"),
  route("admin", "routes/admin.tsx", [
    index("routes/admin/index.tsx"),
    route("prospects", "routes/admin/prospects.tsx"),
    route("campaign", "routes/admin/campaign.tsx"),
    route("landingpage", "routes/admin/landingpage.tsx"),
  ]),
] satisfies RouteConfig;
