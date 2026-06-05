using EmployeeManager.Domain.Models;
using EmployeeManager.Domain.Repositories;
using Microsoft.Extensions.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Hosting;
namespace EmployeeManager.Application.Services;

public class DocumentService : IDocumentService
{
    private static readonly HashSet<string> AllowedTypes = new (StringComparer.OrdinalIgnoreCase)
    {
        "application/pdf",
        "text/plain",
        "image/png",
        "image/jpeg",
        "image/gif",
    };

    private const long MaxBytes = 5_000_000;
    private readonly IDocumentRepository _repository;
    private readonly IWebHostEnvironment _env;
    private readonly ILogger<DocumentService> _logger;

    public DocumentService(IDocumentRepository repository, IWebHostEnvironment env, ILogger<DocumentService> logger)
    {
        _repository = repository;
        _env = env;
        _logger = logger;
    }

    public async Task<List<DocumentDto>> ListMineAsync(string userName) => 
        (await _repository.GetByOwnerAsync(userName)).Select(ToDto).ToList();

    public async Task<List<DocumentDto>> ListAllAsync() => 
        (await _repository.GetAllAsync()).Select(ToDto).ToList();
    
    public async Task<UploadResult> UploadAsync(string username, IFormFile file)
    {
        if(file is null || file.Length == 0) return new(false, null, "No file uploaded.");
        if(file.Length > MaxBytes) return new(false, null, $"File too large (max {MaxBytes / 1_000_000} MB).");
        if(!AllowedTypes.Contains(file.ContentType ?? "")) return new(false, null, $"Type '{file.ContentType}' is not allowed.");

        var ext = Path.GetExtension(file.FileName);
        var safeFileName = Path.GetFileName(file.FileName);
        var id = Guid.NewGuid();

        var dir = Path.Combine(_env.WebRootPath ?? "wwwroot", "documents", username);
        Directory.CreateDirectory(dir);

        var diskName = $"{id}{ext}";
        var fullPath = Path.Combine(dir, diskName);

        await using (var stream = File.Create(fullPath))
        {
            await file.CopyToAsync(stream);
        }

        var doc = await _repository.CreateAsync(new Document
        {
            Id = id,
            OwnerUsername = username,
            FileName = safeFileName,
            ContentType = file.ContentType ?? "application/octet-stream",
            SizeBytes = file.Length,
            UploadedAt = DateTime.UtcNow
        });
        return new UploadResult(true, ToDto(doc), null);
    }

    public async Task<(byte[]?, Document?)> DownloadAsync(string username, string role, Guid id)
    {
        var doc =await _repository.GetByIdAsync(id);
        if (doc is null) return (null, null);
        if (!CanAccess(doc, username, role)) return (null, null);
        if (!File.Exists(doc.StoragePath)) return (null, null);

        var bytes = await File.ReadAllBytesAsync(doc.StoragePath);
        return (bytes, doc);
    }

    public async Task<DeleteResult> DeleteAsync(string username, string role, Guid id)
    {
        var doc = await _repository.GetByIdAsync(id);
        if (doc is null) return new(false, "Not found.");

        if (!CanAccess(doc, username, role)) return new(false, "Forbidden.");

        if (File.Exists(doc.StoragePath))
        {
            try { File.Delete(doc.StoragePath); }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to delete {Path}", doc.StoragePath);
                // Continue — orphan the file on disk rather than fail the user
            }
        }

        await _repository.DeleteAsync(id);
        return new(true, null);
    }

    private static bool CanAccess(Document doc, string username, string role)
        => string.Equals(doc.OwnerUsername, username, StringComparison.OrdinalIgnoreCase)
            || string.Equals(role, "Admin", StringComparison.OrdinalIgnoreCase);

    private static DocumentDto ToDto(Document d) => new()
    {
        Id = d.Id,
        OwnerUsername = d.OwnerUsername,
        FileName = d.FileName,
        ContentType = d.ContentType,
        SizeBytes = d.SizeBytes,
        UploadedAt = d.UploadedAt
    };
}