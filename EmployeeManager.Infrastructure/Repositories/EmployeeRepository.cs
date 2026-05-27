// ============================================================================
// EMPLOYEEREPOSITORY.CS — Concrete implementation of IEmployeeRepository.
//
// PROJECT: EmployeeManager.Infrastructure
//
// This class IMPLEMENTS the IEmployeeRepository interface defined in Domain.
// It uses JsonDataStore<Employee> to read/write employee data to a JSON file.
//
// RESPONSIBILITY: Pure data access — NO business logic here!
// Business rules (like "email must be unique") are in the Service layer.
// This layer only knows how to read and write data.
//
// PATTERN FLOW:
//   Controller → Service → [THIS REPOSITORY] → JsonDataStore → employees.json
//
// DEPENDENCY INJECTION:
// In Program.cs: builder.Services.AddScoped<IEmployeeRepository, EmployeeRepository>();
// When any class asks for IEmployeeRepository, .NET creates an EmployeeRepository
// and injects the JsonDataStore<Employee> into its constructor.
//
// TO SWAP TO SQL SERVER:
// Create a SqlEmployeeRepository implementing IEmployeeRepository,
// change ONE line in Program.cs, and nothing else needs to change.
// ============================================================================

using EmployeeManager.Domain.Models;         // Import Employee model
using EmployeeManager.Domain.Repositories;   // Import IEmployeeRepository interface
using EmployeeManager.Infrastructure.Data;   // Import JsonDataStore

namespace EmployeeManager.Infrastructure.Repositories;

/// <summary>
/// JSON file-backed implementation of IEmployeeRepository.
/// All operations read from and write to employees.json via JsonDataStore.
/// </summary>
public class EmployeeRepository : IEmployeeRepository
// ^^^ ": IEmployeeRepository" means this class PROMISES to implement all methods
//     defined in the IEmployeeRepository interface. If any method is missing,
//     the compiler will throw an error.
{
    // The JsonDataStore that handles reading/writing the JSON file.
    // Injected via constructor (Dependency Injection).
    // 'readonly' means it can only be assigned in the constructor — not changed later.
    private readonly JsonDataStore<Employee> _store;

    /// <summary>
    /// Constructor — receives the data store via Dependency Injection.
    /// .NET automatically provides the JsonDataStore<Employee> that was
    /// registered in Program.cs as a Singleton.
    /// </summary>
    public EmployeeRepository(JsonDataStore<Employee> store)
    {
        _store = store;
    }

    /// <summary>
    /// Returns ALL employees from the JSON file.
    /// Called by: EmployeeService.GetAllEmployeesAsync()
    /// </summary>
    public async Task<IEnumerable<Employee>> GetAllAsync()
    {
        // ReadAllAsync reads the entire employees.json file and deserializes it.
        // Returns a List<Employee> which is also an IEnumerable<Employee>.
        return await _store.ReadAllAsync();
    }

    /// <summary>
    /// Finds a single employee by their GUID.
    /// Returns null if no employee with that ID exists.
    /// Called by: EmployeeService for GetById, Update (to check existence), Delete
    /// </summary>
    public async Task<Employee?> GetByIdAsync(Guid id)
    {
        // Read ALL employees, then find the one with the matching ID.
        // Note: With a real database, you'd use a WHERE clause instead of loading everything.
        var employees = await _store.ReadAllAsync();

        // .FirstOrDefault() returns the first matching item, or null if none match.
        // The lambda (e => e.Id == id) is a filter: "find employee where Id equals id"
        return employees.FirstOrDefault(e => e.Id == id);
    }

    /// <summary>
    /// Finds a single employee by their login Username (case-insensitive).
    /// Returns null if no employee has that username, or has no username at all.
    /// Called by: AuthService during login + refresh.
    /// </summary>
    public async Task<Employee?> GetByUsernameAsync(string username)
    {
        var employees = await _store.ReadAllAsync();
        return employees.FirstOrDefault(e =>
            e.Username != null &&
            e.Username.Equals(username, StringComparison.OrdinalIgnoreCase));
    }

    /// <summary>
    /// Adds a new employee to the JSON file.
    /// Generates a new GUID for the employee's Id before saving.
    /// Returns the employee with the newly generated Id.
    /// </summary>
    public async Task<Employee> CreateAsync(Employee employee)
    {
        // Use ReadModifyWriteAsync to do the read + modify + write under a SINGLE lock.
        // This prevents a race condition where two concurrent requests could both
        // read the same list, each add their employee, and then one overwrites the other.
        await _store.ReadModifyWriteAsync(employees =>
        {
            // Generate a unique ID for the new employee.
            // Guid.NewGuid() creates a random GUID like "3fa85f64-5717-4562-b3fc-2c963f66afa6"
            employee.Id = Guid.NewGuid();

            // Add the new employee to the list
            employees.Add(employee);
        });

        // Return the employee with the generated Id so the API can include it in the response
        return employee;
    }

    /// <summary>
    /// Updates an existing employee by finding their Id and replacing all fields.
    /// Returns null if no employee with that Id exists.
    /// </summary>
    public async Task<Employee?> UpdateAsync(Employee employee)
    {
        Employee? result = null;

        await _store.ReadModifyWriteAsync(employees =>
        {
            // FindIndex returns the position of the matching item, or -1 if not found.
            var index = employees.FindIndex(e => e.Id == employee.Id);

            if (index == -1)
                return; // Employee not found — result stays null

            // Replace the old employee object with the updated one at the same position
            employees[index] = employee;
            result = employee;
        });

        return result;
    }

    /// <summary>
    /// Deletes an employee by their ID.
    /// Returns true if found and removed, false if not found.
    /// </summary>
    public async Task<bool> DeleteAsync(Guid id)
    {
        bool deleted = false;

        await _store.ReadModifyWriteAsync(employees =>
        {
            // Find the employee to delete
            var employee = employees.FirstOrDefault(e => e.Id == id);

            if (employee == null)
                return; // Not found — deleted stays false

            // Remove from the list
            employees.Remove(employee);
            deleted = true;
        });

        return deleted;
    }

    /// <summary>
    /// Checks if an email address is already used by another employee.
    /// Used by the Service layer to enforce unique email validation.
    ///
    /// The excludeId parameter is used during updates:
    /// When updating employee "John", we exclude John's own Id from the check.
    /// Otherwise, John's own email would always fail the uniqueness check!
    /// </summary>
    public async Task<bool> EmailExistsAsync(string email, Guid? excludeId = null)
    {
        var employees = await _store.ReadAllAsync();

        // .Any() returns true if ANY item in the collection matches the condition.
        return employees.Any(e =>
            // Case-insensitive email comparison (john@email.com == John@Email.com)
            e.Email.Equals(email, StringComparison.OrdinalIgnoreCase) &&
            // Exclude a specific employee (used during updates)
            e.Id != excludeId);
    }
}
