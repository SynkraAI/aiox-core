# Diagnóstico de problema com npx aiox-core
# Execute este script no PC com problema

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Diagnóstico NPX aiox-core" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar versões
Write-Host "[1] Versões instaladas:" -ForegroundColor Yellow
Write-Host "    Node.js: $(node --version)"
Write-Host "    npm: $(npm --version)"
Write-Host "    npx: $(npx --version)"
Write-Host ""

# 2. Verificar se Node funciona corretamente
Write-Host "[2] Testando Node.js básico:" -ForegroundColor Yellow
$nodeTest = node -e "console.log('OK: Node funciona')" 2>&1
Write-Host "    $nodeTest"
Write-Host ""

# 3. Verificar cache npx
Write-Host "[3] Limpando cache npx..." -ForegroundColor Yellow
npm cache clean --force 2>&1 | Out-Null
Write-Host "    Cache limpo"
Write-Host ""

# 4. Tentar baixar e executar manualmente
Write-Host "[4] Baixando aiox-core manualmente..." -ForegroundColor Yellow
$tempDir = "$env:TEMP\aiox-test-$(Get-Random)"
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null
Set-Location $tempDir

Write-Host "    Diretório: $tempDir"
npm pack aiox-core@2.2.0 2>&1 | Out-Null

if (Test-Path "aiox-core-2.2.0.tgz") {
    Write-Host "    Download: OK" -ForegroundColor Green

    # Extrair
    tar -xzf aiox-core-2.2.0.tgz 2>&1 | Out-Null

    if (Test-Path "package/bin/aiox.js") {
        Write-Host "    Extração: OK" -ForegroundColor Green

        # Tentar executar
        Write-Host ""
        Write-Host "[5] Executando bin/aiox.js --version:" -ForegroundColor Yellow
        try {
            $result = node package/bin/aiox.js --version 2>&1
            if ($result -match "^\d+\.\d+\.\d+$") {
                Write-Host "    Resultado: $result" -ForegroundColor Green
            } else {
                Write-Host "    Resultado inesperado: $result" -ForegroundColor Red
            }
        } catch {
            Write-Host "    ERRO: $($_.Exception.Message)" -ForegroundColor Red
        }

        # Tentar executar o wizard
        Write-Host ""
        Write-Host "[6] Testando wizard (Ctrl+C para cancelar):" -ForegroundColor Yellow
        Write-Host "    Executando: node package/bin/aiox.js --help"
        node package/bin/aiox.js --help 2>&1

    } else {
        Write-Host "    Extração: FALHOU - bin/aiox.js não encontrado" -ForegroundColor Red
        Write-Host "    Conteúdo do package:"
        Get-ChildItem package -Recurse | Select-Object -First 20
    }
} else {
    Write-Host "    Download: FALHOU" -ForegroundColor Red
    Write-Host "    Verifique sua conexão com a internet"
}

# Limpar
Set-Location $env:USERPROFILE
Remove-Item -Recurse -Force $tempDir -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Diagnóstico Completo" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Recomendação
Write-Host "RECOMENDAÇÃO:" -ForegroundColor Yellow
Write-Host "Node v24 é uma versão EXPERIMENTAL e pode ter problemas."
Write-Host ""
Write-Host "Solução recomendada:" -ForegroundColor Green
Write-Host "1. Baixe Node.js LTS (v22 ou v20) de: https://nodejs.org/"
Write-Host "2. Desinstale Node v24"
Write-Host "3. Instale a versão LTS"
Write-Host "4. Tente novamente: npx aiox-core@latest"
Write-Host ""
