import { ApiResponse } from '@models/api-response.model.js';
import { ProductService } from '@services/product.service.js';
import { ProductClass, ProductModel } from "@models/product.model.js";
import { Logger } from 'config/logger';
import { Types } from 'mongoose';

export class ProductServiceImpl implements ProductService {
  async create(data: Partial<ProductClass>): Promise<ApiResponse<ProductClass>> {
    try {
      Logger.info(`New product data: ${JSON.stringify(data)}`);
      const saved = await ProductModel.create({
        nombre: data.nombre,
        descripcion: data.descripcion,
        precio: data.precio,
        createdBy: data.createdBy,
        updatedBy: data.updatedBy,
      });

      return new ApiResponse<ProductClass>(201, "OK", saved);
    } catch (error: any) {
      const response = new ApiResponse(400, 'NOK', error);
      throw new Error(response.toString())
    }
  }

  async readAll(): Promise<ApiResponse<ProductClass[]>> {
    try {
      const products = await ProductModel.find();
      return new ApiResponse<ProductClass[]>(200, "OK", products);
    } catch (error: any) {
      return new ApiResponse<ProductClass[]>(500, "NOK", error.message ?? error);
    }
  }

  async findById(id: string): Promise<ApiResponse<ProductClass | null>> {
    try {
      if (!this.validateId(id)) {
        return new ApiResponse<ProductClass | null>(400, "ID inválido", null);
      }
      const product = await ProductModel.findById(id);
      if (!product) {
        return new ApiResponse<ProductClass | null>(404, "Producto no encontrado", null);
      }
      return new ApiResponse<ProductClass | null>(200, "OK", product);
    } catch (error: any) {
      return new ApiResponse<ProductClass | null>(500, "NOK", error.message ?? String(error));
    }
  }

  async updateById(id: string, update: Partial<ProductClass>): Promise<ApiResponse<ProductClass | null>> {
    try {
      if (!this.validateId(id)) {
        return new ApiResponse<ProductClass | null>(400, "ID inválido", null);
      }

      const allowed: (keyof Partial<ProductClass>)[] = ["nombre", "descripcion", "precio", "updatedBy"];
      const $set: Record<string, unknown> = {};

      for (const key of allowed) {
        const value = update[key];
        if (value !== undefined) {
          $set[key as string] = value;
        }
      }

      if (Object.keys($set).length === 0) {
        return new ApiResponse<ProductClass | null>(400, "Nada para actualizar", null);
      }

      const updated = await ProductModel.findByIdAndUpdate(
        id,
        { $set },
        { new: true, runValidators: true, timestamps: true }
      );

      if (!updated) {
        return new ApiResponse<ProductClass | null>(404, "Producto no encontrado", null);
      }

      return new ApiResponse<ProductClass>(200, "OK", updated);
    } catch (error: any) {
      return new ApiResponse<ProductClass>(500, "NOK", error.message ?? String(error));
    }
  }
  
  async deleteById(id: string): Promise<ApiResponse<ProductClass | null>> {
    try {
      if (!this.validateId(id)) {
        return new ApiResponse<ProductClass | null>(400, "ID inválido", null);
      }
      const deleted = await ProductModel.findByIdAndDelete(id);
      if (!deleted) {
        return new ApiResponse<ProductClass | null>(404, "Producto no encontrado", null);
      }
      return new ApiResponse<ProductClass | null>(200, "OK", deleted);
    } catch (error: any) {
      return new ApiResponse<ProductClass | null>(500, "NOK", error.message ?? String(error));
    }
  }

  private validateId(id: string): boolean {
    return Types.ObjectId.isValid(id);
  }
}
