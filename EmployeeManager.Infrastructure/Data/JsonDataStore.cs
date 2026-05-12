// ============================================================================
// JSONDATASTORE.CS — Generic JSON file-based data store.
//
// PROJECT: EmployeeManager.Infrastructure
//
// This class replaces a traditional SQL database with simple JSON files.
// It provides two core operations:
//   - ReadAllAsync()  → reads all records from a .json file
//   - WriteAllAsync() → writes all records back to the .json file
//
// WHY JSON FILES INSTEAD OF A DATABASE?
// - No database installation needed — perfect for learning and demos
// - Human-readable data — open employees.json in any text editor to see your data
// - Simple to understand — no Entity Framework, migrations, or connection strings
// - In production, you'd replace this with Entity Framework + SQL Server
//
// GENERIC TYPE <T>:
// This class uses a C# generic type parameter <T>.
// It means "this class works with ANY type" — Employee, User, or anything else.
// - JsonDataStore<Employee> reads/writes Employee objects
// - JsonDataStore<User> reads/writes User objects
// Same code, different types. Like List<string> vs List<int>.
//
// THREAD SAFETY:
// Web servers handle multiple HTTP requests at the same time (concurrently).
// If two requests try to write to the same JSON file simultaneously,
// the file could get corrupted. SemaphoreSlim prevents this by ensuring
// only one read/write operation happens at a time.
//
// REGISTERED AS SINGLETON in DI (Program.cs):
// Only ONE instance exists for the entire app lifetime.
// This ensures all requests share the same file lock.
// ============================================================================

using System.Text.Json; // Microsoft's built-in JSON serializer/deserializer

namespace EmployeeManager.Infrastructure.Data;

