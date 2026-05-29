using System.Collections.Concurrent;
using System.Security.Cryptography;

namespace EmployeeManager.Application.Services;
public class RefreshTokenStore : IRefreshTokenStore
{
    private readonly ConcurrentDictionary<string, (string userName, DateTime expiresAt)> _store = new();
    private readonly TimeSpan _tokenLifetime = TimeSpan.FromDays(7); // Refresh token lifetime
    public string Issue(string username)
    {
        var token = GenerateToken();
        _store[token] = (username, DateTime.UtcNow.Add(_tokenLifetime));
        return token;
    }

    public (string NewToken, string UserName)? ValidateAndRotate(string oldToken)
    {
        if (!_store.TryRemove(oldToken, out var entry)) return null; // Invalid token
        if (entry.expiresAt < DateTime.UtcNow) return null; // Expired token
        return (Issue(entry.userName), entry.userName);
    }

    public void Invalidate(string token) => _store.TryRemove(token, out _); // Invalidate token

    private static string GenerateToken()
    {
        Span<byte> bytes = stackalloc byte[64];
        RandomNumberGenerator.Fill(bytes);
        return Convert.ToBase64String(bytes);
    }
}