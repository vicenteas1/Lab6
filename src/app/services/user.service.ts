import { UserClass } from '../models/user.model.js';
import { ApiResponse } from '../models/api-response.model.js';
import { LoginResult } from '../interfaces/login.interface.js';

export type SafeUser = Pick<UserClass, "id" | "username" | "email" | "role" | "fech_creacion" | "fech_modif">;
export interface UserService {
  create(data: Partial<UserClass>): Promise<ApiResponse<UserClass | null>>;
  login(data: Partial<UserClass>): Promise<ApiResponse<LoginResult | null>>;
  verifyToken(user: Partial<UserClass>, refresh: boolean): Promise<ApiResponse<{ valid: boolean; user: Partial<UserClass>; token?: string }>>;
  updateById(id: string, update: Partial<UserClass>): Promise<ApiResponse<UserClass | null>>;
}
