using System.Collections.Concurrent;
using System.Security.Cryptography;

namespace EmployeeManager.Application.Services;
public class PasswordResetStore: IPasswordResetStore
{
    private record Entry(string UserName, DateTime IssuedAt);
    private readonly ConcurrentDictionary<string, Entry> _entries = new();
    private static readonly TimeSpan TokenLifetime = TimeSpan.FromMinutes(15);

    public string Issue(string UserName)
    {
        var bytes = RandomNumberGenerator.GetBytes(32);
        var token = Convert.ToBase64String(bytes).Replace('+', '-').Replace('/', '_').TrimEnd('=');
        _entries[token] = new Entry(UserName, DateTime.UtcNow);
        return token;
    }

    public string? Consume(string token)
    {
        if(!_entries.TryRemove(token, out var entry))
        {
            return null; // Invalid token
        }

        if (DateTime.UtcNow - entry.IssuedAt > TokenLifetime)
        {
            return null; // Expired token
        }
        return entry.UserName;
    }
}