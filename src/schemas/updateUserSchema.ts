import sanitizeHtml from "sanitize-html";
import z from "zod";

const plainText = z.string().transform((value) => {
  return sanitizeHtml(value.trim(), {
    allowedTags: [],
    allowedAttributes: {}
  });
});

export const updateUserSchema = z.object({
  firstName: plainText
    .pipe(z.string().min(1, "First name is required"))
    .optional(),
  lastName: plainText
    .pipe(z.string().min(1, "Last name is required"))
    .optional(),
  email: plainText
    .pipe(z.email("Invalid email address").toLowerCase())
    .optional(), // convert email to lowercase to store later in the database
  role: z.enum(["ADMIN", "MANAGER", "CUSTOMER"]).optional(),
  tenantId: z.uuid().optional()
});
