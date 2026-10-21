using RotatingSudoku.UiTests.Support;

namespace RotatingSudoku.UiTests;

[Parallelizable(ParallelScope.Self)]
public class LanguageTests : SudokuTest
{
    [Test]
    public async Task DanishButtonTranslatesThePageButKeepsTheGameName()
    {
        await Game.OpenAsync(new SavedGame());

        await Game.Button("Dansk").ClickAsync();

        await Expect(Game.Button("Slet")).ToBeVisibleAsync();
        await Expect(Game.Heading("Rotating Sudoku")).ToBeVisibleAsync();
    }

    [Test]
    public async Task ChosenLanguageIsRememberedAfterReloading()
    {
        await Game.OpenAsync(new SavedGame());
        await Game.Button("Dansk").ClickAsync();

        await Game.ReloadAsync();

        await Expect(Game.Button("Slet")).ToBeVisibleAsync();
    }
}
