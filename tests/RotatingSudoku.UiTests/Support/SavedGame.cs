using System.Text.Json;

namespace RotatingSudoku.UiTests.Support;

// A known board, so the tests do not depend on randomly generated puzzles
internal sealed record SavedGame
{
    public const int LevelOneSeconds = 15 * 60;

    private const string StorageKey = "rotating-sudoku";
    private const int Empty = 0;

    private static readonly int[] Solution = ParseRows(
        "534678912",
        "672195348",
        "198342567",
        "859761423",
        "426853791",
        "713924856",
        "961537284",
        "287419635",
        "345286179");

    public int Level { get; init; } = 1;
    public int TimeLeft { get; init; } = LevelOneSeconds;

    // Two empty cells by default, so entering one digit does not solve the board
    public IReadOnlyList<Cell> EmptyCells { get; init; } = [Cell.TopLeft, Cell.BottomRight];

    public static int SolutionAt(Cell cell) => Solution[cell.Index];

    // Init scripts run on every load, so the save may only be seeded the first time,
    // otherwise a reload would overwrite the player's progress
    public string ToInitScript()
    {
        var json = JsonSerializer.Serialize(ToSaveData());
        return $$"""
            if (!sessionStorage.getItem("test-seeded")) {
              localStorage.setItem({{JsonSerializer.Serialize(StorageKey)}}, {{JsonSerializer.Serialize(json)}});
              sessionStorage.setItem("test-seeded", "true");
            }
            """;
    }

    private object ToSaveData()
    {
        var puzzle = PuzzleWithEmptyCells();
        return new
        {
            level = Level,
            puzzle,
            solution = Solution,
            board = puzzle,
            timeLeft = TimeLeft,
            status = "playing",
        };
    }

    private int[] PuzzleWithEmptyCells()
    {
        var puzzle = (int[])Solution.Clone();
        foreach (var cell in EmptyCells) puzzle[cell.Index] = Empty;
        return puzzle;
    }

    private static int[] ParseRows(params string[] rows) =>
        rows.SelectMany(row => row.Select(digit => digit - '0')).ToArray();
}
