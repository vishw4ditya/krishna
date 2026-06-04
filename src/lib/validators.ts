import { z } from "zod";

export const branchSchema = z.object({
  name: z.string().min(2).max(120),
  code: z.string().min(2).max(20),
  address: z.string().min(5).max(255),
  phone: z.string().min(7).max(20),
  status: z.enum(["active", "inactive"]).default("active"),
});

export const branchHeadRegistrationSchema = z.object({
  fullName: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().min(7).max(20),
  profileImage: z.string().url().optional(),
  branchId: z.string().min(1),
  password: z.string().min(8).max(100),
});

export const productSchema = z.object({
  title: z.string().min(2).max(140),
  images: z.array(z.string().url()).min(1),
  description: z.string().min(10).max(2000),
  price: z.number().nonnegative(),
  stock: z.number().int().nonnegative(),
  category: z.string().min(2).max(80),
  branchId: z.string().min(1),
  status: z.enum(["active", "inactive"]).default("active"),
});

export const chatMessageSchema = z.object({
  chatId: z.string().optional(),
  branchHeadId: z.string().optional(),
  branchId: z.string().optional(),
  text: z.string().max(2000).optional(),
  image: z.string().url().optional(),
});
