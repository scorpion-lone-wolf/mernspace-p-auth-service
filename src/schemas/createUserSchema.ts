import sanitizeHtml from "sanitize-html";
import z from "zod";

const plainText = z.string().transform((value) => {
  return sanitizeHtml(value.trim(), {
    allowedTags: [],
    allowedAttributes: {}
  });
});

export const createUserSchema = z
  .object({
    firstName: plainText.pipe(z.string().min(1, "First name is required")),
    lastName: plainText.pipe(z.string().min(1, "Last name is required")),
    email: plainText.pipe(z.email("Invalid email address").toLowerCase()), // convert email to lowercase to store later in the database
    password: plainText.pipe(
      z.string().min(6, "Password must be at least 6 characters long")
    ),
    role: z.enum(["ADMIN", "MANAGER", "CUSTOMER"]),
    tenantId: z.uuid().optional()
  })
  .superRefine((data, ctx) => {
    if (data.role === "ADMIN" && data.tenantId) {
      ctx.addIssue({
        code: "custom",
        path: ["tenantId"],
        message: "Tenant ID is not allowed for admin users"
      });
    }

    if (data.role === "MANAGER" && !data.tenantId) {
      ctx.addIssue({
        code: "custom",
        path: ["tenantId"],
        message: "Tenant ID is required for managers"
      });
    }
  });
