using System.Globalization;
using Microsoft.Playwright;

namespace RoterendeSudoku.UiTests.Support;

// Fælles opsætning, der gør hver test gentagelig: fast tid og fast "tilfældighed"
public abstract class SudokuTest : PageTest
{
    // Mochi kommenterer, når Math.random() < 0.5, og skubber, når den er < 0.3,
    // så 0.4 får hende til altid at kommentere, men aldrig skubbe
    private const double FixedRandomValue = 0.4;

    private static readonly DateTime StartTime = new(2026, 1, 1, 12, 0, 0);

    internal SudokuPage Game { get; private set; } = null!;

    public override BrowserNewContextOptions ContextOptions() => new() { ColorScheme = ColorScheme.Light };

    [SetUp]
    public async Task MakePageDeterministic()
    {
        await Page.Clock.InstallAsync(new() { TimeDate = StartTime });
        await Page.Clock.PauseAtAsync(StartTime.AddSeconds(1));
        await Page.AddInitScriptAsync($"Math.random = () => {FixedRandomValue.ToString(CultureInfo.InvariantCulture)};");
        Game = new SudokuPage(Page);
    }
}
