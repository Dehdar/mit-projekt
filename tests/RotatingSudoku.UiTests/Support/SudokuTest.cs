using System.Globalization;
using Microsoft.Playwright;

namespace RotatingSudoku.UiTests.Support;

// Shared setup that makes every test repeatable: fixed time and fixed "randomness"
public abstract class SudokuTest : PageTest
{
    // Mochi comments when Math.random() < 0.5 and shoves when it is < 0.3,
    // so 0.4 makes her always comment but never shove
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
