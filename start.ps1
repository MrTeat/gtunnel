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
    # @Arguments uses PowerShell splatting to properly forward all arguments including those with spaces
    & gtunnel start @Arguments
    exit $LASTEXITCODE
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
    
    try {
        & npx gtunnel start @Arguments
        $exitCode = $LASTEXITCODE
        
        if ($exitCode -ne 0) {
            Write-Host ""
            Write-Host "Error: Failed to run gtunnel via npx (exit code: $exitCode)." -ForegroundColor Red
            Write-Host ""
            Write-Host "This could be due to:"
            Write-Host "  - Network connectivity issues"
            Write-Host "  - npm package registry problems"
            Write-Host "  - Invalid gtunnel package"
            Write-Host ""
            Write-Host "Try:"
            Write-Host "  1. Check your internet connection"
            Write-Host "  2. Install gtunnel globally: npm install -g gtunnel"
            Write-Host "  3. Clear npm cache: npm cache clean --force"
        }
        
        exit $exitCode
    } catch {
        Write-Host ""
        Write-Host "Error: Failed to execute npx." -ForegroundColor Red
        Write-Host "Exception: $($_.Exception.Message)"
        Write-Host ""
        Write-Host "Try:"
        Write-Host "  1. Reinstall Node.js from https://nodejs.org/"
        Write-Host "  2. Restart your terminal/PowerShell"
        exit 1
    }
}
