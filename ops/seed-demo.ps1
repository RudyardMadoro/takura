param([string]$Environment = $env:TAKURA_ENVIRONMENT)
$ErrorActionPreference = 'Stop'
if ($Environment -notin @('local', 'preview', 'test')) { throw "Demo seed refused for environment '$Environment'." }
Get-Content -Raw "$PSScriptRoot/demo-data.sql" | docker compose exec -T postgres psql -v ON_ERROR_STOP=1 -U takura_migrator -d takura
