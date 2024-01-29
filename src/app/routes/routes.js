const express = require("express");
const AuthRoutes = require("../modules/auth/auth.routes");

const router = express.Router();

const routes = [
  {
    path: "/auth",
    route: AuthRoutes,
  },
];

routes.forEach((route) => router.use(route.path, route.route));

module.exports = router;
