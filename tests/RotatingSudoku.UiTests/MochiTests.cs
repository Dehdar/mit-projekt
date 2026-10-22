using RotatingSudoku.UiTests.Support;

namespace RotatingSudoku.UiTests;

[Parallelizable(ParallelScope.Self)]
public class MochiTests : SudokuTest
{
    private const int ReactionSeconds = 4;

    [Test]
    public async Task MochiSpeaksWhenALevelStarts()
    {
        await Game.OpenAsync(new SavedGame());

        await Expect(Game.MochiSpeech).ToBeVisibleAsync();
    }

    [Test]
    public async Task MochiGoesQuietAfterAFewSeconds()
    {
        await Game.OpenAsync(new SavedGame());

        await Game.WaitSecondsAsync(ReactionSeconds);

        await Expect(Game.MochiSpeech).ToBeHiddenAsync();
    }

    [Test]
    public async Task MochiReactsToAWrongDigit()
    {
        await Game.OpenAsync(new SavedGame());
        await Game.SelectCellAsync(Cell.TopLeft);
        await Game.WaitSecondsAsync(ReactionSeconds);
        var wrongDigit = SavedGame.SolutionAt(Cell.NextToTopLeft);

        await Game.PictureButton(Symbols.NameOf(wrongDigit)).ClickAsync();

        await Expect(Game.MochiSpeech).ToBeVisibleAsync();
    }

    [Test]
    public async Task MochiReactsWhenARowIsCompleted()
    {
        await Game.OpenAsync(new SavedGame { EmptyCells = [Cell.TopLeft, Cell.BelowTopLeft] });
        await Game.SelectCellAsync(Cell.TopLeft);
        await Game.WaitSecondsAsync(ReactionSeconds);
        var rightDigit = SavedGame.SolutionAt(Cell.TopLeft);

        await Game.PictureButton(Symbols.NameOf(rightDigit)).ClickAsync();

        await Expect(Game.MochiSpeech).ToBeVisibleAsync();
    }
}
