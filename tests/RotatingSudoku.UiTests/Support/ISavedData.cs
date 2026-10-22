using System.Text.Json;

namespace RotatingSudoku.UiTests.Support;

// Something the game keeps in localStorage, which a test can put there before the page loads
internal interface ISavedData
{
    string StorageKey { get; }

    object ToSaveData();
}

// Data saved by an earlier version of the game, stored exactly as given
internal sealed record RawSave(string StorageKey, object Data) : ISavedData
{
    public object ToSaveData() => Data;
}

internal static class StorageSeed
{
    // Init scripts run on every load, so the saves may only be seeded the first time,
    // otherwise a reload would overwrite the player's progress
    public static string InitScriptFor(IEnumerable<ISavedData> saves)
    {
        var writes = saves.Select(save =>
            $"localStorage.setItem({JsonSerializer.Serialize(save.StorageKey)}, {JsonSerializer.Serialize(JsonSerializer.Serialize(save.ToSaveData()))});");
        return $$"""
            if (!sessionStorage.getItem("test-seeded")) {
              {{string.Join("\n  ", writes)}}
              sessionStorage.setItem("test-seeded", "true");
            }
            """;
    }
}
