param([Parameter(Mandatory = $true)][string]$BaseUrl)
$ErrorActionPreference = 'Stop'
$uri = [Uri]$BaseUrl
if ($uri.Scheme -ne 'https' -and $uri.Host -notin @('127.0.0.1','localhost')) { throw 'Remote smoke tests require HTTPS.' }
foreach ($path in @('/', '/services', '/boards', '/api/v1/public/config')) {
  $response = Invoke-WebRequest -Uri "$($BaseUrl.TrimEnd('/'))$path" -MaximumRedirection 0 -SkipHttpErrorCheck
  if ($response.StatusCode -notin 200,308) { throw "Smoke failed: $path returned $($response.StatusCode)" }
}
Write-Output 'Readiness smoke passed; no mutation was performed.'
