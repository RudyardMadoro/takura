param([Parameter(Mandatory = $true)][string]$Manifest)
$ErrorActionPreference = 'Stop'
$data = Get-Content -Raw -LiteralPath $Manifest | ConvertFrom-Json
if ($data.commit -ne (git rev-parse HEAD).Trim()) { throw 'Manifest commit does not match HEAD.' }
if ($data.tree -ne (git rev-parse 'HEAD^{tree}').Trim()) { throw 'Manifest tree does not match HEAD.' }
foreach ($image in @($data.images.public, $data.images.staff, $data.images.api_worker)) {
  if ($image -notmatch '@sha256:[0-9a-f]{64}$') { throw "Mutable image reference rejected: $image" }
}
Write-Output 'Manifest commit, tree and image digests verified.'
