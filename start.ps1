# GTunnel Windows PowerShell Helper
# This script helps Windows users run gtunnel by automatically using npx if needed

param(
    [Parameter(ValueFromRemainingArguments=$true)]
    [string[]]$Arguments
)

# Check if gtunnel is available
$gtunnelExists = Get-Command gtunnel -ErrorAction SilentlyContinue

if ($gtunnelExists) {
    # gtunnel is installed, use it directly
    & gtunnel start @Arguments
} else {
    # gtunnel not found, try using npx
    Write-Host "gtunnel not found in PATH, using npx..." -ForegroundColor Yellow
    Write-Host ""
    & npx gtunnel start @Arguments
}
