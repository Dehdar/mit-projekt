using RotatingSudoku.UiTests.Support;

namespace RotatingSudoku.UiTests;

[Parallelizable(ParallelScope.Self)]
public class StarsTests : SudokuTest
{
    private const int CarefulOopsiesLimit = 2;
    private const string BothStars = "You have 2 of 2 stars on this level.";
    private const string OnlyTheFinishingStar = "You have 1 of 2 stars on this level.";

    private static readonly SavedGame OneCellFromSolved = new() { EmptyCells = [Cell.TopLeft] };

    [Test]
    public async Task FinishingWithoutOopsiesEarnsBothStars()
    {
        await Game.OpenAsync(OneCellFromSolved);

        await SolveLastCellAsync();

        await Expect(Game.Text(BothStars)).ToBeVisibleAsync();
    }

    [Test]
    public async Task TwoOopsiesStillEarnTheCarefulStar()
    {
        await Game.OpenAsync(OneCellFromSolved);
        await MakeOopsiesAsync(CarefulOopsiesLimit);

        await SolveLastCellAsync();

        await Expect(Game.Text(BothStars)).ToBeVisibleAsync();
    }

    [Test]
    public async Task ThreeOopsiesCostTheCarefulStar()
    {
        await Game.OpenAsync(OneCellFromSolved);
        await MakeOopsiesAsync(CarefulOopsiesLimit + 1);

        await SolveLastCellAsync();

        await Expect(Game.Text(OnlyTheFinishingStar)).ToBeVisibleAsync();
    }

    [Test]
    public async Task OopsiesAreStillCountedAfterReloading()
    {
        await Game.OpenAsync(OneCellFromSolved);
        await MakeOopsiesAsync(CarefulOopsiesLimit + 1);

        await Game.ReloadAsync();
        await SolveLastCellAsync();

        await Expect(Game.Text(OnlyTheFinishingStar)).ToBeVisibleAsync();
    }

    [Test]
    public async Task ReplayingALevelNeverLowersItsStars()
    {
        await Game.OpenAsync(OneCellFromSolved with { Oopsies = CarefulOopsiesLimit + 1 }, SavedProgress.WithStars(OneCellFromSolved.Level, stars: 2));

        await SolveLastCellAsync();

        await Expect(Game.Text(BothStars)).ToBeVisibleAsync();
    }

    [Test]
    public async Task ReplayingALevelCanRaiseItsStars()
    {
        await Game.OpenAsync(OneCellFromSolved, SavedProgress.WithStars(OneCellFromSolved.Level, stars: 1));

        await SolveLastCellAsync();

        await Expect(Game.Text(BothStars)).ToBeVisibleAsync();
    }

    [Test]
    public async Task LevelCompleteNamesWhatEachStarIsFor()
    {
        await Game.OpenAsync(OneCellFromSolved);

        await SolveLastCellAsync();

        await Expect(Game.Text("Finished the puzzle")).ToBeVisibleAsync();
        await Expect(Game.Text("Careful: 2 oopsies or fewer")).ToBeVisibleAsync();
    }

    [Test]
    public async Task StarsAreExplainedInDanish()
    {
        await Game.OpenAsync(OneCellFromSolved);
        await Game.Button("Dansk").ClickAsync();

        await SolveLastCellAsync();

        await Expect(Game.Text("Du har 2 af 2 stjerner på dette level.")).ToBeVisibleAsync();
        await Expect(Game.Text("Omhyggelig: højst 2 smuttere")).ToBeVisibleAsync();
    }

    // Each oops is a different wrong digit, because entering the same digit again changes nothing
    private async Task MakeOopsiesAsync(int count)
    {
        foreach (var wrongDigit in SavedGame.WrongDigitsAt(Cell.TopLeft).Take(count))
        {
            await Game.EnterDigitAsync(Cell.TopLeft, wrongDigit);
        }
    }

    private async Task SolveLastCellAsync() =>
        await Game.EnterDigitAsync(Cell.TopLeft, SavedGame.SolutionAt(Cell.TopLeft));
}
