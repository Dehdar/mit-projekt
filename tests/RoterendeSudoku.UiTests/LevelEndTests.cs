using RoterendeSudoku.UiTests.Support;

namespace RoterendeSudoku.UiTests;

[Parallelizable(ParallelScope.Self)]
public class LevelEndTests : SudokuTest
{
    private const int LastLevel = 20;

    private static readonly SavedGame OneCellFromSolved = new() { EmptyCells = [Cell.TopLeft] };

    [Test]
    public async Task SolvingTheBoardShowsLevelComplete()
    {
        await Game.OpenAsync(OneCellFromSolved);

        await SolveLastCellAsync();

        await Expect(Game.Heading("Level 1 klaret!")).ToBeVisibleAsync();
    }

    [Test]
    public async Task NextLevelButtonStartsTheNextLevel()
    {
        await Game.OpenAsync(OneCellFromSolved);
        await SolveLastCellAsync();

        await Game.Button("Næste level").ClickAsync();

        await Expect(Game.Text("2 / 20")).ToBeVisibleAsync();
    }

    [Test]
    public async Task SolvingTheLastLevelShowsAllLevelsComplete()
    {
        await Game.OpenAsync(OneCellFromSolved with { Level = LastLevel, TimeLeft = 300 });

        await SolveLastCellAsync();

        await Expect(Game.Heading("Du klarede alle 20 levels!")).ToBeVisibleAsync();
    }

    [Test]
    public async Task PlayAgainAfterTheLastLevelStartsOverFromLevelOne()
    {
        await Game.OpenAsync(OneCellFromSolved with { Level = LastLevel, TimeLeft = 300 });
        await SolveLastCellAsync();

        await Game.Button("Spil igen").ClickAsync();

        await Expect(Game.Text("1 / 20")).ToBeVisibleAsync();
    }

    [Test]
    public async Task RunningOutOfTimeShowsGameOver()
    {
        await Game.OpenAsync(new SavedGame { TimeLeft = 1 });

        await Game.WaitSecondsAsync(1);

        await Expect(Game.Heading("Game over")).ToBeVisibleAsync();
    }

    [Test]
    public async Task TryAgainRestartsTheSameLevelWithFullTime()
    {
        await Game.OpenAsync(new SavedGame { TimeLeft = 1 });
        await Game.WaitSecondsAsync(1);

        await Game.Button("Prøv igen").ClickAsync();

        await Expect(Game.Text("1 / 20")).ToBeVisibleAsync();
        await Expect(Game.Text("15:00")).ToBeVisibleAsync();
    }

    private async Task SolveLastCellAsync() =>
        await Game.EnterDigitAsync(Cell.TopLeft, SavedGame.SolutionAt(Cell.TopLeft));
}
