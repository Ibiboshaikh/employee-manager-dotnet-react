namespace EmployeeManager.Application.Services;

public interface IPasswordResetStore
{
    string Issue(string userName);
    string? Consume(string token);
}