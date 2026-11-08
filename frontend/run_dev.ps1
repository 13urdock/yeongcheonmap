# 개발 실행 한 줄: .\run_dev.ps1   (추가 인자는 flutter run 에 그대로 전달, 예: .\run_dev.ps1 -d emulator-5554)
# .env 값으로 flutter run 하고, 실기기면 adb reverse 로 PC 서버 포트를 폰에 이어 준다.
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

if (-not (Test-Path .env)) {
  Write-Host '.env 가 없어요. .env.example 을 복사해 .env 로 만들고 값을 채워 주세요.' -ForegroundColor Red
  exit 1
}

# API_BASE_URL 이 127.0.0.1/localhost 일 때만 adb reverse (에뮬레이터용 10.0.2.2 면 건너뜀)
$baseUrl = (Get-Content .env | Where-Object { $_ -match '^API_BASE_URL=' }) -replace '^API_BASE_URL=', ''
if ($baseUrl -match '^https?://(127\.0\.0\.1|localhost):(\d+)') {
  $port = $Matches[2]
  $adb = (Get-Command adb -ErrorAction SilentlyContinue).Source
  if (-not $adb) { $adb = Join-Path $env:LOCALAPPDATA 'Android\Sdk\platform-tools\adb.exe' }
  & $adb reverse "tcp:$port" "tcp:$port"
  if ($LASTEXITCODE -ne 0) {
    Write-Host "adb reverse 실패: 폰이 USB 디버깅으로 연결돼 있는지 'adb devices' 로 확인해 주세요." -ForegroundColor Red
    exit 1
  }
  Write-Host "폰의 $port 포트 → PC 의 $port 포트 연결됨" -ForegroundColor Green
}

flutter run --dart-define-from-file=.env @args
