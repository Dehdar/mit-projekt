using RoterendeSudoku.UiTests.Support;

namespace RoterendeSudoku.UiTests;

[Parallelizable(ParallelScope.Self)]
public class LanguageTests : SudokuTest
{
    [Test]
    public async Task EnglishButtonTranslatesThePage()
    {
        await Game.OpenAsync(new SavedGame());

        await Game.Button("English").ClickAsync();

        await Expect(Game.Heading("Rotating Sudoku")).ToBeVisibleAsync();
        await Expect(Game.Button("Erase")).ToBeVisibleAsync();
    }

    [Test]
    public async Task ChosenLanguageIsRememberedAfterReloading()
    {
        await Game.OpenAsync(new SavedGame());
        await Game.Button("English").ClickAsync();

        await Game.ReloadAsync();

        await Expect(Game.Heading("Rotating Sudoku")).ToBeVisibleAsync();
    }
}
