using RotatingSudoku.UiTests.Support;

namespace RotatingSudoku.UiTests;

// The game only shows 9x9 boards so far, so the smaller shapes are checked through the board logic in the page
[Parallelizable(ParallelScope.Self)]
public class BoardShapeTests : SudokuTest
{
    private const int Empty = 0;
    private const int AnyDigit = 1;

    private BoardLogic logic = null!;

    [SetUp]
    public async Task OpenGame()
    {
        await Game.OpenNewGameAsync();
        logic = new BoardLogic(Page);
    }

    [TestCaseSource(typeof(BoardShape), nameof(BoardShape.Small))]
    public async Task TheHardestPuzzleHasEmptyCellsAndExactlyOneSolution(BoardShape shape)
    {
        var puzzle = await logic.MakeHardestPuzzleAsync(shape);

        var hasUniqueSolution = await logic.HasUniqueSolutionAsync(shape, puzzle);

        Assert.That(puzzle, Has.Length.EqualTo(shape.Size * shape.Size).And.Contains(Empty));
        Assert.That(hasUniqueSolution, Is.True);
    }

    [TestCaseSource(typeof(BoardShape), nameof(BoardShape.Small))]
    public async Task SolvingAPuzzleFillsItIntoAValidBoardThatKeepsTheClues(BoardShape shape)
    {
        var puzzle = await logic.MakeHardestPuzzleAsync(shape);

        var solution = await logic.SolveAsync(shape, puzzle);

        Assert.That(await logic.IsSolvedAsync(shape, solution), Is.True);
        Assert.That(CluesOf(puzzle).All(clue => solution[clue] == puzzle[clue]), Is.True);
    }

    [Test]
    public async Task BoxesOnAFourByFourBoardAreTwoByTwo()
    {
        var shape = BoardShape.FourByFour;

        var topLeftBox = await logic.BoxCellsThroughAsync(shape, shape.CellIndex(0, 0));

        Assert.That(topLeftBox, Is.EqualTo(new[] { 0, 1, 4, 5 }));
    }

    [Test]
    public async Task BoxesOnASixBySixBoardAreTwoRowsTallAndThreeColumnsWide()
    {
        var shape = BoardShape.SixBySix;

        var topLeftBox = await logic.BoxCellsThroughAsync(shape, shape.CellIndex(0, 0));

        Assert.That(topLeftBox, Is.EqualTo(new[] { 0, 1, 2, 6, 7, 8 }));
    }

    [Test]
    public async Task TheSameDigitTwiceInASixBySixBoxIsAConflict()
    {
        var shape = BoardShape.SixBySix;
        var topLeft = shape.CellIndex(0, 0);
        var sameBoxOtherRowAndColumn = shape.CellIndex(1, 2);
        var board = BoardWithDigitAt(shape, topLeft, sameBoxOtherRowAndColumn);

        var conflicts = await logic.ConflictingCellsAsync(shape, board);

        Assert.That(conflicts, Is.EqualTo(new[] { topLeft, sameBoxOtherRowAndColumn }));
    }

    // Two rows down is outside a box that is two rows tall, but would be inside one that is three rows tall
    [Test]
    public async Task TheSameDigitInTheSixBySixBoxBelowIsNoConflict()
    {
        var shape = BoardShape.SixBySix;
        var board = BoardWithDigitAt(shape, shape.CellIndex(0, 0), shape.CellIndex(2, 1));

        var conflicts = await logic.ConflictingCellsAsync(shape, board);

        Assert.That(conflicts, Is.Empty);
    }

    [TestCaseSource(typeof(BoardShape), nameof(BoardShape.Small))]
    public async Task FillingTheTopRowCompletesOnlyThatRow(BoardShape shape)
    {
        var board = BoardWithOnlyTopRowSolved(shape);

        var completedUnits = await logic.CompletedUnitsThroughAsync(shape, board, shape.CellIndex(0, 0));

        Assert.That(completedUnits, Is.EqualTo(new[] { "row" }));
    }

    private static IEnumerable<int> CluesOf(int[] puzzle) =>
        Enumerable.Range(0, puzzle.Length).Where(cellIndex => puzzle[cellIndex] != Empty);

    private static int[] BoardWithDigitAt(BoardShape shape, params int[] cellIndexes)
    {
        var board = new int[shape.Size * shape.Size];
        foreach (var cellIndex in cellIndexes) board[cellIndex] = AnyDigit;
        return board;
    }

    private static int[] BoardWithOnlyTopRowSolved(BoardShape shape)
    {
        var board = new int[shape.Size * shape.Size];
        Array.Copy(shape.SolvedBoard, board, shape.Size);
        return board;
    }
}
