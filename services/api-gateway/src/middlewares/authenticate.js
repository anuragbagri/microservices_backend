import ApiError from "../utils/ApiError";
import jwt from "jsonwebtoken";

function authenticateMiddleware(req, res, next) {
  try {
    const authorizationToken = req.headers.authorization;
    if (!authorizationToken || !authorizationToken.startsWith("Bearer")) {
      next(new ApiError("Unauthorized", 401));
    }
    const token = authorizationToken.split(" ")[1];
    const jwt_secret = process.env.JWT_SECRET ?? "";
    try {
      const payload = jwt.verify(token, jwt_secret, { algorithms: ["HS256"] });
      if (!payload) {
        throw new ApiError(400, "not authorized");
      }
      req.user = { id: payload.id, email: payload.email };
      req.headers["x-user-id"] = payload.id;
      req.headers["x-user-email"] = payload.email;
      next();
    } catch (err) {
      if (err instanceof ApiError) {
        next(err);
      }
      next(new ApiError(400, "jsontokenexpired"));
    }
  } catch (err) {
    if (err instanceof ApiError) {
      next(ApiError);
    }
    next(new ApiError(401, "Invalid or expired token"));
  }
}

export default authenticateMiddleware;
