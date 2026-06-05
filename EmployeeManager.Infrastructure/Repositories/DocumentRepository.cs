using EmployeeManager.Domain.Models;
using EmployeeManager.Domain.Repositories;
using EmployeeManager.Infrastructure.Data;

namespace EmployeeManager.Infrastructure.Repositories;
public class DocumentRepository : IDocumentRepository
{
    private readonly JsonDataStore<Document> _store;
    public DocumentRepository(JsonDataStore<Document> store)
    {
        _store = store;
    }

    public async Task<List<Document>> GetAllAsync() => await _store.ReadAllAsync() ?? new();

    public async Task<List<Document>> GetByOwnerAsync(string ownerUsername)
    {
        var all = await GetAllAsync();
        return all.Where(d=> string
            .Equals(d.OwnerUsername, ownerUsername
            , StringComparison.OrdinalIgnoreCase)).ToList();
    }

    public async Task<Document?> GetByIdAsync(Guid id)
    {
        var all = await GetAllAsync();
        return all.FirstOrDefault(d => d.Id == id);
    }

    public async Task<Document> CreateAsync(Document doc)
    {
        if (doc.Id == Guid.Empty) doc.Id = Guid.NewGuid();
        doc.UploadedAt = DateTime.UtcNow;

        await _store.ReadModifyWriteAsync(list =>
        {
            list.Add(doc);
        });
        return doc;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var removed = false;
        await _store.ReadModifyWriteAsync(list =>
        {
            var idx = list.FindIndex(d=>d.Id == id);
            if (idx >= 0)
            {
                list.RemoveAt(idx);
                removed = true;
            }
        });
        return removed;
    }
}