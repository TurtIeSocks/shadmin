// Shim: react-router-dom/server.js doesn't exist in RR7.
// These APIs moved to react-router (the core package).
export { StaticRouterProvider, createStaticHandler, createStaticRouter } from "react-router";
