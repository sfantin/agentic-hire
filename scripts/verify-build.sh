#!/bin/bash

# Build Verification Script for AgenticHire Track 06
# Purpose: Validate production build before E2E testing and deployment
# Usage: ./scripts/verify-build.sh

set -e  # Exit on error

echo "🔍 AgenticHire Build Verification"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASS_COUNT=0
FAIL_COUNT=0
WARN_COUNT=0

# Helper functions
pass() {
  echo -e "${GREEN}✓${NC} $1"
  ((PASS_COUNT++))
}

fail() {
  echo -e "${RED}✗${NC} $1"
  ((FAIL_COUNT++))
}

warn() {
  echo -e "${YELLOW}⚠${NC} $1"
  ((WARN_COUNT++))
}

# --- STEP 1: Clean & Build ---
echo "📦 STEP 1: Clean & Build"
echo "------------------------"

if [ -d "frontend/out" ]; then
  echo "Removing old build..."
  rm -rf frontend/out
fi

cd frontend
npm run build > /tmp/build.log 2>&1

if [ $? -eq 0 ]; then
  pass "npm run build completed"
else
  fail "npm run build failed"
  cat /tmp/build.log
  exit 1
fi

cd ..
echo ""

# --- STEP 2: Output Structure ---
echo "📂 STEP 2: Output Structure"
echo "-------------------------"

if [ -d "frontend/out" ]; then
  pass "frontend/out/ exists"
else
  fail "frontend/out/ directory not found"
  exit 1
fi

if [ -d "frontend/out/assets" ]; then
  pass "frontend/out/assets/ exists"
else
  fail "frontend/out/assets/ not found"
  exit 1
fi

if [ -f "frontend/out/index.html" ]; then
  pass "frontend/out/index.html exists"
else
  fail "frontend/out/index.html not found"
  exit 1
fi

echo ""

# --- STEP 3: Bundle Size ---
echo "📊 STEP 3: Bundle Size Analysis"
echo "------------------------------"

TOTAL_SIZE=$(du -sh frontend/out | awk '{print $1}')
JS_SIZE=$(du -sh frontend/out/assets/*.js 2>/dev/null | awk '{sum+=$1} END {print sum}' || echo "N/A")
ASSET_COUNT=$(find frontend/out/assets -type f | wc -l)

echo "Total build size: $TOTAL_SIZE"
echo "JavaScript files: ~$JS_SIZE"
echo "Asset count: $ASSET_COUNT files"

# Check if reasonable (< 2MB total for SPA)
TOTAL_BYTES=$(du -sb frontend/out | awk '{print $1}')
if [ "$TOTAL_BYTES" -lt 2097152 ]; then
  pass "Build size reasonable (< 2MB)"
else
  warn "Build size large (> 2MB) — check for unnecessary dependencies"
fi

echo ""

# --- STEP 4: Dev Artifacts Check ---
echo "🔎 STEP 4: Dev Artifacts Detection"
echo "---------------------------------"

CONSOLE_LOGS=$(grep -r "console.log" frontend/out 2>/dev/null | wc -l)
if [ "$CONSOLE_LOGS" -eq 0 ]; then
  pass "No console.log statements found"
else
  warn "$CONSOLE_LOGS console.log() calls detected in build"
fi

DEBUGGERS=$(grep -r "debugger" frontend/out 2>/dev/null | wc -l)
if [ "$DEBUGGERS" -eq 0 ]; then
  pass "No debugger statements found"
else
  fail "$DEBUGGERS debugger statements detected (remove before deploy)"
fi

LOCALHOST=$(grep -r "localhost:8003" frontend/out 2>/dev/null | wc -l)
if [ "$LOCALHOST" -eq 0 ]; then
  pass "No hardcoded localhost references"
else
  warn "$LOCALHOST hardcoded localhost:8003 references (should use env vars)"
fi

echo ""

# --- STEP 5: HTML Validation ---
echo "📄 STEP 5: HTML Structure"
echo "------------------------"

if grep -q "<meta charset" frontend/out/index.html; then
  pass "Charset meta tag present"
else
  warn "Charset meta tag missing"
fi

if grep -q "<title>" frontend/out/index.html; then
  pass "Title tag present"
  TITLE=$(grep "<title>" frontend/out/index.html | sed 's/<[^>]*>//g')
  echo "  Title: $TITLE"
else
  warn "Title tag missing"
fi

if grep -q "root" frontend/out/index.html; then
  pass "Root div for React present"
else
  fail "No root div found (React app won't mount)"
fi

if grep -q "/assets/" frontend/out/index.html; then
  pass "Asset references valid (/assets/...)"
else
  warn "No asset references found"
fi

echo ""

# --- STEP 6: CSS & JS Files ---
echo "📦 STEP 6: Asset Files"
echo "---------------------"

CSS_COUNT=$(find frontend/out/assets -name "*.css" | wc -l)
JS_COUNT=$(find frontend/out/assets -name "*.js" | wc -l)

if [ "$CSS_COUNT" -gt 0 ]; then
  pass "$CSS_COUNT CSS file(s) generated"
  ls -lh frontend/out/assets/*.css 2>/dev/null | head -3
else
  warn "No CSS files found (check Tailwind build)"
fi

if [ "$JS_COUNT" -gt 0 ]; then
  pass "$JS_COUNT JavaScript file(s) generated"
  ls -lh frontend/out/assets/*.js 2>/dev/null | head -3
else
  fail "No JS files found (build incomplete)"
fi

echo ""

# --- STEP 7: Sourcemaps ---
echo "🗺️  STEP 7: Sourcemaps"
echo "-------------------"

SOURCEMAPS=$(find frontend/out/assets -name "*.map" | wc -l)
if [ "$SOURCEMAPS" -gt 0 ]; then
  warn "$SOURCEMAPS sourcemap files present (remove in production build)"
else
  pass "No sourcemaps in build (production optimized)"
fi

echo ""

# --- STEP 8: React Build Check ---
echo "⚛️  STEP 8: React Build Integrity"
echo "-------------------------------"

if grep -q "React" frontend/out/assets/*.js 2>/dev/null; then
  pass "React library bundled"
else
  warn "React not detected in bundle"
fi

if grep -q "react-router" frontend/out/assets/*.js 2>/dev/null; then
  pass "React Router bundled"
else
  warn "React Router not detected"
fi

if grep -q "tailwindcss" frontend/out/assets/*.css 2>/dev/null; then
  pass "Tailwind CSS present"
else
  warn "Tailwind CSS not detected"
fi

echo ""

# --- Summary ---
echo "📋 VERIFICATION SUMMARY"
echo "======================="
echo -e "${GREEN}Passed:${NC}  $PASS_COUNT"
echo -e "${RED}Failed:${NC}  $FAIL_COUNT"
echo -e "${YELLOW}Warnings:${NC} $WARN_COUNT"
echo ""

if [ "$FAIL_COUNT" -eq 0 ]; then
  echo -e "${GREEN}✓ Build verification PASSED${NC}"
  echo ""
  echo "Next steps:"
  echo "  1. Run E2E tests: npm run preview (then run webapp-testing)"
  echo "  2. Deploy to Hostinger: Copy frontend/out/* to public_html/agentichire/"
  echo "  3. Git commit: git add -A && git commit -m 'feat(track-06): complete build verification'"
  exit 0
else
  echo -e "${RED}✗ Build verification FAILED${NC}"
  echo ""
  echo "Issues found — fix above errors before deploying"
  exit 1
fi
