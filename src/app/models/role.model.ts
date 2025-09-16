export const ROLES = ["seller", "buyer"] as const;
export type UserRole = typeof ROLES[number];

export class RoleClass {
  private constructor(public readonly value: UserRole) {}
  static readonly SELLER = new RoleClass("seller");
  static readonly BUYER  = new RoleClass("buyer");
  static values() { return ROLES; }
  static isValid(v: unknown): v is UserRole {
    return typeof v === "string" && (ROLES as readonly string[]).includes(v);
  }
  static from(v: unknown) {
    if (v instanceof RoleClass) return v;
    if (this.isValid(v)) return new RoleClass(v);
    throw new Error(`Rol inválido: ${v}`);
  }
  toString() { return this.value; }
  toJSON()   { return this.value; }
}
