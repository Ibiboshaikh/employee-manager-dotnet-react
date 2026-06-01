// ============================================================================
// AUTHSERVICE.CS — Authentication business logic.
//
// PROJECT: EmployeeManager.Application
//
// This service handles:
// 1. LOGIN: Validates username/password → generates a JWT token
// 2. SEEDING: Creates a default admin user on first application run
// 3. PASSWORD HASHING: One-way transformation so passwords aren't stored as plain text
//
// JWT (JSON Web Token) FLOW:
// 1. React sends { username, password } to POST /api/auth/login
// 2. This service finds the user in users.json
// 3. Hashes the provided password and compares it to the stored hash
// 4. If they match → generates a signed JWT token with user claims
// 5. Returns { token, fullName, role } to React
// 6. React stores the token in localStorage
// 7. React sends "Authorization: Bearer {token}" with every future request
// 8. .NET middleware validates the token automatically on [Authorize] endpoints
//
// WHAT'S IN A JWT TOKEN?
// A JWT has 3 parts: header.payload.signature
// The payload contains "claims" — pieces of info about the user:
//   - Sub (Subject): the username
//   - Name: the display name
//   - Role: the user's role (Admin, User, etc.)
//   - Jti: a unique token ID
//   - Exp: expiration timestamp
// The signature proves the token hasn't been tampered with.
// ============================================================================

using System.IdentityModel.Tokens.Jwt;    // JwtSecurityToken, JwtSecurityTokenHandler
using System.Security.Claims;              // Claim, ClaimTypes
using System.Security.Cryptography;        // HMACSHA256 for password hashing
using System.Text;                         // Encoding.UTF8
using EmployeeManager.Domain.Models;       // User, LoginRequest, LoginResponse
using EmployeeManager.Domain.Repositories; // IUserRepository
using Microsoft.Extensions.Configuration;  // IConfiguration (reads appsettings.json)
using Microsoft.Extensions.Logging;        // ILogger
using Microsoft.IdentityModel.Tokens;      // SymmetricSecurityKey, SigningCredentials

namespace EmployeeManager.Application.Services;

/// <summary>
/// Handles user authentication, JWT token generation, and default user seeding.
/// </summary>
public class AuthService : IAuthService
{
    // Repository for user data access (reads/writes users.json)
    private readonly IEmployeeRepository _employeeRepository;
    private readonly IRefreshTokenStore _refreshTokenStore;
    // Configuration — reads values from appsettings.json
    // Used to get JWT secret key, issuer, and audience.
    // Example: _configuration["Jwt:Secret"] reads the "Secret" value under the "Jwt" section.
    private readonly IConfiguration _configuration;

    // Logger for recording auth events (login attempts, failures, etc.)
    private readonly ILogger<AuthService> _logger;

    /// <summary>
    /// Constructor — all dependencies injected by .NET's DI container.
    /// </summary>
    public AuthService(
        IEmployeeRepository employeeRepository,
        IRefreshTokenStore refreshTokenStore,
        IConfiguration configuration,
        ILogger<AuthService> logger)
    {
        _employeeRepository = employeeRepository;
        _refreshTokenStore = refreshTokenStore;
        _configuration = configuration;
        _logger = logger;
    }

