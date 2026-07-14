using System.Collections.Concurrent;
using System.Text.Json;
using Microsoft.Extensions.Options;

namespace ReleaseReadiness.Infrastructure.MockData;

/// <summary>
/// Resolves and caches mock fixture JSON files. Resolution is deliberately defensive:
/// it tries the configured <see cref="MockDataOptions.DataPath"/> as-is, the build
/// output's own "MockData" folder (populated via CopyToOutputDirectory), and finally
/// walks upward from the output directory looking for the Infrastructure project's
/// MockData folder -- this keeps fixture loading working whether the process was
/// started via `dotnet run`, `dotnet test`, or from an IDE, regardless of working
/// directory.
/// </summary>
public sealed class MockDataProvider : IMockDataProvider
{
    private readonly MockDataOptions _options;
    private readonly ConcurrentDictionary<string, JsonDocument> _cache = new();

    public MockDataProvider(IOptions<MockDataOptions> options)
    {
        _options = options.Value;
    }

    public Task<JsonDocument> LoadAsync(string fileName, CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();
        var document = _cache.GetOrAdd(fileName, LoadFromDisk);
        return Task.FromResult(document);
    }

    private JsonDocument LoadFromDisk(string fileName)
    {
        string path = ResolvePath(fileName);
        byte[] bytes = File.ReadAllBytes(path);
        return JsonDocument.Parse(bytes);
    }

    private string ResolvePath(string fileName)
    {
        var candidates = new List<string>();
        string baseDir = AppContext.BaseDirectory;

        if (Path.IsPathRooted(_options.DataPath))
        {
            candidates.Add(Path.Combine(_options.DataPath, fileName));
        }

        candidates.Add(Path.Combine(baseDir, "MockData", fileName));
        candidates.Add(Path.Combine(baseDir, _options.DataPath, fileName));

        var dir = new DirectoryInfo(baseDir);
        for (int i = 0; i < 8 && dir is not null; i++, dir = dir.Parent)
        {
            candidates.Add(Path.Combine(dir.FullName, "ReleaseReadiness.Infrastructure", "MockData", fileName));
            candidates.Add(Path.Combine(dir.FullName, "MockData", fileName));
            candidates.Add(Path.Combine(dir.FullName, _options.DataPath, fileName));
        }

        foreach (var candidate in candidates.Distinct())
        {
            if (File.Exists(candidate))
            {
                return candidate;
            }
        }

        throw new FileNotFoundException(
            $"Mock data fixture '{fileName}' could not be located. Checked {candidates.Distinct().Count()} candidate paths " +
            $"under base directory '{baseDir}' with configured DataPath '{_options.DataPath}'.");
    }
}
