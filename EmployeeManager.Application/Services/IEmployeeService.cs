// ============================================================================
// IEMPLOYEESERVICE.CS — Interface for Employee business logic.
//
// PROJECT: EmployeeManager.Application
//
// Defines WHAT business operations are available for employees.
// Implemented by EmployeeService (in this same project).
// Called by EmployeeController (in the API project).
//
// WHY AN INTERFACE FOR SERVICES?
// Same reason as repositories — it allows:
// 1. The Controller to depend on an abstraction, not a concrete class
// 2. Easy unit testing: mock IEmployeeService to test the Controller in isolation
// 3. Swappable implementations (though less common for services than repositories)
//
// TUPLE RETURNS: (Employee?, string?)
// Some methods return a tuple with two values:
// - Employee? — the result object (null if there was an error)
// - string? — an error message (null if operation was successful)
// This lets the Controller know WHAT went wrong, not just that something failed.
// ============================================================================

using EmployeeManager.Domain.Models;

namespace EmployeeManager.Application.Services;

/// <summary>
/// Service interface for Employee business operations.
/// The Controller calls these methods — they contain validation and business rules.
/// </summary>
public interface IEmployeeService
{
    /// <summary>Get all employees. No business logic — just delegates to repository.</summary>
    Task<IEnumerable<Employee>> GetAllEmployeesAsync();

    /// <summary>Get one employee by ID. Returns null if not found.</summary>
    Task<Employee?> GetEmployeeByIdAsync(Guid id);

    /// <summary>
    /// Create a new employee after validating business rules.
    /// Returns (createdEmployee, null) on success.
    /// Returns (null, errorMessage) on failure (e.g., duplicate email).
    /// </summary>
    Task<(Employee? Employee, string? Error)> CreateEmployeeAsync(Employee employee);

    /// <summary>
    /// Update an existing employee after validating business rules.
    /// Returns (updatedEmployee, null) on success.
    /// Returns (null, errorMessage) on failure (e.g., employee not found, duplicate email).
    /// </summary>
    Task<(Employee? Employee, string? Error)> UpdateEmployeeAsync(Employee employee);

    /// <summary>
    /// Delete an employee by ID.
    /// Returns true if deleted, false if not found.
    /// </summary>
    Task<bool> DeleteEmployeeAsync(Guid id);
}
