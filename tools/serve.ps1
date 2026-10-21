# Minimal statisk webserver til at prøve spillene lokalt uden at installere noget.
# Brug: pwsh -File tools/serve.ps1 -Root roterende-sudoku -Port 5173
param(
  [Parameter(Mandatory)][string]$Root,
  [int]$Port = 5173
)

$ErrorActionPreference = "Stop"
$rootPath = (Resolve-Path $Root).Path
$contentTypes = @{
  ".html" = "text/html; charset=utf-8"
  ".css"  = "text/css; charset=utf-8"
  ".js"   = "text/javascript; charset=utf-8"
  ".svg"  = "image/svg+xml"
  ".png"  = "image/png"
  ".ico"  = "image/x-icon"
  ".json" = "application/json; charset=utf-8"
}

function Get-RequestedFile([System.Net.HttpListenerRequest]$request) {
  $relativePath = [Uri]::UnescapeDataString($request.Url.AbsolutePath.TrimStart('/'))
  if ($relativePath -eq "") { $relativePath = "index.html" }
  $fullPath = [IO.Path]::GetFullPath((Join-Path $rootPath $relativePath))
  # Afvis stier som ../, der peger uden for roden
  $isInsideRoot = $fullPath.StartsWith($rootPath, [StringComparison]::OrdinalIgnoreCase)
  if ($isInsideRoot -and (Test-Path $fullPath -PathType Leaf)) { return $fullPath }
  return $null
}

function Send-File([System.Net.HttpListenerContext]$context, [string]$file) {
  $bytes = [IO.File]::ReadAllBytes($file)
  $response = $context.Response
  $contentType = $contentTypes[[IO.Path]::GetExtension($file).ToLowerInvariant()]
  $response.ContentType = $(if ($contentType) { $contentType } else { "application/octet-stream" })
  # Ingen cache, så en genindlæsning altid viser de seneste ændringer
  $response.Headers.Add("Cache-Control", "no-store")
  $response.ContentLength64 = $bytes.Length
  # Et HEAD-svar må ikke have en krop
  if ($context.Request.HttpMethod -ne "HEAD") { $response.OutputStream.Write($bytes, 0, $bytes.Length) }
}

function Send-Response([System.Net.HttpListenerContext]$context) {
  $file = Get-RequestedFile $context.Request
  if ($file) { Send-File $context $file }
  else { $context.Response.StatusCode = 404 }
}

$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
Write-Host "Serverer $rootPath via http://localhost:$Port/"

try {
  while ($listener.IsListening) {
    $context = $listener.GetContext()
    # En afbrudt forbindelse må ikke lukke hele serveren
    try { Send-Response $context }
    catch { Write-Warning "$($context.Request.Url): $_" }
    finally { $context.Response.Close() }
  }
}
finally {
  $listener.Stop()
}
