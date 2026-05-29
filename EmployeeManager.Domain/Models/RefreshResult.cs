namespace EmployeeManager.Domain.Models;
public class RefreshResult
{
    public string AccessToken { get; set; } = string.Empty;
    public string NewRefreshToken { get; set; } = string.Empty;
    public int ExpiresIn { get; set; }
}