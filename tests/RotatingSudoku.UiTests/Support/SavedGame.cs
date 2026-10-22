namespace RotatingSudoku.UiTests.Support;

// A known board, so the tests do not depend on randomly generated puzzles
internal sealed record SavedGame : ISavedData
{
    // The first level with the classic 9x9 board, which most tests play on
    public const int FirstNineByNineLevel = 16;

    private const int Empty = 0;

    public string StorageKey => "rainbow-kingdom";

    public int Level { get; init; } = FirstNineByNineLevel;
    public BoardShape Shape { get; init; } = BoardShape.NineByNine;
    public int Oopsies { get; init; }

    // Null leaves the count out, like a save from before the board could twirl
    public int? Twirls { get; init; } = 0;

    // Two empty cells by default, so entering one digit does not solve the board
    public IReadOnlyList<Cell>? EmptyCells { get; init; }

    // On the classic 9x9 board
    public static int SolutionAt(Cell cell) => BoardShape.NineByNine.SolutionAt(cell);

    public static IEnumerable<int> WrongDigitsAt(Cell cell) =>
        Enumerable.Range(1, 9).Where(digit => digit != SolutionAt(cell));

    public object ToSaveData()
    {
        var puzzle = PuzzleWithEmptyCells();
        var data = new Dictionary<string, object>
        {
            ["level"] = Level,
            ["puzzle"] = puzzle,
            ["solution"] = Shape.SolvedBoard,
            ["board"] = puzzle,
            ["oopsies"] = Oopsies,
            ["wandsUsed"] = 0,
            ["status"] = "playing",
        };
        if (Twirls is { } twirls) data["twirls"] = twirls;
        return data;
    }

    private int[] PuzzleWithEmptyCells()
    {
        var puzzle = (int[])Shape.SolvedBoard.Clone();
        foreach (var cell in EmptyCells ?? [Cell.TopLeft, Cell.BottomRightOf(Shape)]) puzzle[Shape.IndexOf(cell)] = Empty;
        return puzzle;
    }
}