    /// <summary>
    /// Validates login credentials and returns a JWT token on success.
    /// Returns null if the username doesn't exist or the password is wrong.
    ///
    /// FLOW:
    /// 1. Find user by username in the data store
    /// 2. Hash the provided password
    /// 3. Compare the hash against the stored hash
    /// 4. If match → generate and return JWT token
    /// 5. If no match → return null (Controller returns 401 Unauthorized)
    /// </summary>
    public async Task<LoginResponse?> LoginAsync(LoginRequest request)
    {
        _logger.LogInformation("Login attempt for user: {Username}", request.Username);

        // STEP 1: Find the user by username (case-insensitive)
        var user = await _employeeRepository.GetByUsernameAsync(request.Username);
        if (user == null)
        {
            // User doesn't exist — log a warning and return null
            _logger.LogWarning("Login failed — user not found: {Username}", request.Username);
            return null;
            // Note: We intentionally don't reveal whether the USERNAME or PASSWORD was wrong.
            // The Controller returns a generic "Invalid username or password" message.
            // This prevents attackers from discovering valid usernames.
        }

        // STEP 2: Hash the provided password using the same algorithm
        var hash = HashPassword(request.Password);

        // STEP 3: Compare the computed hash with the stored hash
        if (user.PasswordHash != hash)
        {
            _logger.LogWarning("Login failed — invalid password for user: {Username}", request.Username);
            return null; // Wrong password
        }

        // STEP 4: Credentials are valid — generate a JWT token
        _logger.LogInformation("Login successful for user: {Username}", request.Username);
        var token = GenerateJwtToken(user);

        // Return the token and user info to the React frontend
        return new LoginResponse
        {
            AccessToken = token,            // The JWT token string
            FullName = $"{user.FirstName} {user.LastName}", // Display name for the UI
            Role = user.Role,          // Role for conditional UI rendering
            ExpiresIn = 900,       // Token expiration time in seconds (15 minutes)
            MustChangePassword = user.MustChangePassword
        };
    }

    /// <summary>
    /// Seeds a default admin user if no users exist yet.
    /// Called once during application startup in Program.cs.
    ///
    /// WHY?
    /// On first run, the users.json file is empty. Without a default user,
    /// nobody could log in to create other users. This bootstraps the system
    /// with a default admin account.
    ///
    /// Default credentials: admin / admin123
    /// </summary>
    public async Task SeedDefaultUserAsync()
    {
        // Check if the admin user already exists
        var existingUser = await _employeeRepository.GetByUsernameAsync("admin");
        if (existingUser != null)
            return;  // Already seeded — do nothing

        _logger.LogInformation("Seeding default admin user");

        // Create the default admin user with a hashed password
        await _employeeRepository.CreateAsync(new Employee
        {
            Username = "admin",
            PasswordHash = HashPassword("admin123"), // Hash the password BEFORE storing
            FirstName = "System",
            LastName = "Administrator",
            Role = "Admin"
        });
    }

    public async Task<RefreshResult?> RefreshAsync(string refreshToken)
    {
        var rotated = _refreshTokenStore.ValidateAndRotate(refreshToken);
        if (rotated is null) return null;
        var user = await _employeeRepository.GetByUsernameAsync(rotated.Value.UserName);
        if (user is null) return null;
        return new RefreshResult
        {
            AccessToken = GenerateJwtToken(user),
            NewRefreshToken = rotated.Value.NewToken,
            ExpiresIn = 15*60
        };
    }

    public Task LogoutAsync(string refreshToken)
    {
        _refreshTokenStore.Invalidate(refreshToken);
        return Task.CompletedTask;
    }

