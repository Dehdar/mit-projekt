namespace RotatingSudoku.UiTests.Support;

// The picture that stands for each digit, by the name a screen reader hears in English
internal static class Symbols
{
    private static readonly string[] Names = ["Heart", "Star", "Moon", "Flower", "Raindrop", "Crown", "Gem", "Rainbow", "Unicorn"];

    public const string EmptyCell = "Empty cell";

    public static string NameOf(int digit) => Names[digit - 1];

    public static IEnumerable<string> On(BoardShape shape) => Names.Take(shape.Size);
}
