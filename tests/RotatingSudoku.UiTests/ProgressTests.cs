using RotatingSudoku.UiTests.Support;

namespace RotatingSudoku.UiTests;

[Parallelizable(ParallelScope.Self)]
public class ProgressTests : SudokuTest
{
    private const int AnHourInSeconds = 60 * 60;

    private static readonly SavedGame LevelFive = new() { Level = 5 };

    [Test]
    public async Task NewGameStartsAtLevelOne()
    {
        await Game.OpenNewGameAsync();

        await Expect(Game.Text("1 / 20")).ToBeVisibleAsync();
    }

    [Test]
    public async Task ALevelHasNoTimeLimit()
    {
        await Game.OpenAsync(new SavedGame());
        await Game.WaitSecondsAsync(AnHourInSeconds);

        await Game.EnterDigitAsync(Cell.TopLeft, 5);

        await Expect(Game.CellAt(Cell.TopLeft)).ToHaveTextAsync("5");
    }

    [Test]
    public async Task EnteredDigitsAreStillThereAfterReloading()
    {
        await Game.OpenAsync(new SavedGame());
        await Game.EnterDigitAsync(Cell.TopLeft, 5);

        await Game.ReloadAsync();

        await Expect(Game.CellAt(Cell.TopLeft)).ToHaveTextAsync("5");
    }

    [Test]
    public async Task ASaveFromRotatingSudokuIsIgnored()
    {
        var oldSave = new RawSave("rotating-sudoku", LevelFive.ToSaveData());

        await Game.OpenAsync(oldSave);

        await Expect(Game.Text("1 / 20")).ToBeVisibleAsync();
    }

    [Test]
    public async Task ASaveWithMissingFieldsIsIgnored()
    {
        var saveWithoutOopsies = new RawSave(LevelFive.StorageKey, new { level = 5, status = "playing" });

        await Game.OpenAsync(saveWithoutOopsies);

        await Expect(Game.Text("1 / 20")).ToBeVisibleAsync();
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
