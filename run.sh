#!/bin/bash
# Packaging script for Carpentry Management System

set -e

echo "--- 1. Building Frontend ---"
cd frontend
npm install --silent
npm run build
cd ..

echo "--- 2. Cleaning and preparing Backend static folder ---"
STATIC_DIR="backend/src/main/resources/static"
if [ -d "$STATIC_DIR" ]; then
    rm -rf "$STATIC_DIR"/*
else
    mkdir -p "$STATIC_DIR"
fi

echo "--- 3. Copying Frontend build to Backend ---"
cp -r frontend/dist/* "$STATIC_DIR"

echo "--- 4. Building Backend JAR ---"
cd backend
mvn clean package -DskipTests
cd ..

echo "--- Packaging Complete! ---"
echo "Artifact location: backend/target/manager-1.0.jar"

echo "Running java -jar backend/target/manager-1.0.jar"
java -jar backend/target/manager-1.0.jar
