import { UserRole } from "../models/role.model";
import { Request, Response, NextFunction } from "express";

export const requireRole =
  (...allowed: UserRole[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user?.role) {
      return res.status(401).json({ code: 401, message: "No autenticado", data: null });
    }
    if (!allowed.includes(user.role as UserRole)) {
      return res
        .status(403)
        .json({ code: 403, message: `No autorizado: se requiere rol ${allowed.join(" o ")}`, data: null });
    }
    return next();
  };

export const requireBuyer  = requireRole("buyer");
export const requireSeller = requireRole("seller");