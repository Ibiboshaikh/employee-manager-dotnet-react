using EmployeeManager.Domain.Models;
namespace EmployeeManager.Domain.Repositories;
public interface IDocumentRepository
{
    Task<List<Document>> GetAllAsync();
    Task<List<Document>> GetByOwnerAsync(string ownerUsername);
    Task<Document?> GetByIdAsync(Guid id);
    Task<Document> CreateAsync(Document document);
    Task<bool> DeleteAsync(Guid id);
}