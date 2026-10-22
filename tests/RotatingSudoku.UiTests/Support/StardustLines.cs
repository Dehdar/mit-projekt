using System.Text.Json;
using Microsoft.Playwright;

namespace RotatingSudoku.UiTests.Support;

// Reads Stardust's line tables in the page, because most events need a long game to reach
internal sealed class StardustLines(IPage page)
{
    public async Task<string[]> EventsAsync() =>
        await page.EvaluateAsync<string[]>("() => Object.keys(MOODS)");

    // Sent as JSON, because Playwright does not turn a page object into a dictionary
    public async Task<Dictionary<string, string[]>> LinesInAsync(string language)
    {
        var json = await page.EvaluateAsync<string>("language => JSON.stringify(LINES[language])", language);
        return JsonSerializer.Deserialize<Dictionary<string, string[]>>(json)!;
    }
}
