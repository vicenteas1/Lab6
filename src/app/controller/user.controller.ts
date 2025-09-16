import { ApiResponse } from "../models/api-response.model.js";
import { UserService } from "../services/user.service.js";
import { Logger } from "../config/logger.js";
import { Request, Response } from "express";

export class UserController {
  constructor(private service: UserService) {}

  async create(req: Request, res: Response) {
    Logger.info("Iniciando creacion usuario");
    try {
      const createdBy = process.env.SYSTEM_USER_ID;
      const response = await this.service.create({ ...req.body, createdBy });
      res.status(response.code).json(response);
    } catch (err) {
      res.status(400).json({ message: "No se pudo crear el usuario", error: String(err) });
    }
  }

  async login(req: Request, res: Response) {
    Logger.info("Iniciando login");
    try {
      const response = await this.service.login({ ...req.body });
      res.status(response.code).json(response);
    } catch (err) {
      res.status(400).json({ message: "No se pudo iniciar sesion", error: String(err) });
    }
  }

  async verifytoken(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      if (!user?.id) return res.status(401).json(new ApiResponse(401, "Acceso no autorizado", null));

      const response = await this.service.verifyToken(user, false);
      return res.status(response.code).json(response);
    } catch (err) {
      return res.status(500).json({ message: "Error verificando token", error: String(err) });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const response = await this.service.updateById(id, req.body);
      if (!response) return res.status(404).json({ message: "Usuario no encontrado" });
      res.status(response.code).json(response);
    } catch (err) {
      res.status(400).json({ message: "No se pudo actualizar", error: String(err) });
    }
  }
}
