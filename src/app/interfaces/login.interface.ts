import { UserClass } from "../models/user.model.js";

type SafeUser = Pick<UserClass, "id" | "username" | "email" | "role" | "fech_creacion" | "fech_modif">;

export interface LoginResult { 
    token: string; 
    user: SafeUser 
};