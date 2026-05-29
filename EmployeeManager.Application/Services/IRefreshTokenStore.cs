namespace EmployeeManager.Application.Services;
public interface IRefreshTokenStore
{
    string Issue(string username);
    (string NewToken, string UserName)? ValidateAndRotate(string oldToken);
    void Invalidate(string token);
}