    /// <summary>
    /// Generates a signed JWT token containing user identity claims.
    ///
    /// CLAIMS are pieces of information embedded in the token:
    /// - Sub (Subject): the username — identifies WHO the user is
    /// - Jti (JWT ID): a unique ID for this specific token — prevents replay attacks
    /// - Name: the display name — for the UI
    /// - Role: the user's role — for authorization checks
    ///
    /// The token is SIGNED with a secret key (from appsettings.json).
    /// This signature proves the token was created by our server and hasn't been modified.
    /// If anyone changes the payload, the signature won't match → the token is rejected.
    ///
    /// EXPIRATION: The token expires after 15 minutes. After that, the user must log in again.
    /// The React frontend detects expired tokens (401 response) and redirects to /login.
    /// </summary>
    private string GenerateJwtToken(Employee user)
    {
        // Create a symmetric security key from the JWT secret in appsettings.json.
        // "Symmetric" means the same key is used to both SIGN and VERIFY the token.
        // The secret must be at least 32 characters long for HMAC-SHA256.
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_configuration["Jwt:Secret"]!));
        // ^^^ The '!' tells the compiler "I know this won't be null" (null-forgiving operator).

        // Create signing credentials: the key + the algorithm used to sign.
        // HmacSha256 is the most common JWT signing algorithm.
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        // Define the claims (user information) to embed in the token.
        var claims = new[]
        {
            // JwtRegisteredClaimNames are standard claim names defined by the JWT specification.
            new Claim(JwtRegisteredClaimNames.Sub, user.Username!),       // Subject: who is this token for
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()), // Unique token ID
            new Claim(ClaimTypes.Name, $"{user.FirstName} {user.LastName}"),                    // .NET claim: display name
            new Claim(ClaimTypes.Role, user.Role)                         // .NET claim: role for [Authorize(Roles="Admin")]
        };

        // Build the JWT token object with all the pieces:
        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],       // Who created the token (e.g., "EmployeeManager")
            audience: _configuration["Jwt:Audience"],    // Who the token is for (e.g., "EmployeeManagerApp")
            claims: claims,                              // The user information
            expires: DateTime.UtcNow.AddMinutes(15),       // Token expires in 15 minutes
            signingCredentials: credentials               // The signature
        );

        // Serialize the token object into a JWT string (the "eyJhbGci..." format)
        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    /// <summary>
    /// Hashes a password using HMAC-SHA256.
    ///
    /// Hashing is a ONE-WAY transformation:
    ///   "admin123" → "xK7a2R5f..." (you can't reverse this to get "admin123")
    ///
    /// To verify a password during login:
    /// 1. Hash the provided password with the same key
    /// 2. Compare the result to the stored hash
    /// 3. If they match → correct password
    ///
    /// IMPORTANT: HMAC-SHA256 is used here for simplicity.
    /// In production, use BCrypt (BCrypt.Net-Next NuGet package):
    ///   - BCrypt includes a random "salt" (prevents rainbow table attacks)
    ///   - BCrypt has a configurable "work factor" (makes brute-force slower)
    ///   - BCrypt is specifically designed for password hashing
    /// </summary>
    private string HashPassword(string password)
    {
        // Create an HMAC-SHA256 hasher with the JWT secret as the key.
        // 'using' ensures the hasher is properly disposed after use (frees resources).
        using var hmac = new HMACSHA256(
            Encoding.UTF8.GetBytes(_configuration["Jwt:Secret"]!));

        // Compute the hash: convert password string → bytes → hash bytes
        var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));

        // Convert the hash bytes to a Base64 string for storage.
        // Base64 encodes binary data as readable ASCII characters.
        return Convert.ToBase64String(hash);
    }

    public async Task<bool> ChangePasswordAsync(string userName, ChangePasswordRequest request)
    {
        var user = await _employeeRepository.GetByUsernameAsync(userName);
        if (user == null) return false; // User not found
        var oldHash = HashPassword(request.OldPassword);
        if (user.PasswordHash != oldHash)
        {
            _logger.LogWarning("Change password failed — invalid old password for user: {Username}", userName);
            return false; // Old password is incorrect
        }

        if(string.IsNullOrWhiteSpace(request.NewPassword) || request.NewPassword.Length < 8)
        {
            _logger.LogWarning("Change password failed — new password does not meet complexity requirements for user: {Username}", userName);
            return false; // New password doesn't meet complexity requirements
        }

        if(request.NewPassword == request.OldPassword)
        {
            _logger.LogWarning("Change password failed — new password is the same as the old password for user: {Username}", userName);
            return false; // New password is the same as the old password
        }

        user.PasswordHash = HashPassword(request.NewPassword);
        user.MustChangePassword = false; // Clear the flag after successful password change
        await _employeeRepository.UpdateAsync(user);
        _logger.LogInformation("Password changed successfully for user: {Username}", userName);
        return true;
    }
}