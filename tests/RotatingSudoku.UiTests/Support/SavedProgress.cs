namespace RotatingSudoku.UiTests.Support;

// The stars the child has already collected, kept apart from the game in progress
internal sealed record SavedProgress(IReadOnlyDictionary<int, int> StarsByLevel) : ISavedData
{
    public string StorageKey => "rainbow-kingdom-progress";

    public static SavedProgress WithStars(int level, int stars) => new(new Dictionary<int, int> { [level] = stars });

    public object ToSaveData() => new { starsByLevel = StarsByLevel };
}
