import z from "zod";

const updateTenantSchema = z.object({
  name: z.string().min(2, "Tenant name is required").optional(),
  address: z.string().min(5, "Tenant address is required").optional()
});

export default updateTenantSchema;
