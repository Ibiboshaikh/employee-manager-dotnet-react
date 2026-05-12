// ============================================================================
// USERREPOSITORY.CS — Concrete implementation of IUserRepository.
//
// PROJECT: EmployeeManager.Infrastructure
//
// Handles reading/writing User data to users.json via JsonDataStore.
// Used by AuthService for login verification and default user seeding.
//
// REGISTERED IN DI (Program.cs):
//   builder.Services.AddScoped<IUserRepository, UserRepository>();
// ============================================================================

using EmployeeManager.Domain.Models;         // Import User model
using EmployeeManager.Domain.Repositories;   // Import IUserRepository interface
using EmployeeManager.Infrastructure.Data;   // Import JsonDataStore

namespace EmployeeManager.Infrastructure.Repositories;

/// <summary>
/// JSON file-backed implementation of IUserRepository.
/// Reads/writes user data to users.json.
/// </summary>
public class UserRepository : IUserRepository
{
    // The JsonDataStore for User objects — reads/writes users.json
    private readonly JsonDataStore<User> _store;

    /// <summary>
    /// Constructor — receives JsonDataStore<User> via Dependency Injection.
    /// </summary>
    public UserRepository(JsonDataStore<User> store)
    {
        _store = store;
    }

    /// <summary>
    /// Finds a user by their username (case-insensitive comparison).
    /// Returns null if no user with that username exists.
    ///
    /// Called by AuthService during:
    ///   - Login: to find the user and verify their password
    ///   - Seed: to check if the default admin user already exists
    /// </summary>
    public async Task<User?> GetByUsernameAsync(string username)
    {
        // Read all users from users.json
        var users = await _store.ReadAllAsync();

        // Find the user with a matching username (case-insensitive).
        // OrdinalIgnoreCase means "admin" == "Admin" == "ADMIN"
        return users.FirstOrDefault(u =>
            u.Username.Equals(username, StringComparison.OrdinalIgnoreCase));
    }

    /// <summary>
    /// Creates a new user account in users.json.
    /// Generates a new GUID for the user's Id.
    /// Called by AuthService to seed the default admin user.
    /// </summary>
    public async Task<User> CreateAsync(User user)
    {
        // Atomic read-modify-write to prevent concurrent writes from losing data
        await _store.ReadModifyWriteAsync(users =>
        {
            // Generate a unique ID for the new user
            user.Id = Guid.NewGuid();

            // Add to the list
            users.Add(user);
        });

        return user;
    }
}
