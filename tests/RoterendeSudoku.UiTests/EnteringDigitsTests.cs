using RoterendeSudoku.UiTests.Support;

namespace RoterendeSudoku.UiTests;

[Parallelizable(ParallelScope.Self)]
public class EnteringDigitsTests : SudokuTest
{
    private const string ConflictRed = "rgb(220, 38, 38)";

    [Test]
    public async Task ClickingANumberButtonPutsTheDigitInTheSelectedCell()
    {
        await Game.OpenAsync(new SavedGame());

        await Game.EnterDigitAsync(Cell.TopLeft, 5);

        await Expect(Game.CellAt(Cell.TopLeft)).ToHaveTextAsync("5");
    }

    [Test]
    public async Task TypingADigitPutsItInTheSelectedCell()
    {
        await Game.OpenAsync(new SavedGame());

        await Game.TypeKeyAsync(Cell.TopLeft, "5");

        await Expect(Game.CellAt(Cell.TopLeft)).ToHaveTextAsync("5");
    }

    [Test]
    public async Task EraseButtonClearsTheSelectedCell()
    {
        await Game.OpenAsync(new SavedGame());
        await Game.EnterDigitAsync(Cell.TopLeft, 5);

        await Game.Button("Slet").ClickAsync();

        await Expect(Game.CellAt(Cell.TopLeft)).ToHaveTextAsync("");
    }

    [Test]
    public async Task BackspaceClearsTheSelectedCell()
    {
        await Game.OpenAsync(new SavedGame());
        await Game.EnterDigitAsync(Cell.TopLeft, 5);

        await Game.TypeKeyAsync(Cell.TopLeft, "Backspace");

        await Expect(Game.CellAt(Cell.TopLeft)).ToHaveTextAsync("");
    }

    [Test]
    public async Task GivenDigitsCannotBeChanged()
    {
        await Game.OpenAsync(new SavedGame());
        var givenDigit = SavedGame.SolutionAt(Cell.NextToTopLeft);

        await Game.EnterDigitAsync(Cell.NextToTopLeft, givenDigit % 9 + 1);

        await Expect(Game.CellAt(Cell.NextToTopLeft)).ToHaveTextAsync(givenDigit.ToString());
    }

    [Test]
    public async Task ConflictingDigitsAreShownInRed()
    {
        await Game.OpenAsync(new SavedGame());
        var digitInSameRow = SavedGame.SolutionAt(Cell.NextToTopLeft);

        await Game.EnterDigitAsync(Cell.TopLeft, digitInSameRow);

        await Expect(Game.CellAt(Cell.TopLeft)).ToHaveCSSAsync("color", ConflictRed);
        await Expect(Game.CellAt(Cell.NextToTopLeft)).ToHaveCSSAsync("color", ConflictRed);
    }
}
