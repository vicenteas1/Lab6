import { ApiResponse } from '../../models/api-response.model.js';
import { UserService } from '../../services/user.service.js';
import { UserClass, UserModel } from "../../models/user.model.js";
import { Logger } from '../../config/logger.js';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { LoginResult } from '../../interfaces/login.interface.js';
import { Types } from 'mongoose';

type SafeUser = Pick<UserClass, "id" | "username" | "email" | "role" | "fech_creacion" | "fech_modif">;

export class UserServiceImpl implements UserService {
  async create(data: Partial<UserClass>): Promise<ApiResponse<UserClass | null>> {
    try {
      Logger.info(
        `New user data: ${JSON.stringify({
          ...data,
          password: data.password ? "[REDACTED]" : undefined,
        })}`
      );

      const username = data.username?.trim();
      const email = data.email?.toLowerCase().trim();
      const password = data.password;
      const role = data?.role;

      if (!username || !email || !password) {
        return new ApiResponse<UserClass | null>(400, "Faltan campos obligatorios (username, email, password)", null);
      }

      const hashed = await this.encryptPwd(password);

      const saved = await UserModel.create({
        username,
        email,
        password: hashed,
        role: role ?? 'buyer'
      });

      return new ApiResponse<UserClass | null>(201, "OK", saved);
    } catch (error: any) {
      return new ApiResponse<UserClass | null>(400, error?.message ?? "NOK", null);
    }
  }

  async login(data: Partial<UserClass>): Promise<ApiResponse<LoginResult | null>> {
    try {
      const email = data.email?.toLowerCase().trim();
      const password = data.password;

      if (!email || !password) {
        return new ApiResponse<LoginResult | null>(400, "Faltan campos obligatorios.", null);
      }

      const foundUser = await UserModel.findOne({ email });
      if (!foundUser) {
        return new ApiResponse<LoginResult | null>(404, "Usuario no encontrado", null);
      }

      const ok = await bcryptjs.compare(password, foundUser.password);
      if (!ok) {
        return new ApiResponse<LoginResult | null>(401, "Credenciales inválidas", null);
      }

      const payload = {
        user: { id: foundUser.id, email: foundUser.email, role: foundUser.role }
      }
      const token = jwt.sign(
        payload,
        (process.env.JWT_SECRET as string),
        { expiresIn: "30m" }
      );

      const safe: SafeUser = {
        id: foundUser.id,
        username: foundUser.username,
        email: foundUser.email,
        role: foundUser.role,
        fech_creacion: (foundUser as any).fech_creacion,
        fech_modif: (foundUser as any).fech_modif,
      };

      return new ApiResponse<LoginResult | null>(200, "OK", { token, user: safe });
    } catch (error: any) {
      return new ApiResponse<LoginResult | null>(500, error?.message ?? "NOK", null);
    }
  }

  async verifyToken(user: Partial<UserClass>, refresh: boolean = false): Promise<ApiResponse<{ valid: boolean; user: Partial<UserClass>; token?: string }>> {
    try {
      const foundUser = await UserModel.findById(user.id);

      if (!foundUser) {
        return new ApiResponse(401, "Sesión inválida (usuario no existe)", null as any);
      }

      const safe: SafeUser = {
        id: foundUser.id,
        username: foundUser.username,
        email: foundUser.email,
        role: foundUser.role,
        fech_creacion: (foundUser as any).fech_creacion,
        fech_modif: (foundUser as any).fech_modif,
      };

      let token: string | undefined;
      if (refresh) {
        token = jwt.sign(
          { id: user.id, email: user.email, role: user.role },
          process.env.JWT_SECRET as string,
          { expiresIn: "1d" }
        );
      }

      return new ApiResponse(200, "OK", { valid: true, user: safe, ...(token ? { token } : {}) });
    } catch (error: any) {
      return new ApiResponse(500, "NOK", { valid: false, user: null as any });
    }
  }

  async updateById(id: string, update: Partial<UserClass>): Promise<ApiResponse<UserClass | null>> {
    try {
      if (!this.validateId(id)) {
        return new ApiResponse<UserClass | null>(400, "ID inválido", null);
      }
      const foundUser = await UserModel.findById(id);

      if (!foundUser) {
        return new ApiResponse(401, "Usuario no existe.", null as any);
      }

      const $set: Record<string, unknown> = {};

      if (update.username !== undefined) {
        const username = String(update.username).trim();
        if (!username) {
          return new ApiResponse<UserClass | null>(400, "Nombre de usuario incorrecto.", null);
        }
        $set.username = username;
      }

      if (update.email !== undefined) {
        const email = String(update.email).toLowerCase().trim();
        const emailRe = /^\S+@\S+\.\S+$/;
        if (!emailRe.test(email)) {
          return new ApiResponse<UserClass | null>(400, "Correo incorrecto.", null);
        }
        $set.email = email;
      }

      if (update.password !== undefined) {
        const pwd = String(update.password);
        if (pwd.length < 8) {
          return new ApiResponse<UserClass | null>(400, "Contraseña no cumple con el largo minimo.", null);
        }
        $set.password = await bcryptjs.hash(pwd, 10);
      }

      if (update.updatedBy !== undefined) {
        $set.updatedBy = foundUser.username;
      }

      if (Object.keys($set).length === 0) {
        return new ApiResponse<UserClass | null>(400, "Nada para actualizar", null);
      }

      const updated = await UserModel.findByIdAndUpdate(
        id,
        { $set },
        { new: true, runValidators: true, timestamps: true }
      );

      return new ApiResponse<UserClass | null>(200, "OK", updated);
    } catch (error: any) {
      return new ApiResponse<UserClass>(500, "NOK", error.message ?? String(error));
    }
  }

  private async encryptPwd(password: string): Promise<string> {
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);
    return hashedPassword;
  }

  private validateId(id: string): boolean {
    return Types.ObjectId.isValid(id);
  }
}
