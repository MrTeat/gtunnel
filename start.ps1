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
    
    # Check if npx is available
    $npxExists = Get-Command npx -ErrorAction SilentlyContinue
    
    if (-not $npxExists) {
        Write-Host "Error: Neither gtunnel nor npx is available." -ForegroundColor Red
        Write-Host ""
        Write-Host "Please install Node.js and npm first:"
        Write-Host "  Download from: https://nodejs.org/"
        Write-Host ""
        Write-Host "After installing Node.js, you can:"
        Write-Host "  1. Install gtunnel globally: npm install -g gtunnel"
        Write-Host "  2. Or use npx directly: npx gtunnel start [options]"
        exit 1
    }
    
    & npx gtunnel start @Arguments
}
