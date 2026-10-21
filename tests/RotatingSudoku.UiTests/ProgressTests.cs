using RotatingSudoku.UiTests.Support;

namespace RotatingSudoku.UiTests;

[Parallelizable(ParallelScope.Self)]
public class ProgressTests : SudokuTest
{
    private static readonly SavedGame LevelFive = new() { Level = 5, TimeLeft = 300 };

    [Test]
    public async Task EnteredDigitsAreStillThereAfterReloading()
    {
        await Game.OpenAsync(new SavedGame());
        await Game.EnterDigitAsync(Cell.TopLeft, 5);

        await Game.ReloadAsync();

        await Expect(Game.CellAt(Cell.TopLeft)).ToHaveTextAsync("5");
    }

    [Test]
    public async Task ConfirmedResetStartsOverFromLevelOne()
    {
        await Game.OpenAsync(LevelFive);

        await Game.ResetAndConfirmAsync();

        await Expect(Game.Text("1 / 20")).ToBeVisibleAsync();
    }

    [Test]
    public async Task CancelledResetKeepsTheCurrentGame()
    {
        await Game.OpenAsync(LevelFive);

        await Game.ResetAndCancelAsync();

        await Expect(Game.Text("5 / 20")).ToBeVisibleAsync();
    }
}
