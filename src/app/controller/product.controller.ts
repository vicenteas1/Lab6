import { ProductService } from "../services/product.service.js";
import { Logger } from "../config/logger.js";
import { Request, Response } from "express";

export class ProductController {
  constructor(private service: ProductService) {}

  async create(req: Request, res: Response) {
    Logger.info("Iniciando creacion producto");
    try {
      const user = (req as any).user;
      const response = await this.service.create({
        ...req.body,
        createdBy: user.id
      });
      res.status(response.code).json(response);
    } catch (err) {
      res.status(400).json({ message: "No se pudo crear el producto", error: String(err) });
    }
  }

  async readAll(req: Request, res: Response) {
    Logger.info("Iniciando proceso de lectura para todos los productos");
    try {
      const response  = await this.service.readAll();
      res.status(response.code).json(response);
    } catch (err) {
      res.status(500).json({ message: "Error listando productos", error: String(err) });
    }
  }

  async readOne(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const response = await this.service.findById(id);
      if (!response) return res.status(404).json({ message: "Producto no encontrado" });
      res.status(response.code).json(response);
    } catch (err) {
      res.status(400).json({ message: "ID inválido", error: String(err) });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const response = await this.service.updateById(id, req.body);
      if (!response) return res.status(404).json({ message: "Producto no encontrado" });
      res.status(response.code).json(response);
    } catch (err) {
      res.status(400).json({ message: "No se pudo actualizar", error: String(err) });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const response = await this.service.deleteById(id);
      if (!response) return res.status(404).json({ message: "Producto no encontrado" });
      res.status(response.code).json(response);
    } catch (err) {
      return res.status(500).json({ message: "No se pudo eliminar", error: String(err) });
    }
  }
}
