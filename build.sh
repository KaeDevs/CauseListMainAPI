#!/usr/bin/env bash

echo "Installing system packages..."
apt-get update && apt-get install -y chromium

echo "Installing Python dependencies..."
pip install -r requirements.txt

