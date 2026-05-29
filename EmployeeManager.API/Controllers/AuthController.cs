// ============================================================================
// AUTHCONTROLLER.CS — Authentication endpoint for user login.
//
// PROJECT: EmployeeManager (API layer)
//
// This controller has ONE endpoint: POST /api/auth/login
// It receives credentials from the React login form and returns a JWT token.
//
// IMPORTANT: No [Authorize] attribute on this controller!
// The login endpoint MUST be accessible without a token — you can't require
// authentication to authenticate. That would be a chicken-and-egg problem.
//
// FLOW:
//   React Login.js sends: POST /api/auth/login
//     Body: { "username": "admin", "password": "admin123" }
//
//   This controller:
//     1. Receives the LoginRequest (deserialized from JSON by ASP.NET)
//     2. Passes it to AuthService.LoginAsync()
//     3. AuthService validates credentials and generates JWT
//     4. Returns 200 OK with { token, fullName, role }
//     OR: Returns 401 Unauthorized if credentials are invalid
//
//   React then:
//     - Stores the token in localStorage
//     - Redirects to /employees
//     - Sends the token with every future API request
// ============================================================================

using EmployeeManager.Application.Services;  // IAuthService
using EmployeeManager.Domain.Models;         // LoginRequest
using Microsoft.AspNetCore.Mvc;              // ControllerBase, [ApiController], etc.

namespace EmployeeManager.Controllers;

/// <summary>
/// Authentication controller — handles login requests.
/// This controller is intentionally THIN — all logic is in AuthService.
/// </summary>
[ApiController]
[Route("api/[controller]")]
// ^^^ Route becomes: /api/auth (from "AuthController" minus "Controller")
//
// NOTE: No [Authorize] attribute! This controller is PUBLIC.
// Login must be accessible without a token.
public class AuthController : ControllerBase
{
    // The auth service — handles credential validation and JWT generation
    private readonly IAuthService _authService;
    private readonly IRefreshTokenStore _refreshTokenStore;
    private readonly IWebHostEnvironment _env;
    /// <summary>
    /// Constructor — IAuthService and IRefreshTokenStore are injected by the DI container.
    /// </summary>
    public AuthController(IAuthService authService, IRefreshTokenStore refreshTokenStore, IWebHostEnvironment env)
    {
        _authService = authService;
        _refreshTokenStore = refreshTokenStore;
        _env = env;
    }

    /// <summary>
    /// POST /api/auth/login
    /// Authenticates a user and returns a JWT token.
    ///
    /// Request body (from React):
    ///   { "username": "admin", "password": "admin123" }
    ///
    /// Success response (200 OK):
    ///   { "accessToken": "eyJhbGci...", "fullName": "System Administrator", "role": "Admin" }
    ///
    /// Failure response (401 Unauthorized):
    ///   { "message": "Invalid username or password" }
    /// </summary>
    [HttpPost("login")]
    // ^^^ "login" is appended to the controller route: /api/auth + /login = /api/auth/login
    //     Only POST requests to /api/auth/login reach this method.
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    // ^^^ [FromBody] tells ASP.NET to deserialize the JSON request body into a LoginRequest object.
    //     { "username": "admin", "password": "admin123" }
    //     → new LoginRequest { Username = "admin", Password = "admin123" }
    {
        // Delegate to the service — it handles validation, hashing, and JWT generation.
        var response = await _authService.LoginAsync(request);

        // If LoginAsync returns null → credentials are invalid
        if (response == null)
            // 401 Unauthorized — standard HTTP status for "you are not authenticated"
            // The error message is intentionally vague (doesn't say "wrong password" or "user not found")
            // to prevent attackers from discovering valid usernames.
            return Unauthorized(new { message = "Invalid username or password" });

        // 200 OK — login successful, return the token and user info.
        // React stores the token in localStorage and uses it for future requests.
        var refreshToken = _refreshTokenStore.Issue(request.Username);
        SetRefreshCookie(refreshToken);
        return Ok(response);
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh()
    {
        var oldToken = Request.Cookies["refreshToken"];
        if (string.IsNullOrEmpty(oldToken))
        {
            return Unauthorized(new { message = "No refresh token provided" });
        }
        var result = await _authService.RefreshAsync(oldToken);
        if (result == null)
        {
            DeleteRefreshCookie();
            return Unauthorized(new { message = "Invalid or expired refresh token" });
        }
        SetRefreshCookie(result.NewRefreshToken);
        return Ok(new { accessToken = result.AccessToken, expiresIn = result.ExpiresIn });
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        var refreshToken = Request.Cookies["refreshToken"];
        if (!string.IsNullOrEmpty(refreshToken))
        {
            await _authService.LogoutAsync(refreshToken);
            DeleteRefreshCookie();
        }
        return NoContent();
    }

    private void SetRefreshCookie(string token)
    {
        Response.Cookies.Append("refreshToken", token, new CookieOptions
        {
            HttpOnly = true,
            Secure = !_env.IsDevelopment(), // Only send cookie over HTTPS in production
            SameSite = SameSiteMode.Strict,
            Path = "/api/auth",
            Expires = DateTime.UtcNow.AddDays(7) // Match the refresh token lifetime
        });
    }
    private void DeleteRefreshCookie() => Response.Cookies.Delete("refreshToken", new CookieOptions { Path = "/api/auth" });
}
