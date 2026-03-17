import AppError from "../utils/AppError.js";

function authenticate(req, res, next) {
  try {
    const userId = req.headers["x-user-id"];
    const userEmail = req.headers["x-user-email"];

    if (!userId || !userEmail) {
      throw new AppError("Unauthorized", 401);
    }

    req.user = {
      id: String(userId),
      email: String(userEmail),
    };

    return next();
  } catch (err) {
    return next(err instanceof AppError ? err : new AppError("Internal server Error", 500));
  }
}

export default authenticate;
