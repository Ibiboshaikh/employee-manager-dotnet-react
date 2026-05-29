import { z } from "zod";

// Single source of truth for runtime validation AND the TS form type
// (see z.infer below). Add a field here → the type and rules both update.
export const employeeSchema = z.object({
  firstName: z.string().min(1, "First Name is required"),
  lastName: z.string().min(1, "Last Name is required"),
  email: z.string().min(1, "Email is required").email("Invalid email address format"),
  phoneNumber: z.string().min(1, "Phone Number is required"),
  department: z.string().min(1, "Department is required"),
  position: z.string().min(1, "Position is required"),
  // z.number() NOT z.coerce.number(): coercion lives in the form layer via
  // RHF's `valueAsNumber: true` on the salary register. Keeping coercion out
  // of Zod means input === output, so useForm<EmployeeFormData> and
  // zodResolver share one type — no `as any` cast needed.
  salary: z.number({ message: "Salary must be a valid number" }).positive("Salary must be greater than zero"),
  dateOfJoining: z.string().min(1, "Date of Joining is required"),
  isActive: z.boolean(),
  mustChangePassword: z.boolean(),
});

// z.infer derives the type FROM the schema. Don't hand-write a parallel
// interface — the two drift the moment a field is added on one side only.
export type EmployeeFormData = z.infer<typeof employeeSchema>;