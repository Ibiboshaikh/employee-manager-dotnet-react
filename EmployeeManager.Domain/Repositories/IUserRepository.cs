// ============================================================================
// IUSERREPOSITORY.CS — Interface (contract) for User data access.
//
// PROJECT: EmployeeManager.Domain
//
// Defines what operations are available for user/authentication data.
// Implemented by UserRepository in the Infrastructure project.
// Used by AuthService in the Application project.
//
// Kept separate from IEmployeeRepository (Single Responsibility Principle):
// Employee data and user/auth data are different concerns.
// ============================================================================

using EmployeeManager.Domain.Models;

namespace EmployeeManager.Domain.Repositories;

/// <summary>
/// Repository interface for User data access (authentication).
/// Keeps auth data access separate from employee data access.
/// </summary>
public interface IUserRepository
{
    /// <summary>
    /// Finds a user by their username.
    /// Returns null if no user with that username exists.
    /// Used during login to find the user and verify their password.
    /// </summary>
    Task<User?> GetByUsernameAsync(string username);

    /// <summary>
    /// Creates a new user account in the data store.
    /// Generates a new GUID for the Id.
    /// Used by AuthService to seed the default admin user on first run.
    /// </summary>
    Task<User> CreateAsync(User user);
}
