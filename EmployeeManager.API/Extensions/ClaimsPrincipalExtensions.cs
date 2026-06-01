using System.Security.Claims;

namespace EmployeeManager.Extensions;

public static class ClaimsPrincipalExtensions
{
    public static string? GetUsername(this ClaimsPrincipal user)
    {
        // Looks for the "sub" claim you saved in your JWT
        return user.FindFirst("sub")?.Value 
            ?? user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    }
}