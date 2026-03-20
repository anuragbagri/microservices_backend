import { Router } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import authenticateMiddleware from "../middlewares/authenticate.js";

const router = Router();

const authProxy = createProxyMiddleware({
  target: "http://localhost:6101", // for dev env ... use localhost only
  changeOrigin: true, // modify the origin header
  pathRewrite: {
    "^/api/auth": "/auth",
  },
  on: {
    proxyReq: () => {},
    proxyRes: () => {},
  },
  onError: (err, req, res) => {
    res.status(503).json({
      success: false,
      statusCode: 503,
      message: "Auth service unavailable",
      errors: [],
    });
  },
});

const oAuthproxy = createProxyMiddleware({
  target: "http://localhost:6102",
  changeOrigin: true,
  pathRewrite: {
    "^/api/oauth": "/oauth",
  },
  on: {
    proxyReq: () => {},
    proxyRes: () => {},
  },
  onError: (err, req, res) => {
    res.status(503).json({
      success: false,
      statusCode: 504,
      message: "oAuth service failure",
      errors: [],
    });
  },
});

const userProxy = createProxyMiddleware({
  target: "http://localhost:6103",
  changeOrigin: true,
  pathRewrite: {
    "^/api/user": "/user",
  },
  on: {
    proxyReq: (proxyReq, req) => {
      if (req.user?.id) {
        proxyReq.setHeader("x-user-id", String(req.user.id));
      }
      if (req.user?.email) {
        proxyReq.setHeader("x-user-email", String(req.user.email));
      }
    },
    proxyRes: () => {},
  },
  onError: (err, req, res) => {
    res.status(503).json({
      success: false,
      statusCode: 503,
      message: "user service is down",
      errors: [],
    });
  },
});

const notesProxy = createProxyMiddleware({
  target: "http://localhost:6104",
  changeOrigin: true,
  pathRewrite: {
    "^/api/notes": "/notes",
  },
  on: {
    proxyReq: (proxyReq, req) => {
      if (req.user?.id) {
        proxyReq.setHeader("x-user-id", String(req.user.id));
      }
      if (req.user?.email) {
        proxyReq.setHeader("x-user-email", String(req.user.email));
      }
    },
    proxyRes: () => {},
  },
  onError: (err, req, res) => {
    res.status(503).json({
      success: false,
      statusCode: 503,
      message: "Notes service unavailable",
      errors: [],
    });
  },
});

// bind ALL THE routes here
router.use("/api/auth", authProxy);
router.use("/api/oauth", oAuthproxy);
router.get("/api/user/users/me", authenticateMiddleware, userProxy);
router.put("/api/user/users/me", authenticateMiddleware, userProxy);
router.delete("/api/user/users/me", authenticateMiddleware, userProxy);
router.get("/api/user/users/:id", userProxy);
router.get("/api/notes", authenticateMiddleware, notesProxy);
router.post("/api/notes", authenticateMiddleware, notesProxy);
router.get("/api/notes/:id", authenticateMiddleware, notesProxy);
router.put("/api/notes/:id", authenticateMiddleware, notesProxy);
router.delete("/api/notes/:id", authenticateMiddleware, notesProxy);
router.post("/api/notes/:id/tags", authenticateMiddleware, notesProxy);
router.delete("/api/notes/:id/tags/:tagId", authenticateMiddleware, notesProxy);

export default router;
