param([string]$Environment = $env:TAKURA_ENVIRONMENT)
$ErrorActionPreference = 'Stop'
if ($Environment -ne 'local') { throw "Database reset refused for environment '$Environment'. Set TAKURA_ENVIRONMENT=local explicitly." }
docker compose down --volumes