/// <summary>
/// Generic JSON file-based data store.
/// Reads and writes lists of objects to/from JSON files on disk.
/// Thread-safe: uses SemaphoreSlim to prevent concurrent file access issues.
/// </summary>
/// <typeparam name="T">The entity type to store (e.g., Employee, User)</typeparam>
public class JsonDataStore<T> where T : class
// ^^^ "where T : class" constrains T to reference types only (no int, bool, etc.)
// This is needed because JSON deserialization returns null for missing data,
// and value types can't be null.
{
    // The file path where data is stored (e.g., "Data/employees.json")
    private readonly string _filePath;

    // SemaphoreSlim acts as a lock — only one thread can access the file at a time.
    // new SemaphoreSlim(1, 1) means: initial count = 1, max count = 1
    // So only 1 thread can "enter" at a time. Others must wait.
    //
    // WHY NOT lock()? Because lock() doesn't work with async/await.
    // SemaphoreSlim supports async waiting via WaitAsync().
    private readonly SemaphoreSlim _lock = new(1, 1);

    // JSON serializer options — controls how objects are converted to/from JSON.
    private readonly JsonSerializerOptions _jsonOptions = new()
    {
        WriteIndented = true  // Pretty-print JSON with indentation for readability.
        // Without this: [{"id":"abc","firstName":"John",...}]  (one long line)
        // With this:    [                                        (formatted nicely)
        //                 {
        //                   "id": "abc",
        //                   "firstName": "John",
        //                   ...
        //                 }
        //               ]
    };

    /// <summary>
    /// Creates a new data store backed by the specified JSON file.
    /// If the file or directory doesn't exist, they are created automatically.
    /// </summary>
    /// <param name="filePath">Full path to the .json file (e.g., "C:/.../Data/employees.json")</param>
    public JsonDataStore(string filePath)
    {
        _filePath = filePath;

        // Ensure the directory exists (e.g., create "Data/" folder if it doesn't exist)
        // Path.GetDirectoryName extracts the folder part from a full path.
        var directory = Path.GetDirectoryName(_filePath);
        if (!string.IsNullOrEmpty(directory))
            Directory.CreateDirectory(directory);
        // ^^^ CreateDirectory is safe to call even if the directory already exists — it does nothing.

        // Create the file with an empty JSON array if it doesn't exist yet.
        // "[]" represents an empty list in JSON.
        // Without this, ReadAllAsync would fail on first run (file not found).
        if (!File.Exists(_filePath))
            File.WriteAllText(_filePath, "[]");
    }

    /// <summary>
    /// Reads ALL records from the JSON file and deserializes them into a List of T.
    /// Returns an empty list if the file is empty or contains invalid JSON.
    ///
    /// EXAMPLE (for JsonDataStore of Employee):
    ///   File contains: [{"firstName":"John",...},{"firstName":"Jane",...}]
    ///   Returns: List of Employee with 2 items
    /// </summary>
    public async Task<List<T>> ReadAllAsync()
    {
        // Wait to acquire the lock. If another operation is in progress, wait here.
        // This prevents two threads from reading/writing the file simultaneously.
        await _lock.WaitAsync();
        try
        {
            // Read the entire file content as a string (async to not block the thread)
            var json = await File.ReadAllTextAsync(_filePath);

            // Deserialize the JSON string into a List<T>.
            // JsonSerializer.Deserialize<List<T>>(json) parses the JSON and creates objects.
            // The ?? operator provides a fallback: if Deserialize returns null, use an empty list.
            return JsonSerializer.Deserialize<List<T>>(json, _jsonOptions) ?? new List<T>();
        }
        finally
        {
            // ALWAYS release the lock, even if an exception occurred.
            // Without this, the lock would be held forever and all future operations would hang.
            _lock.Release();
        }
    }

    /// <summary>
    /// Writes the provided list of records to the JSON file, replacing ALL existing content.
    /// This is a full overwrite — the caller is responsible for including all records.
    ///
    /// EXAMPLE:
    ///   WriteAllAsync(employeeList)
    ///   → Serializes the list to JSON
    ///   → Writes: [{"firstName":"John",...},{"firstName":"Jane",...}]
    ///   → Previous file content is completely replaced
    /// </summary>
    public async Task WriteAllAsync(List<T> data)
    {
        await _lock.WaitAsync(); // Acquire lock (wait if another operation is in progress)
        try
        {
            // Serialize the list of objects into a JSON string
            var json = JsonSerializer.Serialize(data, _jsonOptions);

            // Write the JSON string to the file, replacing all existing content
            await File.WriteAllTextAsync(_filePath, json);
        }
        finally
        {
            _lock.Release(); // Always release the lock
        }
    }

    /// <summary>
    /// Atomically reads, modifies, and writes data under a SINGLE lock.
    ///
    /// WHY THIS EXISTS:
    /// ReadAllAsync and WriteAllAsync each acquire/release the lock independently.
    /// If a repository does: read → modify → write, another request can sneak in
    /// between the read and write, causing a "lost update" (its changes get overwritten).
    ///
    /// This method holds the lock for the ENTIRE read-modify-write cycle,
    /// guaranteeing no other operation can interfere.
    ///
    /// EXAMPLE (in EmployeeRepository.CreateAsync):
    ///   await _store.ReadModifyWriteAsync(employees =>
    ///   {
    ///       employee.Id = Guid.NewGuid();
    ///       employees.Add(employee);
    ///   });
    /// </summary>
    /// <param name="modifier">
    /// A function that receives the current list and modifies it in place.
    /// The modified list is automatically written back to the file.
    /// </param>
    /// <returns>The list AFTER modifications have been applied.</returns>
    public async Task<List<T>> ReadModifyWriteAsync(Action<List<T>> modifier)
    {
        await _lock.WaitAsync();
        try
        {
            // Step 1: Read current data
            var json = await File.ReadAllTextAsync(_filePath);
            var data = JsonSerializer.Deserialize<List<T>>(json, _jsonOptions) ?? new List<T>();

            // Step 2: Let the caller modify the list
            modifier(data);

            // Step 3: Write back — all under the SAME lock
            var updatedJson = JsonSerializer.Serialize(data, _jsonOptions);
            await File.WriteAllTextAsync(_filePath, updatedJson);

            return data;
        }
        finally
        {
            _lock.Release();
        }
    }
}
