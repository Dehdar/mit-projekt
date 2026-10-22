using Microsoft.Playwright;

namespace RotatingSudoku.UiTests.Support;

internal sealed class SudokuPage(IPage page)
{
    private const int MillisecondsPerSecond = 1000;

    // Cells are found by their place on the board, so the page needs to know how big the board is
    private BoardShape shape = BoardShape.NineByNine;

    public ILocator Board => page.GetByTestId("board");
    public ILocator MochiSpeech => page.GetByRole(AriaRole.Status);

    public ILocator Cells => page.GetByTestId("cell");
    public ILocator CellAt(Cell cell) => Cells.Nth(shape.IndexOf(cell));
    public ILocator Heading(string name) => page.GetByRole(AriaRole.Heading, new() { Name = name, Exact = true });
    public ILocator Button(string name) => page.GetByRole(AriaRole.Button, new() { Name = name, Exact = true });
    public ILocator Text(string text) => page.GetByText(text, new() { Exact = true });

    // A new game starts on level 1, which has the smallest board
    public async Task OpenNewGameAsync()
    {
        shape = BoardShape.FourByFour;
        await page.GotoAsync(GameLocation.IndexUrl);
    }

    public async Task OpenAsync(params ISavedData[] saves)
    {
        shape = saves.OfType<SavedGame>().FirstOrDefault()?.Shape ?? shape;
        await page.AddInitScriptAsync(StorageSeed.InitScriptFor(saves));
        await page.GotoAsync(GameLocation.IndexUrl);
    }

    public async Task ReloadAsync() => await page.ReloadAsync();

    // A turn starts from where the board was, so "not turned" can only be judged once any turn has finished
    public async Task WaitForTheBoardToStopTurningAsync() =>
        await Board.EvaluateAsync(
            "board => Promise.all(board.getAnimations().filter((animation) => animation instanceof CSSTransition).map((animation) => animation.finished))");

    public async Task SelectCellAsync(Cell cell) => await CellAt(cell).ClickAsync();

    public async Task EnterDigitAsync(Cell cell, int digit)
    {
        await SelectCellAsync(cell);
        await Button(digit.ToString()).ClickAsync();
    }

    public async Task TypeKeyAsync(Cell cell, string key)
    {
        await SelectCellAsync(cell);
        await page.Keyboard.PressAsync(key);
    }

    public async Task WaitSecondsAsync(int seconds) => await page.Clock.RunForAsync(seconds * MillisecondsPerSecond);

    public async Task ResetAndConfirmAsync()
    {
        page.Dialog += AcceptDialog;
        await Button("Reset game").ClickAsync();
        page.Dialog -= AcceptDialog;
    }

    public async Task ResetAndCancelAsync()
    {
        page.Dialog += DismissDialog;
        await Button("Reset game").ClickAsync();
        page.Dialog -= DismissDialog;
    }

    private static async void AcceptDialog(object? sender, IDialog dialog) => await dialog.AcceptAsync();
    private static async void DismissDialog(object? sender, IDialog dialog) => await dialog.DismissAsync();
}
