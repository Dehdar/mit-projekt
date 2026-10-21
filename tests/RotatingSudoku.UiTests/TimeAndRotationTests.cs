using RotatingSudoku.UiTests.Support;

namespace RotatingSudoku.UiTests;

[Parallelizable(ParallelScope.Self)]
public class TimeAndRotationTests : SudokuTest
{
    private const string WarningRed = "rgb(220, 38, 38)";

    // A quarter turn clockwise: cos(90°) is almost 0, sin(90°) is 1
    private static readonly Regex QuarterTurn = new(@"^matrix\([^,]+, 1, -1, [^,]+, 0, 0\)$");

    [Test]
    public async Task NewGameStartsAtLevelOneWithFifteenMinutes()
    {
        await Game.OpenNewGameAsync();

        await Expect(Game.Text("1 / 20")).ToBeVisibleAsync();
        await Expect(Game.Text("15:00")).ToBeVisibleAsync();
    }

    [Test]
    public async Task TimeCountsDownEverySecond()
    {
        await Game.OpenAsync(new SavedGame());

        await Game.WaitSecondsAsync(1);

        await Expect(Game.Text("14:59")).ToBeVisibleAsync();
    }

    [Test]
    public async Task TimeTurnsRedInTheLastMinute()
    {
        await Game.OpenAsync(new SavedGame { TimeLeft = 61 });

        await Game.WaitSecondsAsync(1);

        await Expect(Game.Text("1:00")).ToHaveCSSAsync("color", WarningRed);
    }

    [Test]
    public async Task CountdownShowsSecondsUntilTheNextRotation()
    {
        await Game.OpenAsync(new SavedGame());

        await Game.WaitSecondsAsync(3);

        await Expect(Game.Text("7 s")).ToBeVisibleAsync();
    }

    [Test]
    public async Task BoardTurnsAQuarterTurnAfterTenSeconds()
    {
        await Game.OpenAsync(new SavedGame());

        await Game.WaitSecondsAsync(10);

        await Expect(Game.Board).ToHaveCSSAsync("transform", QuarterTurn);
    }
}
