using Microsoft.Playwright;

namespace RotatingSudoku.UiTests.Support;

// Calls the board logic in sudoku.js inside the page, for the rules a player cannot see directly
internal sealed class BoardLogic(IPage page)
{
    // Asking for no clues makes the generator remove every digit it can while keeping one solution
    private const int FewestPossibleClues = 0;

    public async Task<int[]> MakeHardestPuzzleAsync(BoardShape shape) =>
        await page.EvaluateAsync<int[]>(
            "({ shapeName, clueCount }) => makePuzzle(BOARD_SHAPES[shapeName], clueCount)",
            new { shapeName = shape.Name, clueCount = FewestPossibleClues });

    public async Task<bool> HasUniqueSolutionAsync(BoardShape shape, int[] puzzle) =>
        await page.EvaluateAsync<bool>(
            "({ shapeName, puzzle }) => hasUniqueSolution(BOARD_SHAPES[shapeName], puzzle)",
            new { shapeName = shape.Name, puzzle });

    public async Task<int[]> SolveAsync(BoardShape shape, int[] puzzle) =>
        await page.EvaluateAsync<int[]>(
            "({ shapeName, puzzle }) => solvePuzzle(BOARD_SHAPES[shapeName], puzzle)",
            new { shapeName = shape.Name, puzzle });

    public async Task<bool> IsSolvedAsync(BoardShape shape, int[] board) =>
        await page.EvaluateAsync<bool>(
            "({ shapeName, board }) => isSolved(BOARD_SHAPES[shapeName], board)",
            new { shapeName = shape.Name, board });

    public async Task<int[]> BoxCellsThroughAsync(BoardShape shape, int cellIndex) =>
        await page.EvaluateAsync<int[]>(
            """
            ({ shapeName, cellIndex }) =>
              unitsThrough(BOARD_SHAPES[shapeName], cellIndex).find((unit) => unit.kind === "box").cells
            """,
            new { shapeName = shape.Name, cellIndex });

    public async Task<int[]> ConflictingCellsAsync(BoardShape shape, int[] board) =>
        await page.EvaluateAsync<int[]>(
            "({ shapeName, board }) => [...findConflicts(BOARD_SHAPES[shapeName], board)].sort((a, b) => a - b)",
            new { shapeName = shape.Name, board });

    public async Task<string[]> CompletedUnitsThroughAsync(BoardShape shape, int[] board, int cellIndex) =>
        await page.EvaluateAsync<string[]>(
            """
            ({ shapeName, board, solution, cellIndex }) =>
              completedUnitsThrough(BOARD_SHAPES[shapeName], board, solution, cellIndex).map((unit) => unit.kind)
            """,
            new { shapeName = shape.Name, board, solution = shape.SolvedBoard, cellIndex });
}
