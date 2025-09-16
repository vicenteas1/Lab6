import { Schema, model, Document, Types } from "mongoose";

export class ProductClass extends Document {
  nombre!: string;
  descripcion!: string;
  precio!: number;

  createdBy!: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt!: Date;
  updatedAt!: Date;
}

const productSchema = new Schema<ProductClass>(
  {
    nombre: { type: String, required: true },
    descripcion: { type: String, required: true },
    precio: { type: Number, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: { createdAt: "fech_creacion", updatedAt: "fech_modif" } }
);

export const ProductModel = model<ProductClass>("Product", productSchema);
