// ============================================================================
// USER.CS — The User domain model for authentication.
//
// PROJECT: EmployeeManager.Domain
//
// Represents a user who can log into the system.
// User data is stored in users.json (not a database).
// A default "admin" user is seeded automatically on first run.
//
// SECURITY NOTE:
// Passwords are NEVER stored as plain text. We store a hash (one-way transformation).
// This means even if someone reads users.json, they can't see the actual passwords.
// ============================================================================

namespace EmployeeManager.Domain.Models;

/// <summary>
/// Represents a user who can log into the system.
/// Stored in users.json — passwords are hashed, never stored as plain text.
/// </summary>
public class User
{
    /// <summary>
    /// Unique identifier for the user (auto-generated GUID).
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Username used for login. Must be unique.
    /// Compared case-insensitively (e.g., "Admin" and "admin" are the same).
    /// </summary>
    public string Username { get; set; } = string.Empty;

    /// <summary>
    /// Hashed password using HMAC-SHA256.
    /// The hash is a one-way transformation: you can verify a password against it,
    /// but you can't reverse it to get the original password.
    ///
    /// IMPORTANT: In production, use BCrypt or Argon2 instead of HMAC-SHA256.
    /// BCrypt is specifically designed for password hashing (includes salt + work factor).
    /// </summary>
    public string PasswordHash { get; set; } = string.Empty;

    /// <summary>
    /// Display name shown in the UI after login (e.g., "System Administrator").
    /// Included in the JWT token and sent to the React frontend.
    /// </summary>
    public string FullName { get; set; } = string.Empty;

    /// <summary>
    /// Role for basic authorization (e.g., "Admin", "User").
    /// Included in the JWT token as a claim.
    /// Can be used with [Authorize(Roles = "Admin")] on controllers.
    /// Defaults to "User" for new accounts.
    /// </summary>
    public string Role { get; set; } = "User";
}
