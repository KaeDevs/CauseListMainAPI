#!/usr/bin/env bash

echo "Installing system packages..."
apt-get update
apt-get install -y chromium-driver chromium

echo "Installing Python dependencies..."
pip install -r requirements.txt


