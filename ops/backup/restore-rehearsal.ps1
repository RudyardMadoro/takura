param(
  [Parameter(Mandatory = $true)][string]$EncryptedBackup,
  [Parameter(Mandatory = $true)][string]$TargetUrl,
  [Parameter(Mandatory = $true)][string]$EvidenceDirectory
)
$ErrorActionPreference = 'Stop'
if ($env:TAKURA_ENVIRONMENT -ne 'restore-rehearsal') { throw 'Refusing restore unless TAKURA_ENVIRONMENT=restore-rehearsal.' }
if (-not $env:AGE_IDENTITY_FILE) { throw 'AGE_IDENTITY_FILE is required.' }
New-Item -ItemType Directory -Force -Path $EvidenceDirectory | Out-Null
$started = [DateTimeOffset]::UtcNow
$dump = Join-Path $env:TEMP "takura-restore-$([guid]::NewGuid()).dump"
try {
  age --decrypt --identity $env:AGE_IDENTITY_FILE --output $dump $EncryptedBackup
  pg_restore --clean --if-exists --no-owner --no-privileges --dbname=$TargetUrl $dump
  if ($LASTEXITCODE -ne 0) { throw 'restore failed' }
  psql $TargetUrl -v ON_ERROR_STOP=1 -f ops/backup/validate-restore.sql | Set-Content (Join-Path $EvidenceDirectory 'validation.txt')
  if ($LASTEXITCODE -ne 0) { throw 'restore validation failed' }
  $ended = [DateTimeOffset]::UtcNow
  [ordered]@{ started_at_utc=$started.ToString('o'); completed_at_utc=$ended.ToString('o'); elapsed_minutes=($ended-$started).TotalMinutes; rto_target_minutes=480; result='PASS' } | ConvertTo-Json | Set-Content (Join-Path $EvidenceDirectory 'restore-result.json')
} finally { Remove-Item -LiteralPath $dump -Force -ErrorAction SilentlyContinue }
