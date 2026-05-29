// ============================================================================
// IEMPLOYEEREPOSITORY.CS — Interface (contract) for Employee data access.
//
// PROJECT: EmployeeManager.Domain (innermost layer)
//
// WHAT IS AN INTERFACE?
// An interface defines WHAT operations are available without specifying HOW
// they're implemented. It's a contract: "any class that implements this
// interface MUST provide these methods."
//
// WHY IN DOMAIN?
// By placing the interface here (not in Infrastructure), we follow the
// Dependency Inversion Principle: higher layers depend on ABSTRACTIONS, not
// on concrete implementations.
//
// The Application layer (Services) calls these methods.
// The Infrastructure layer (Repositories) implements them.
// Neither directly depends on the other — they both depend on this interface.
//
// BENEFIT: You can swap the implementation without changing any other code:
//   - JsonEmployeeRepository  → reads/writes JSON files (current)
//   - SqlEmployeeRepository   → reads/writes SQL Server
//   - InMemoryRepository      → for unit testing
//
// Just change ONE line in Program.cs:
//   builder.Services.AddScoped<IEmployeeRepository, SqlEmployeeRepository>();
// ============================================================================

using EmployeeManager.Domain.Models; // Import the Employee model

namespace EmployeeManager.Domain.Repositories;

/// <summary>
/// Defines the contract for Employee data access operations.
/// Implemented by EmployeeRepository in the Infrastructure project.
/// Used by EmployeeService in the Application project.
/// </summary>
public interface IEmployeeRepository
{
    /// <summary>
    /// Gets all employees from the data store.
    /// Returns an empty collection if no employees exist.
    /// </summary>
    Task<IEnumerable<Employee>> GetAllAsync();
    // ^^^ Task<T> means this is an ASYNC method (returns a promise-like object).
    //     IEnumerable<Employee> is a read-only collection of Employee objects.
    //     Async is used because file/database I/O should not block the thread.

    /// <summary>
    /// Gets a single employee by their unique ID.
    /// Returns null if no employee with that ID exists.
    /// </summary>
    Task<Employee?> GetByIdAsync(Guid id);
    // ^^^ Employee? — the '?' means this can return null (nullable reference type).
    //     The caller must handle the null case (employee not found).

    /// <summary>
    /// Gets a single employee by their login username.
    /// Returns null if no employee has that username (or has no username at all).
    /// Used by AuthService during login.
    /// </summary>
    Task<Employee?> GetByUsernameAsync(string username);

    /// <summary>
    /// Creates a new employee in the data store.
    /// The implementation generates a new GUID for the Id property.
    /// Returns the created employee (with the generated Id).
    /// </summary>
    Task<Employee> CreateAsync(Employee employee);

    /// <summary>
    /// Updates an existing employee in the data store.
    /// Finds by Id and replaces all fields.
    /// Returns null if the employee Id doesn't exist.
    /// </summary>
    Task<Employee?> UpdateAsync(Employee employee);

    /// <summary>
    /// Deletes an employee by their ID.
    /// Returns true if the employee was found and deleted.
    /// Returns false if no employee with that ID exists.
    /// </summary>
    Task<bool> DeleteAsync(Guid id);

    /// <summary>
    /// Checks if an email is already in use by another employee.
    /// Used for validation: emails must be unique across all employees.
    ///
    /// The excludeId parameter allows excluding a specific employee from the check.
    /// This is needed during updates: when employee "John" updates their profile,
    /// we need to allow "John's" own email to pass the uniqueness check.
    /// </summary>
    /// <param name="email">The email address to check.</param>
    /// <param name="excludeId">Optional: ID of employee to exclude from the check (for updates).</param>
    Task<bool> EmailExistsAsync(string email, Guid? excludeId = null);
    // ^^^ Guid? — nullable Guid. null means "don't exclude anyone" (for create).
    //     A Guid value means "exclude this employee" (for update).
}
