// ============================================================================
// EMPLOYEE.CS — The Employee domain model (entity).
//
// PROJECT: EmployeeManager.Domain (the innermost layer — no dependencies)
//
// This class defines WHAT an employee looks like — its properties/fields.
// It's used by ALL other layers:
//   - Infrastructure uses it to read/write to JSON files
//   - Application uses it for business logic and validation
//   - API uses it as the request/response body for HTTP endpoints
//
// ANALOGY: This is like a database table definition.
// Each property = a column. Each instance = a row.
//
// WHY IN DOMAIN?
// Models are the foundation of your application. They should have
// ZERO dependencies on other projects. This way, you can share them
// everywhere without creating circular dependencies.
// ============================================================================

// Namespace groups related classes together.
// Other files use "using EmployeeManager.Domain.Models;" to access this class.
namespace EmployeeManager.Domain.Models;

/// <summary>
/// Represents an employee entity in the system.
/// This is the core domain model used across all layers (Repository -> Service -> Controller).
/// </summary>
public class Employee
{
    /// <summary>
    /// Unique identifier for the employee.
    /// Auto-generated as a GUID (Globally Unique Identifier) when created.
    /// Example: "3fa85f64-5717-4562-b3fc-2c963f66afa6"
    /// GUIDs are used instead of auto-increment integers because they're
    /// globally unique — no conflicts even across distributed systems.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Employee's first name. Required field.
    /// Initialized to empty string to avoid null reference warnings.
    /// </summary>
    public string FirstName { get; set; } = string.Empty;

    /// <summary>
    /// Employee's last name. Required field.
    /// </summary>
    public string LastName { get; set; } = string.Empty;

    /// <summary>
    /// Employee's email address. Must be unique across all employees.
    /// The uniqueness check is enforced in the Service layer (EmployeeService).
    /// </summary>
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// Employee's department (e.g., "Engineering", "HR", "Finance").
    /// The React frontend provides a dropdown with predefined options.
    /// </summary>
    public string Department { get; set; } = string.Empty;

    /// <summary>
    /// Employee's job title/position (e.g., "Senior Developer", "Project Manager").
    /// </summary>
    public string Position { get; set; } = string.Empty;

    /// <summary>
    /// Annual salary in USD.
    /// 'decimal' is used instead of 'double' for financial values because
    /// decimal has exact precision (no floating-point rounding errors).
    /// The Service layer validates that this can't be negative.
    /// </summary>
    public decimal Salary { get; set; }

    /// <summary>
    /// Date when the employee joined the company.
    /// Stored as DateTime. The React frontend sends it as an ISO 8601 string
    /// (e.g., "2024-01-15") and ASP.NET automatically parses it.
    /// </summary>
    public DateTime DateOfJoining { get; set; }

    /// <summary>
    /// Indicates if the employee record is currently active.
    /// Defaults to true. Inactive employees can be filtered out in the UI.
    /// </summary>
    public bool IsActive { get; set; } = true;
    public string PhoneNumber { get; set; } = string.Empty;
    
}
