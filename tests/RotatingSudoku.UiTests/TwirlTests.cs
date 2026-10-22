using RotatingSudoku.UiTests.Support;

namespace RotatingSudoku.UiTests;

[Parallelizable(ParallelScope.Self)]
public class TwirlTests : SudokuTest
{
    private const int FirstTwirlingLevel = 3;
    private const int TwirlEveryOnLevelThree = 3;
    private const string NoGlow = "none";

    // A quarter turn clockwise: cos(90°) is almost 0, sin(90°) is 1
    private static readonly Regex QuarterTurn = new(@"^matrix\([^,]+, 1, -1, [^,]+, 0, 0\)$");
    private static readonly Regex NoTurn = new(@"^(none|matrix\(1, 0, 0, 1, 0, 0\))$");

    // One empty cell in every row, column and box, so the board is not solved before the last of them
    private static readonly Cell[] Diagonal = [new(0, 0), new(1, 1), new(2, 2), new(3, 3)];

    private static readonly SavedGame LevelThree = new()
    {
        Level = FirstTwirlingLevel,
        Shape = BoardShape.FourByFour,
        EmptyCells = Diagonal,
    };

    [Test]
    public async Task TheBoardTwirlsAQuarterTurnAfterEnoughCorrectDigits()
    {
        await Game.OpenAsync(LevelThree);

        await FillCorrectlyAsync(TwirlEveryOnLevelThree);

        await Expect(Game.Board).ToHaveCSSAsync("transform", QuarterTurn);
    }

    [Test]
    public async Task TheBoardStaysStillUntilTheLastCorrectDigitBeforeATwirl()
    {
        await Game.OpenAsync(LevelThree);

        await FillCorrectlyAsync(TwirlEveryOnLevelThree - 1);
        await Game.WaitForTheBoardToStopTurningAsync();

        await Expect(Game.Board).ToHaveCSSAsync("transform", NoTurn);
    }

    [Test]
    public async Task TheBoardGlowsWhenOneMoreCorrectDigitWillTwirlIt()
    {
        await Game.OpenAsync(LevelThree);

        await FillCorrectlyAsync(TwirlEveryOnLevelThree - 1);

        await Expect(Game.Board).Not.ToHaveCSSAsync("box-shadow", NoGlow);
    }

    [Test]
    public async Task TheBoardDoesNotGlowWhileATwirlIsStillFarAway()
    {
        await Game.OpenAsync(LevelThree);

        await FillCorrectlyAsync(1);

        await Expect(Game.Board).ToHaveCSSAsync("box-shadow", NoGlow);
    }

    [Test]
    public async Task WrongDigitsDoNotBringATwirlCloser()
    {
        await Game.OpenAsync(LevelThree);

        foreach (var cell in Diagonal.Take(TwirlEveryOnLevelThree)) await Game.EnterDigitAsync(cell, WrongDigitAt(cell));
        await Game.WaitForTheBoardToStopTurningAsync();

        await Expect(Game.Board).ToHaveCSSAsync("transform", NoTurn);
    }

    [TestCase(1)]
    [TestCase(2)]
    public async Task TheFirstTwoLevelsNeverTwirl(int level)
    {
        await Game.OpenAsync(LevelThree with { Level = level });

        await FillCorrectlyAsync(Diagonal.Length - 1);
        await Game.WaitForTheBoardToStopTurningAsync();

        await Expect(Game.Board).ToHaveCSSAsync("transform", NoTurn);
    }

    [Test]
    public async Task ATwirledBoardIsStillTurnedAfterReloading()
    {
        await Game.OpenAsync(LevelThree);
        await FillCorrectlyAsync(TwirlEveryOnLevelThree);

        await Game.ReloadAsync();

        await Expect(Game.Board).ToHaveCSSAsync("transform", QuarterTurn);
    }

    private async Task FillCorrectlyAsync(int count)
    {
        foreach (var cell in Diagonal.Take(count))
        {
            await Game.EnterDigitAsync(cell, BoardShape.FourByFour.SolutionAt(cell));
        }
    }

    private static int WrongDigitAt(Cell cell) => BoardShape.FourByFour.SolutionAt(cell) % 4 + 1;
}
