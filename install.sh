#!/bin/bash

# cquver CLI installer
# Downloads and installs the latest release binary or builds locally

set -e

VERSION="v1.4.2"
REPO="imkarmadev/cquver"
INSTALL_DIR="/usr/local/bin"
BINARY_NAME="cquver"
BUILD_LOCAL=false

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Detect OS and architecture
detect_platform() {
    local os=$(uname -s | tr '[:upper:]' '[:lower:]')
    local arch=$(uname -m)
    
    case $os in
        linux*)
            OS="linux"
            ;;
        darwin*)
            OS="macos"
            ;;
        *)
            warning "Unsupported operating system: $os, falling back to local build"
            BUILD_LOCAL=true
            return
            ;;
    esac
    
    case $arch in
        x86_64|amd64)
            ARCH="x64"
            ;;
        aarch64|arm64)
            ARCH="arm64"
            ;;
        armv7l)
            ARCH="arm"
            ;;
        *)
            warning "Unsupported architecture: $arch, falling back to local build"
            BUILD_LOCAL=true
            return
            ;;
    esac
    
    PLATFORM="${OS}-${ARCH}"
}

# Get latest release version
get_latest_version() {
    if [ "$VERSION" = "latest" ]; then
        info "Fetching latest release version..."
        VERSION=$(curl -s "https://api.github.com/repos/${REPO}/releases/latest" 2>/dev/null | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/' || echo "")
        if [ -z "$VERSION" ]; then
            warning "Failed to get latest version, falling back to local build"
            BUILD_LOCAL=true
            return
        fi
        success "Latest version: $VERSION"
    fi
}

# Download and install binary
install_binary() {
    local download_url="https://github.com/${REPO}/releases/download/${VERSION}/cquver-${PLATFORM}"
    local temp_file="/tmp/cquver-${PLATFORM}"
    
    info "Downloading cquver for ${PLATFORM}..."
    info "URL: $download_url"
    
    if ! curl -fsSL "$download_url" -o "$temp_file" 2>/dev/null; then
        warning "Failed to download binary, falling back to local build"
        BUILD_LOCAL=true
        return
    fi
    
    # Make executable
    chmod +x "$temp_file"
    
    # Install to system
    if [ -w "$INSTALL_DIR" ]; then
        mv "$temp_file" "${INSTALL_DIR}/${BINARY_NAME}"
    else
        info "Installing to $INSTALL_DIR (requires sudo)..."
        sudo mv "$temp_file" "${INSTALL_DIR}/${BINARY_NAME}"
    fi
    
    success "Installed cquver to ${INSTALL_DIR}/${BINARY_NAME}"
}

# Build locally with Deno
build_local() {
    info "Building cquver locally..."
    
    # Check if Deno is installed
    if ! command -v deno &> /dev/null; then
        error "Deno is not installed. Please install Deno first:"
        echo "   curl -fsSL https://deno.land/install.sh | sh"
        exit 1
    fi
    
    success "Deno found"
    
    # Build the CLI
    info "Building with Deno..."
    if ! deno task build; then
        error "Failed to build cquver"
        exit 1
    fi
    
    # Make executable
    chmod +x cquver
    
    # Ask about global installation
    echo ""
    read -p "🌍 Install globally to ${INSTALL_DIR}? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if [ -w "$INSTALL_DIR" ]; then
            mv cquver "${INSTALL_DIR}/${BINARY_NAME}"
        else
            sudo mv cquver "${INSTALL_DIR}/${BINARY_NAME}"
        fi
        success "Installed cquver to ${INSTALL_DIR}/${BINARY_NAME}"
    else
        success "Built successfully! Binary is available as ./cquver"
        info "To install globally later: sudo mv ./cquver ${INSTALL_DIR}/"
    fi
}

# Verify installation
verify_installation() {
    if command -v cquver &> /dev/null; then
        success "Installation verified!"
        info "Run 'cquver --help' to get started"
    else
        warning "Installation may not be in PATH"
        info "Try running: ${INSTALL_DIR}/${BINARY_NAME} --help"
    fi
}

# Main installation process
main() {
    echo "🚀 cquver CLI Installer"
    echo "======================="
    
    if [ "$BUILD_LOCAL" = true ]; then
        build_local
    else
        detect_platform
        if [ "$BUILD_LOCAL" = false ]; then
            info "Detected platform: $PLATFORM"
            get_latest_version
            if [ "$BUILD_LOCAL" = false ]; then
                install_binary
                if [ "$BUILD_LOCAL" = false ]; then
                    verify_installation
                    show_usage
                    return
                fi
            fi
        fi
        
        # Fallback to local build
        warning "Falling back to local build..."
        build_local
    fi
    
    verify_installation
    show_usage
}

# Show usage information
show_usage() {
    echo ""
    success "🎉 Installation complete!"
    echo ""
    info "📋 Usage:"
    echo "   cquver <app_name> create <type> <name>"
    echo ""
    info "📚 Examples:"
    echo "   cquver user-service create event UserCreated"
    echo "   cquver auth-service create command CreateUser"
    echo "   cquver order-service create query GetOrder"
    echo ""
    info "🔗 Documentation: https://github.com/${REPO}"
}

# Handle command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --version=*)
            VERSION="v1.4.2"
            shift
            ;;
        --install-dir=*)
            INSTALL_DIR="${1#*=}"
            shift
            ;;
        --build-local)
            BUILD_LOCAL=true
            shift
            ;;
        --help)
            echo "cquver installer"
            echo ""
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  --version=VERSION    Install specific version (default: latest)"
            echo "  --install-dir=DIR    Install directory (default: /usr/local/bin)"
            echo "  --build-local        Force local build instead of downloading binary"
            echo "  --help              Show this help"
            echo ""
            echo "Examples:"
            echo "  $0                          # Install latest version"
            echo "  $0 --version=v1.0.0        # Install specific version"
            echo "  $0 --install-dir=~/bin     # Install to custom directory"
            echo "  $0 --build-local           # Build locally with Deno"
            exit 0
            ;;
        *)
            error "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Run main installation
main 