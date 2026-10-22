using RotatingSudoku.UiTests.Support;

namespace RotatingSudoku.UiTests;

[Parallelizable(ParallelScope.Self)]
public class ProgressTests : SudokuTest
{
    private const int AnHourInSeconds = 60 * 60;
    private const int RaindropDigit = 5;

    private static readonly SavedGame LevelSeventeen = new() { Level = 17 };

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

        await Game.EnterDigitAsync(Cell.TopLeft, RaindropDigit);

        await Expect(Game.CellAt(Cell.TopLeft)).ToHaveAccessibleNameAsync("Raindrop");
    }

    [Test]
    public async Task EnteredDigitsAreStillThereAfterReloading()
    {
        await Game.OpenAsync(new SavedGame());
        await Game.EnterDigitAsync(Cell.TopLeft, RaindropDigit);

        await Game.ReloadAsync();

        await Expect(Game.CellAt(Cell.TopLeft)).ToHaveAccessibleNameAsync("Raindrop");
    }

    [Test]
    public async Task ASaveFromRotatingSudokuIsIgnored()
    {
        var oldSave = new RawSave("rotating-sudoku", LevelSeventeen.ToSaveData());

        await Game.OpenAsync(oldSave);

        await Expect(Game.Text("1 / 20")).ToBeVisibleAsync();
    }

    [Test]
    public async Task ASaveFromBeforeTheBoardCouldTwirlStillLoads()
    {
        await Game.OpenAsync(LevelSeventeen with { Twirls = null });

        await Expect(Game.Text("17 / 20")).ToBeVisibleAsync();
    }

    [Test]
    public async Task ASaveWithTheWrongBoardSizeForItsLevelIsIgnored()
    {
        await Game.OpenAsync(LevelSeventeen with { Level = 1 });

        await Expect(Game.Cells).ToHaveCountAsync(BoardShape.FourByFour.CellCount);
    }

    [Test]
    public async Task ASaveWithMissingFieldsIsIgnored()
    {
        var saveWithoutOopsies = new RawSave(LevelSeventeen.StorageKey, new { level = 17, status = "playing" });

        await Game.OpenAsync(saveWithoutOopsies);

        await Expect(Game.Text("1 / 20")).ToBeVisibleAsync();
    }

    [Test]
    public async Task ConfirmedResetStartsOverFromLevelOne()
    {
        await Game.OpenAsync(LevelSeventeen);

        await Game.ResetAndConfirmAsync();

        await Expect(Game.Text("1 / 20")).ToBeVisibleAsync();
    }

    [Test]
    public async Task CancelledResetKeepsTheCurrentGame()
    {
        await Game.OpenAsync(LevelSeventeen);

        await Game.ResetAndCancelAsync();

        await Expect(Game.Text("17 / 20")).ToBeVisibleAsync();
    }
}
