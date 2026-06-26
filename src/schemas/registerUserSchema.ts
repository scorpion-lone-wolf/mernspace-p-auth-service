import z from "zod";

export const registerUserSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.email("Invalid email address").toLowerCase(), // convert email to lowercase to store later in the database
  password: z.string().min(6, "Password must be at least 6 characters long")
});
