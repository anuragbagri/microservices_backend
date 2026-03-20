import ApiError from "../utils/ApiError.js";
import jwt from "jsonwebtoken";

function authenticateMiddleware(req, res, next) {
  try {
    const authorizationToken = req.headers.authorization;
    if (!authorizationToken || !authorizationToken.startsWith("Bearer ")) {
      return next(new ApiError(401, "Unauthorized"));
    }

    const token = authorizationToken.split(" ")[1];
    if (!token) {
      return next(new ApiError(401, "Unauthorized"));
    }

    const jwt_secret = process.env.JWT_SECRET ?? "";
    try {
      const payload = jwt.verify(token, jwt_secret, { algorithms: ["HS256"] });
      if (!payload) {
        return next(new ApiError(401, "Invalid or expired token"));
      }

      req.user = { id: payload.id, email: payload.email };
      req.headers["x-user-id"] = payload.id;
      req.headers["x-user-email"] = payload.email;
      return next();
    } catch (err) {
      if (err instanceof ApiError) {
        return next(err);
      }
      return next(new ApiError(401, "Invalid or expired token"));
    }
  } catch (err) {
    if (err instanceof ApiError) {
      return next(err);
    }
    return next(err);
  }
}

export default authenticateMiddleware;
