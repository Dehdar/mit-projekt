using RotatingSudoku.UiTests.Support;

namespace RotatingSudoku.UiTests;

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

        await Expect(Game.Heading("Level 1 complete!")).ToBeVisibleAsync();
    }

    [Test]
    public async Task NextLevelButtonStartsTheNextLevel()
    {
        await Game.OpenAsync(OneCellFromSolved);
        await SolveLastCellAsync();

        await Game.Button("Next level").ClickAsync();

        await Expect(Game.Text("2 / 20")).ToBeVisibleAsync();
    }

    [Test]
    public async Task SolvingTheLastLevelShowsAllLevelsComplete()
    {
        await Game.OpenAsync(OneCellFromSolved with { Level = LastLevel });

        await SolveLastCellAsync();

        await Expect(Game.Heading("You beat all 20 levels!")).ToBeVisibleAsync();
    }

    [Test]
    public async Task PlayAgainAfterTheLastLevelStartsOverFromLevelOne()
    {
        await Game.OpenAsync(OneCellFromSolved with { Level = LastLevel });
        await SolveLastCellAsync();

        await Game.Button("Play again").ClickAsync();

        await Expect(Game.Text("1 / 20")).ToBeVisibleAsync();
    }

    private async Task SolveLastCellAsync() =>
        await Game.EnterDigitAsync(Cell.TopLeft, SavedGame.SolutionAt(Cell.TopLeft));
}
