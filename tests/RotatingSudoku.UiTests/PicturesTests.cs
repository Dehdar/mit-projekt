using RotatingSudoku.UiTests.Support;

namespace RotatingSudoku.UiTests;

[Parallelizable(ParallelScope.Self)]
public class PicturesTests : SudokuTest
{
    private const int EraseButtons = 1;

    private static readonly object[] LevelsWithEachBoardSize =
    [
        new object[] { 1, BoardShape.FourByFour },
        new object[] { 6, BoardShape.SixBySix },
        new object[] { SavedGame.FirstNineByNineLevel, BoardShape.NineByNine },
    ];

    [TestCaseSource(nameof(LevelsWithEachBoardSize))]
    public async Task EachBoardSizeHasOnePictureButtonPerDigit(int level, BoardShape shape)
    {
        await Game.OpenAsync(new SavedGame { Level = level, Shape = shape });

        await Expect(Game.PictureButtons).ToHaveCountAsync(shape.Size + EraseButtons);
        foreach (var name in Symbols.On(shape)) await Expect(Game.PictureButton(name)).ToBeVisibleAsync();
    }

    [Test]
    public async Task AGivenCellIsNamedAfterItsPicture()
    {
        await Game.OpenAsync(new SavedGame());

        var givenDigit = SavedGame.SolutionAt(Cell.NextToTopLeft);

        await Expect(Game.CellAt(Cell.NextToTopLeft)).ToHaveAccessibleNameAsync(Symbols.NameOf(givenDigit));
    }

    [Test]
    public async Task PictureNamesAreTranslatedToDanish()
    {
        await Game.OpenAsync(new SavedGame());

        await Game.Button("Dansk").ClickAsync();

        await Expect(Game.PictureButton("Enhjørning")).ToBeVisibleAsync();
        await Expect(Game.CellAt(Cell.TopLeft)).ToHaveAccessibleNameAsync("Tomt felt");
    }
}
