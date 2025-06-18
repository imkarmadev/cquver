#!/bin/bash

# cquver installer script

echo "🚀 Installing cquver CLI..."

# Check if Deno is installed
if ! command -v deno &> /dev/null; then
    echo "❌ Deno is not installed. Please install Deno first:"
    echo "   curl -fsSL https://deno.land/install.sh | sh"
    exit 1
fi

# Build the CLI
echo "📦 Building cquver..."
deno task build

# Make executable
chmod +x cquver

# Optional: Install globally
read -p "🌍 Install globally? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    sudo mv cquver /usr/local/bin/
    echo "✅ cquver installed globally!"
    echo "   Run: cquver --help"
else
    echo "✅ cquver built successfully!"
    echo "   Run: ./cquver --help"
fi

echo "🎉 Installation complete!" 