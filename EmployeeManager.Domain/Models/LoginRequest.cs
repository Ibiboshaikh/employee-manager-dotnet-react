// ============================================================================
// LOGINREQUEST.CS & LOGINRESPONSE.CS — DTOs for authentication.
//
// PROJECT: EmployeeManager.Domain
//
// DTO = Data Transfer Object. These are simple classes used to transfer data
// between layers. They contain NO logic — just properties.
//
// LoginRequest: what the React frontend SENDS to the API (username + password)
// LoginResponse: what the API SENDS BACK to React (token + user info)
//
// WHY DTOs?
// We don't want to send the full User object (with PasswordHash) back to the client.
// DTOs let us control exactly what data crosses the wire.
//
// FLOW:
//   React sends → { username: "admin", password: "admin123" } → LoginRequest
//   API responds ← { token: "eyJ...", fullName: "Admin", role: "Admin" } ← LoginResponse
// ============================================================================

namespace EmployeeManager.Domain.Models;

/// <summary>
/// DTO sent from the React login form to the Auth API.
/// Contains only the fields needed for authentication.
///
/// The React frontend sends this as JSON in the POST body:
///   { "username": "admin", "password": "admin123" }
///
/// ASP.NET automatically deserializes the JSON into this class
/// (this is called "model binding" — [FromBody] in the controller).
/// </summary>
public class LoginRequest
{
    /// <summary>The username to authenticate with.</summary>
    public string Username { get; set; } = string.Empty;

    /// <summary>
    /// The plain-text password to verify.
    /// This is hashed and compared against the stored PasswordHash — never stored directly.
    /// </summary>
    public string Password { get; set; } = string.Empty;
}

/// <summary>
/// DTO returned to the React app after successful login.
/// Contains a JWT token that the frontend stores and sends with every subsequent request.
///
/// The API returns this as JSON:
///   { "token": "eyJhbGci...", "fullName": "System Administrator", "role": "Admin" }
///
/// The React frontend stores token in localStorage and sends it in the
/// Authorization header: "Bearer eyJhbGci..."
/// </summary>
public class LoginResponse
{
    /// <summary>
    /// JWT token string.
    /// The React app stores this in localStorage and includes it in the
    /// "Authorization: Bearer {token}" header for all API requests.
    /// Valid for 24 hours (configured in AuthService).
    /// </summary>
    public string AccessToken { get; set; } = string.Empty;

    /// <summary>
    /// Display name to show in the UI (e.g., in the navbar greeting: "Hello, System Administrator").
    /// </summary>
    public string FullName { get; set; } = string.Empty;

    /// <summary>
    /// User role for conditional UI rendering.
    /// The React app can show/hide features based on role (e.g., admin panel).
    /// </summary>
    public string Role { get; set; } = string.Empty;

    /// <summary>
    /// Expiration time of the JWT token in seconds since Unix epoch.
    /// The React app can use this to automatically log out the user when the token expires.
    /// </summary>
    public int ExpiresIn { get; set; }

    /// <summary>
    /// Indicates whether the user must change their password on next login.
    /// </summary>
    public bool MustChangePassword { get; set; }
}
