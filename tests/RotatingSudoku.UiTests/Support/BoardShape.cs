namespace RotatingSudoku.UiTests.Support;

// A board shape as sudoku.js knows it, with one known solved board for tests that need a fixed grid
public sealed record BoardShape(string Name, int Size, int BoxRows, int BoxColumns, int[] SolvedBoard)
{
    public static BoardShape FourByFour { get; } = new("FOUR_BY_FOUR", 4, 2, 2, ParseRows(
        "1234",
        "3412",
        "2143",
        "4321"));

    // Boxes are two rows tall and three columns wide
    public static BoardShape SixBySix { get; } = new("SIX_BY_SIX", 6, 2, 3, ParseRows(
        "123456",
        "456123",
        "231564",
        "564231",
        "312645",
        "645312"));

    public static BoardShape NineByNine { get; } = new("NINE_BY_NINE", 9, 3, 3, ParseRows(
        "534678912",
        "672195348",
        "198342567",
        "859761423",
        "426853791",
        "713924856",
        "961537284",
        "287419635",
        "345286179"));

    public static BoardShape[] Small { get; } = [FourByFour, SixBySix];

    public int CellCount => Size * Size;

    public int CellIndex(int row, int column) => row * Size + column;

    internal int IndexOf(Cell cell) => CellIndex(cell.Row, cell.Column);

    internal int SolutionAt(Cell cell) => SolvedBoard[IndexOf(cell)];

    public override string ToString() => Name;

    private static int[] ParseRows(params string[] rows) =>
        rows.SelectMany(row => row.Select(digit => digit - '0')).ToArray();
}
