// ============================================================================
// IAUTHSERVICE.CS — Interface for authentication operations.
//
// PROJECT: EmployeeManager.Application
//
// Defines the contract for authentication-related business logic:
// - LoginAsync: validates credentials and returns a JWT token
// - SeedDefaultUserAsync: creates a default admin user on first run
//
// Implemented by AuthService in this same project.
// Called by AuthController (API) and Program.cs (for seeding).
// ============================================================================

using EmployeeManager.Domain.Models;

namespace EmployeeManager.Application.Services;

/// <summary>
/// Service interface for authentication operations.
/// </summary>
public interface IAuthService
{
    /// <summary>
    /// Validates login credentials and returns a LoginResponse with JWT token.
    /// Returns null if credentials are invalid (wrong username or password).
    /// </summary>
    Task<LoginResponse?> LoginAsync(LoginRequest request);

    /// <summary>
    /// Seeds a default admin user if no users exist in the data store.
    /// Called once during application startup (in Program.cs).
    /// Default credentials: admin / admin123
    /// </summary>
    Task SeedDefaultUserAsync();
}
