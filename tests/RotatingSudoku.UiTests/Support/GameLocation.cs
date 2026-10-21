namespace RotatingSudoku.UiTests.Support;

// The game is opened straight from disk, so the tests do not need a server
internal static class GameLocation
{
    private const string GamePage = "index.html";

    public static string IndexUrl { get; } = new Uri(FindGamePage()).AbsoluteUri;

    private static string FindGamePage()
    {
        for (var folder = new DirectoryInfo(AppContext.BaseDirectory); folder is not null; folder = folder.Parent)
        {
            var candidate = Path.Combine(folder.FullName, GamePage);
            if (File.Exists(candidate)) return candidate;
        }
        throw new FileNotFoundException($"Could not find '{GamePage}' above {AppContext.BaseDirectory}.");
    }
}
