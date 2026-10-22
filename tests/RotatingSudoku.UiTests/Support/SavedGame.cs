namespace RotatingSudoku.UiTests.Support;

// A known board, so the tests do not depend on randomly generated puzzles
internal sealed record SavedGame : ISavedData
{
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

    public string StorageKey => "rainbow-kingdom";

    public int Level { get; init; } = 1;
    public int Oopsies { get; init; }

    // Two empty cells by default, so entering one digit does not solve the board
    public IReadOnlyList<Cell> EmptyCells { get; init; } = [Cell.TopLeft, Cell.BottomRight];

    public static int SolutionAt(Cell cell) => Solution[cell.Index];

    public static IEnumerable<int> WrongDigitsAt(Cell cell) =>
        Enumerable.Range(1, 9).Where(digit => digit != SolutionAt(cell));

    public object ToSaveData()
    {
        var puzzle = PuzzleWithEmptyCells();
        return new
        {
            level = Level,
            puzzle,
            solution = Solution,
            board = puzzle,
            oopsies = Oopsies,
            wandsUsed = 0,
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
