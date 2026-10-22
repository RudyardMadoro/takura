param([Parameter(Mandatory = $true)][string]$Destination)
$ErrorActionPreference = 'Stop'
if ($env:TAKURA_ENVIRONMENT -notin @('staging', 'production')) { throw 'Set TAKURA_ENVIRONMENT to staging or production.' }
foreach ($name in @('DATABASE_URL', 'DATABASE_BACKUP_USER', 'PGPASSFILE', 'BACKUP_AGE_RECIPIENT')) { if (-not (Get-Item "env:$name" -ErrorAction SilentlyContinue).Value) { throw "Missing $name" } }
$stamp = [DateTimeOffset]::UtcNow.ToString('yyyyMMddTHHmmssZ')
$dump = Join-Path $env:TEMP "takura-$stamp.dump"
try {
  pg_dump --format=custom --no-owner --no-privileges --dbname=$env:DATABASE_URL --username=$env:DATABASE_BACKUP_USER --file=$dump
  if ($LASTEXITCODE -ne 0) { throw 'pg_dump failed' }
  age --recipient $env:BACKUP_AGE_RECIPIENT --output "$dump.age" $dump
  if ($LASTEXITCODE -ne 0) { throw 'age encryption failed' }
  aws s3 cp "$dump.age" "$Destination/database/$stamp.dump.age" --only-show-errors
  if ($LASTEXITCODE -ne 0) { throw 'off-host upload failed' }
  Get-FileHash -Algorithm SHA256 "$dump.age" | Select-Object Hash | ConvertTo-Json -Compress
} finally { Remove-Item -LiteralPath $dump,"$dump.age" -Force -ErrorAction SilentlyContinue }
