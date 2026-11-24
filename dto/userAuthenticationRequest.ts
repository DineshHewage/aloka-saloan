import { z } from "zod";

const authUserSchema = z.object({
  email: z.email({ message: "Invalid email address" }),

  password: z
    .string({ message: "Password is required" })
    .min(6, { message: "Password must be at least 6 characters long" }),
});

export default authUserSchema;
