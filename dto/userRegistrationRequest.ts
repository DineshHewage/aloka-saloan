import { z } from "zod";

const createUserSchema = z.object({
  email: z.email({ message: "Invalid email address" }),
  firstName: z
    .string({ message: "First name is required" })
    .min(2, { message: "First name must be at least 2 characters long" }),
  lastName: z
    .string({ message: "Last name is required" })
    .min(2, { message: "Last name must be at least 2 characters long" }),
  password: z
    .string({ message: "Password is required" })
    .min(6, { message: "Password must be at least 6 characters long" }),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export default createUserSchema;
