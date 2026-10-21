using RoterendeSudoku.UiTests.Support;

namespace RoterendeSudoku.UiTests;

[Parallelizable(ParallelScope.Self)]
public class MochiTests : SudokuTest
{
    private const int ReactionSeconds = 4;
    private const int IdleLimitSeconds = 15;

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

        await Game.Button(wrongDigit.ToString()).ClickAsync();

        await Expect(Game.MochiSpeech).ToBeVisibleAsync();
    }

    [Test]
    public async Task MochiTeasesThePlayerAfterFifteenIdleSeconds()
    {
        await Game.OpenAsync(new SavedGame());
        await Game.WaitSecondsAsync(IdleLimitSeconds - 1);
        await Expect(Game.MochiSpeech).ToBeHiddenAsync();

        await Game.WaitSecondsAsync(1);

        await Expect(Game.MochiSpeech).ToBeVisibleAsync();
    }
}
