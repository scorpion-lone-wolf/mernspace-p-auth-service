import z from "zod";

export const loginUserSchema = z.object({
  email: z.email("Invalid email address").toLowerCase(), // convert email to lowercase to store later in the database
  password: z.string().min(6, "Password must be at least 6 characters long")
});
