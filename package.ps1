# Packaging script for Carpentry Management System

$ErrorActionPreference = "Stop"

Write-Host "--- 1. Building Frontend ---" -ForegroundColor Cyan
Set-Location frontend
npm install --silent
npm run build
Set-Location ..

Write-Host "--- 2. Cleaning and preparing Backend static folder ---" -ForegroundColor Cyan
$staticDir = "backend/src/main/resources/static"
if (Test-Path $staticDir) {
    Remove-Item -Recurse -Force $staticDir/*
} else {
    New-Item -ItemType Directory -Path $staticDir -Force
}

Write-Host "--- 3. Copying Frontend build to Backend ---" -ForegroundColor Cyan
Copy-Item -Path "frontend/dist/*" -Destination $staticDir -Recurse

Write-Host "--- 4. Building Backend JAR ---" -ForegroundColor Cyan
Set-Location backend
mvn clean package -DskipTests
Set-Location ..

Write-Host "--- Packaging Complete! ---" -ForegroundColor Green
Write-Host "Artifact location: backend/target/manager-0.0.1-SNAPSHOT.jar"
