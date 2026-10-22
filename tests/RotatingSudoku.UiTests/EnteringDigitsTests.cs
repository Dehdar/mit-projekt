using RotatingSudoku.UiTests.Support;

namespace RotatingSudoku.UiTests;

[Parallelizable(ParallelScope.Self)]
public class EnteringDigitsTests : SudokuTest
{
    private const int RaindropDigit = 5;

    [Test]
    public async Task ClickingAPictureButtonPutsThePictureInTheSelectedCell()
    {
        await Game.OpenAsync(new SavedGame());

        await Game.EnterDigitAsync(Cell.TopLeft, RaindropDigit);

        await Expect(Game.CellAt(Cell.TopLeft)).ToHaveAccessibleNameAsync("Raindrop");
    }

    [Test]
    public async Task TypingADigitPutsItsPictureInTheSelectedCell()
    {
        await Game.OpenAsync(new SavedGame());

        await Game.TypeKeyAsync(Cell.TopLeft, "5");

        await Expect(Game.CellAt(Cell.TopLeft)).ToHaveAccessibleNameAsync("Raindrop");
    }

    [Test]
    public async Task EraseButtonClearsTheSelectedCell()
    {
        await Game.OpenAsync(new SavedGame());
        await Game.EnterDigitAsync(Cell.TopLeft, RaindropDigit);

        await Game.Button("Erase").ClickAsync();

        await Expect(Game.CellAt(Cell.TopLeft)).ToHaveAccessibleNameAsync(Symbols.EmptyCell);
    }

    [Test]
    public async Task BackspaceClearsTheSelectedCell()
    {
        await Game.OpenAsync(new SavedGame());
        await Game.EnterDigitAsync(Cell.TopLeft, RaindropDigit);

        await Game.TypeKeyAsync(Cell.TopLeft, "Backspace");

        await Expect(Game.CellAt(Cell.TopLeft)).ToHaveAccessibleNameAsync(Symbols.EmptyCell);
    }

    [Test]
    public async Task GivenDigitsCannotBeChanged()
    {
        await Game.OpenAsync(new SavedGame());
        var givenDigit = SavedGame.SolutionAt(Cell.NextToTopLeft);

        await Game.EnterDigitAsync(Cell.NextToTopLeft, givenDigit % 9 + 1);

        await Expect(Game.CellAt(Cell.NextToTopLeft)).ToHaveAccessibleNameAsync(Symbols.NameOf(givenDigit));
    }

    [Test]
    public async Task ClashingPicturesGetADottedRing()
    {
        await Game.OpenAsync(new SavedGame());
        var digitInSameRow = SavedGame.SolutionAt(Cell.NextToTopLeft);

        await Game.EnterDigitAsync(Cell.TopLeft, digitInSameRow);

        await Expect(Game.CellAt(Cell.TopLeft)).ToHaveCSSAsync("outline-style", "dotted");
        await Expect(Game.CellAt(Cell.NextToTopLeft)).ToHaveCSSAsync("outline-style", "dotted");
    }
}
