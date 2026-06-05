using EmployeeManager.Domain.Models;
using Microsoft.AspNetCore.Http;

namespace EmployeeManager.Application.Services;

public interface IDocumentService
{
    Task<List<DocumentDto>> ListMineAsync(string userName);
    Task<List<DocumentDto>> ListAllAsync();
    Task<UploadResult> UploadAsync(string userName, IFormFile file);
    Task<(byte[]?, Document?)> DownloadAsync(string username, string role, Guid id);
    Task<DeleteResult> DeleteAsync(string username, string role, Guid id);
}

public record UploadResult(bool Success, DocumentDto? Document, string? Error);
public record DeleteResult(bool Success, string? Error);