namespace RotatingSudoku.UiTests.Support;

internal readonly record struct Cell(int Row, int Column)
{
    private const int BoardSize = 9;

    public static Cell TopLeft => new(0, 0);
    public static Cell NextToTopLeft => new(0, 1);
    public static Cell BottomRight => new(8, 8);

    public int Index => Row * BoardSize + Column;
}
