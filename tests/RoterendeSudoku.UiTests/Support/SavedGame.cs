using System.Text.Json;

namespace RoterendeSudoku.UiTests.Support;

// Et kendt bræt, så testene ikke afhænger af de tilfældigt genererede opgaver
internal sealed record SavedGame
{
    public const int LevelOneSeconds = 15 * 60;

    private const string StorageKey = "roterende-sudoku";
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

    // To tomme felter som standard, så ét indtastet tal ikke løser brættet
    public IReadOnlyList<Cell> EmptyCells { get; init; } = [Cell.TopLeft, Cell.BottomRight];

    public static int SolutionAt(Cell cell) => Solution[cell.Index];

    // Init-scripts kører ved hver indlæsning, så gemningen må kun lægges ind første gang,
    // ellers ville en genindlæsning overskrive spillerens fremskridt
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
