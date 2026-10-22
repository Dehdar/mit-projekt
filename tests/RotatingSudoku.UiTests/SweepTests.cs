using RotatingSudoku.UiTests.Support;

namespace RotatingSudoku.UiTests;

[Parallelizable(ParallelScope.Self)]
public class SweepTests : SudokuTest
{
    private const int AnnouncementSeconds = 2;
    private const int RotateEverySeconds = 10;

    // The cell below the top-left one keeps the first column and box open,
    // so filling the top-left cell completes only the top row
    private static readonly SavedGame OneCellFromACompleteRow = new() { EmptyCells = [Cell.TopLeft, Cell.BelowTopLeft] };

    [Test]
    public async Task CompletingARowAnnouncesIt()
    {
        await Game.OpenAsync(OneCellFromACompleteRow);

        await FillTopLeftCorrectlyAsync();

        await Expect(Game.Text("Row complete!")).ToBeVisibleAsync();
    }

    [Test]
    public async Task CompletingARowColumnAndBoxAtOnceAnnouncesAllThree()
    {
        await Game.OpenAsync(new SavedGame());

        await FillTopLeftCorrectlyAsync();

        await Expect(Game.Text("Row + Column + Box complete!")).ToBeVisibleAsync();
    }

    [Test]
    public async Task ARowTurnedOnItsSideIsAnnouncedAsAColumn()
    {
        await Game.OpenAsync(OneCellFromACompleteRow);
        await Game.WaitSecondsAsync(RotateEverySeconds);

        await FillTopLeftCorrectlyAsync();

        await Expect(Game.Text("Column complete!")).ToBeVisibleAsync();
    }

    [Test]
    public async Task AllThreeAreAnnouncedInTheSameOrderOnATurnedBoard()
    {
        await Game.OpenAsync(new SavedGame());
        await Game.WaitSecondsAsync(RotateEverySeconds);

        await FillTopLeftCorrectlyAsync();

        await Expect(Game.Text("Row + Column + Box complete!")).ToBeVisibleAsync();
    }

    [Test]
    public async Task AWrongDigitAnnouncesNothing()
    {
        await Game.OpenAsync(OneCellFromACompleteRow);
        var wrongDigit = SavedGame.SolutionAt(Cell.NextToTopLeft);

        await Game.EnterDigitAsync(Cell.TopLeft, wrongDigit);

        await Expect(Game.Text("Row complete!")).ToBeHiddenAsync();
    }

    [Test]
    public async Task TheAnnouncementDisappearsAfterAMoment()
    {
        await Game.OpenAsync(OneCellFromACompleteRow);
        await FillTopLeftCorrectlyAsync();

        await Game.WaitSecondsAsync(AnnouncementSeconds);

        await Expect(Game.Text("Row complete!")).ToBeHiddenAsync();
    }

    [Test]
    public async Task TheAnnouncementIsTranslatedToDanish()
    {
        await Game.OpenAsync(OneCellFromACompleteRow);
        await Game.Button("Dansk").ClickAsync();

        await FillTopLeftCorrectlyAsync();

        await Expect(Game.Text("Række klaret!")).ToBeVisibleAsync();
    }

    private async Task FillTopLeftCorrectlyAsync() =>
        await Game.EnterDigitAsync(Cell.TopLeft, SavedGame.SolutionAt(Cell.TopLeft));
}
