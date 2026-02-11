# GTunnel Windows PowerShell Helper
# This script helps Windows users avoid command errors
# by ensuring the gtunnel command is properly invoked.

param(
    [Parameter(ValueFromRemainingArguments=$true)]
    [string[]]$Arguments
)

# Check if gtunnel is available
$gtunnelExists = Get-Command gtunnel -ErrorAction SilentlyContinue

if (-not $gtunnelExists) {
    Write-Host "Error: gtunnel is not installed or not in PATH" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install gtunnel first:"
    Write-Host "  npm install -g gtunnel"
    Write-Host ""
    Write-Host "Or use npx to run it without installation:"
    Write-Host "  npx gtunnel start $($Arguments -join ' ')"
    exit 1
}

# Forward all arguments to gtunnel start
& gtunnel start @Arguments
