param(
  [Parameter(Mandatory = $true)][string]$PublicImage,
  [Parameter(Mandatory = $true)][string]$StaffImage,
  [Parameter(Mandatory = $true)][string]$ApiImage,
  [string]$Output = "release-manifest.json"
)
$ErrorActionPreference = 'Stop'
$digestPattern = '@sha256:[0-9a-f]{64}$'
foreach ($image in @($PublicImage, $StaffImage, $ApiImage)) {
  if ($image -notmatch $digestPattern) { throw "Image must use an immutable sha256 digest: $image" }
}
if ((git status --porcelain).Length -ne 0) { throw 'Release manifests require a clean tree.' }
$commit = (git rev-parse HEAD).Trim()
$tree = (git rev-parse 'HEAD^{tree}').Trim()
$schema = (Get-ChildItem backend/src/main/resources/db/migration/V*.sql | ForEach-Object { if ($_.Name -match '^V([0-9]+)__') { [int]$Matches[1] } } | Measure-Object -Maximum).Maximum
$manifest = [ordered]@{
  manifest_version = 1
  created_at_utc = [DateTimeOffset]::UtcNow.ToString('o')
  commit = $commit
  tree = $tree
  schema_version = $schema
  runtimes = [ordered]@{ node = '24.19.0'; pnpm = '11.25.0'; java = '21'; postgres = '17.11' }
  images = [ordered]@{ public = $PublicImage; staff = $StaffImage; api_worker = $ApiImage }
  required_checks = @('frontend', 'backend', 'browser', 'security', 'container', 'iac')
}
$manifest | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $Output -Encoding utf8NoBOM
Write-Output "Created $Output for commit $commit and schema V$schema"
