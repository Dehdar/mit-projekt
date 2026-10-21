using Microsoft.Playwright;

namespace RoterendeSudoku.UiTests.Support;

internal sealed class SudokuPage(IPage page)
{
    private const int MillisecondsPerSecond = 1000;

    public ILocator Board => page.GetByTestId("board");
    public ILocator MochiSpeech => page.GetByRole(AriaRole.Status);

    public ILocator CellAt(Cell cell) => page.GetByTestId("cell").Nth(cell.Index);
    public ILocator Heading(string name) => page.GetByRole(AriaRole.Heading, new() { Name = name, Exact = true });
    public ILocator Button(string name) => page.GetByRole(AriaRole.Button, new() { Name = name, Exact = true });
    public ILocator Text(string text) => page.GetByText(text, new() { Exact = true });

    public async Task OpenNewGameAsync() => await page.GotoAsync(GameLocation.IndexUrl);

    public async Task OpenAsync(SavedGame savedGame)
    {
        await page.AddInitScriptAsync(savedGame.ToInitScript());
        await page.GotoAsync(GameLocation.IndexUrl);
    }

    public async Task ReloadAsync() => await page.ReloadAsync();

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
        await Button("Nulstil spil").ClickAsync();
        page.Dialog -= AcceptDialog;
    }

    public async Task ResetAndCancelAsync()
    {
        page.Dialog += DismissDialog;
        await Button("Nulstil spil").ClickAsync();
        page.Dialog -= DismissDialog;
    }

    private static async void AcceptDialog(object? sender, IDialog dialog) => await dialog.AcceptAsync();
    private static async void DismissDialog(object? sender, IDialog dialog) => await dialog.DismissAsync();
}
