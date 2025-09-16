import { ProductClass } from '../models/product.model.js';
import { ApiResponse } from '../models/api-response.model.js';


export interface ProductService {
  create(data: Partial<ProductClass>): Promise<ApiResponse<ProductClass | null>>;
  readAll(): Promise<ApiResponse<ProductClass[] | null>>;
  findById(id: string): Promise<ApiResponse<ProductClass | null>>;
  updateById(id: string, update: Partial<ProductClass>): Promise<ApiResponse<ProductClass | null>>;
  deleteById(id: string): Promise<ApiResponse<ProductClass | null>>;
}
