import { NextFunction, Request, Response } from "express";

// write middleware to set CORS headers
export function addCorsHeaders() {
  return function addCorsHeadersMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
    next();
  };
}
