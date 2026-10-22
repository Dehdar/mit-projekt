namespace RotatingSudoku.UiTests.Support;

// A cell by row and column, which works on a board of any size
internal readonly record struct Cell(int Row, int Column)
{
    public static Cell TopLeft => new(0, 0);
    public static Cell NextToTopLeft => new(0, 1);
    public static Cell BelowTopLeft => new(1, 0);

    public static Cell BottomRightOf(BoardShape shape) => new(shape.Size - 1, shape.Size - 1);
}
