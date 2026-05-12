// ============================================================================
// EMPLOYEESERVICE.CS — Business logic for Employee operations.
//
// PROJECT: EmployeeManager.Application
//
// THIS IS WHERE BUSINESS RULES LIVE:
// - Validates that email addresses are unique
// - Validates that salary is not negative
// - Checks that an employee exists before updating
// - Logs operations for debugging/monitoring
//
// LAYER RESPONSIBILITIES:
// - Controller: handles HTTP (status codes, routing) — THIN, no logic
// - Service (THIS): handles business rules (validation, decisions) — THICK with logic
// - Repository: handles data access (read/write) — no decisions, just CRUD
//
// WHY SEPARATE FROM CONTROLLER?
// If business logic was in the Controller, you couldn't reuse it.
// For example, if you later add a background job that creates employees,
// it would call this Service directly (skipping the Controller/HTTP layer).
//
// TUPLE RETURNS PATTERN: (Employee?, string?)
// Instead of throwing exceptions for business rule violations,
// we return a tuple: (result, error).
// - (employee, null) → success, Controller returns 200 OK
// - (null, "message") → failure, Controller returns 400 Bad Request
// This makes error handling explicit and avoids exception overhead.
// ============================================================================

using EmployeeManager.Domain.Models;         // Employee model
using EmployeeManager.Domain.Repositories;   // IEmployeeRepository interface
using Microsoft.Extensions.Logging;          // ILogger for structured logging

namespace EmployeeManager.Application.Services;

/// <summary>
/// Employee service — implements business logic and validation.
/// Sits between the Controller and Repository layers.
/// </summary>
public class EmployeeService : IEmployeeService
{
    // The repository for data access — injected via DI.
    // We depend on the INTERFACE (IEmployeeRepository), not the concrete class.
    // This is Dependency Inversion: we don't know (or care) if it's JSON, SQL, etc.
    private readonly IEmployeeRepository _repository;

    // Logger for structured logging — injected via DI.
    // ILogger<EmployeeService> tags all log entries with the class name.
    // Logs are written to console and file via Serilog (configured in Program.cs).
    private readonly ILogger<EmployeeService> _logger;

    /// <summary>
    /// Constructor — dependencies are injected automatically by .NET's DI container.
    /// This is called "Constructor Injection" — the most common DI pattern.
    /// </summary>
    public EmployeeService(IEmployeeRepository repository, ILogger<EmployeeService> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    /// <summary>
    /// Get all employees — no business logic needed, just delegates to repository.
    /// </summary>
    public async Task<IEnumerable<Employee>> GetAllEmployeesAsync()
    {
        // Log that we're fetching employees (useful for debugging/monitoring)
        _logger.LogInformation("Fetching all employees");

        // Simply pass through to the repository
        return await _repository.GetAllAsync();
    }

    /// <summary>
    /// Get one employee by ID — no business logic, just a pass-through.
    /// </summary>
    public async Task<Employee?> GetEmployeeByIdAsync(Guid id)
    {
        // Structured logging: {EmployeeId} creates a named parameter in the log entry.
        // In Serilog, this becomes searchable metadata (not just a string).
        _logger.LogInformation("Fetching employee with ID: {EmployeeId}", id);
        return await _repository.GetByIdAsync(id);
    }

    /// <summary>
    /// Create a new employee — validates business rules BEFORE saving.
    /// Returns (employee, null) on success or (null, errorMessage) on failure.
    /// </summary>
    public async Task<(Employee? Employee, string? Error)> CreateEmployeeAsync(Employee employee)
    {
        // ── BUSINESS RULE 1: Email must be unique ──────────────────────
        // Check if any other employee already has this email address.
        // No excludeId parameter because this is a new employee (doesn't exist yet).
        if (await _repository.EmailExistsAsync(employee.Email))
        {
            _logger.LogWarning("Attempted to create employee with duplicate email: {Email}", employee.Email);

            // Return failure tuple: no employee, with error message.
            // The Controller will return HTTP 400 Bad Request with this message.
            return (null, "An employee with this email already exists.");
        }

        // ── BUSINESS RULE 2: Salary must be positive ───────────────────
        if (employee.Salary < 0)
        {
            return (null, "Salary cannot be negative.");
        }
        else if (employee.Salary > 1000000)
        {
            return (null, "Salary cannot exceed 1,000,000.");
        }

        // All validations passed — save the employee via the repository
        var created = await _repository.CreateAsync(employee);

        // Log the successful creation with structured parameters
        _logger.LogInformation("Created new employee: {EmployeeName} ({EmployeeId})",
            $"{created.FirstName} {created.LastName}", created.Id);

        // Return success tuple: employee with data, no error
        return (created, null);
    }

    /// <summary>
    /// Update an existing employee — validates existence and business rules.
    /// </summary>
    public async Task<(Employee? Employee, string? Error)> UpdateEmployeeAsync(Employee employee)
    {
        // ── CHECK EXISTENCE ────────────────────────────────────────────
        // Verify the employee exists before trying to update
        var existing = await _repository.GetByIdAsync(employee.Id);
        if (existing == null)
        {
            _logger.LogWarning("Attempted to update non-existent employee: {EmployeeId}", employee.Id);
            return (null, "Employee not found.");
        }

        // ── BUSINESS RULE: Unique email (excluding this employee) ──────
        // Pass employee.Id as excludeId so the employee's OWN email doesn't trigger the check.
        // Example: If John's email is john@test.com and he's not changing it,
        //          we need to skip John's record when checking for duplicates.
        if (await _repository.EmailExistsAsync(employee.Email, employee.Id))
        {
            _logger.LogWarning("Attempted to update employee with duplicate email: {Email}", employee.Email);
            return (null, "An employee with this email already exists.");
        }

        // Validation passed — perform the update
        var updated = await _repository.UpdateAsync(employee);
        _logger.LogInformation("Updated employee: {EmployeeId}", employee.Id);
        return (updated, null);
    }

    /// <summary>
    /// Delete an employee — returns true if deleted, false if not found.
    /// </summary>
    public async Task<bool> DeleteEmployeeAsync(Guid id)
    {
        var result = await _repository.DeleteAsync(id);

        // Log the outcome
        if (result)
            _logger.LogInformation("Deleted employee: {EmployeeId}", id);
        else
            _logger.LogWarning("Attempted to delete non-existent employee: {EmployeeId}", id);

        return result;
    }
}
