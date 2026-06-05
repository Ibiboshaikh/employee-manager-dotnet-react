namespace EmployeeManager.Domain.Models;

public class DocumentDto
{
    public Guid Id { get; set; }
    public string OwnerUsername { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long SizeBytes { get; set; }
    public DateTime UploadedAt { get; set; }
}