namespace RoterendeSudoku.UiTests.Support;

// Spillet åbnes direkte fra disken, så testene ikke behøver en server
internal static class GameLocation
{
    private const string GameFolder = "roterende-sudoku";

    public static string IndexUrl { get; } = new Uri(Path.Combine(FindGameFolder(), "index.html")).AbsoluteUri;

    private static string FindGameFolder()
    {
        for (var folder = new DirectoryInfo(AppContext.BaseDirectory); folder is not null; folder = folder.Parent)
        {
            var candidate = Path.Combine(folder.FullName, GameFolder);
            if (Directory.Exists(candidate)) return candidate;
        }
        throw new DirectoryNotFoundException($"Could not find the '{GameFolder}' folder above {AppContext.BaseDirectory}.");
    }
}
