"""Diagnostic script to check environment variables"""
import os
import sys

print("=" * 60)
print("RAILWAY ENVIRONMENT VARIABLES CHECK")
print("=" * 60)

required_vars = [
    "GROQ_API_KEY",
    "TELEGRAM_BOT_TOKEN", 
    "SUPABASE_URL",
    "SUPABASE_KEY"
]

optional_vars = [
    "GROQ_MODEL",
    "MANTLE_RPC_URL",
    "MANTLE_CHAIN_ID",
    "API_HOST",
    "API_PORT",
    "POLL_INTERVAL",
    "WHALE_THRESHOLD",
    "LIQUIDITY_EXIT_THRESHOLD",
    "CLUSTER_SIZE",
    "CLUSTER_TIME_WINDOW",
    "PREDICTION_REGISTRY_ADDRESS",
    "ANOMALY_REWARDS_ADDRESS",
    "PRIVATE_KEY",
    "MERCHANT_MOE_ROUTER",
    "AGNI_FINANCE_ROUTER"
]

print("\n🔍 REQUIRED VARIABLES:")
print("-" * 60)
missing_required = []
for var in required_vars:
    value = os.getenv(var)
    if value:
        # Show only first 20 chars for security
        display_value = value[:20] + "..." if len(value) > 20 else value
        print(f"✅ {var}: {display_value}")
    else:
        print(f"❌ {var}: NOT SET")
        missing_required.append(var)

print("\n📋 OPTIONAL VARIABLES:")
print("-" * 60)
for var in optional_vars:
    value = os.getenv(var)
    if value:
        display_value = value[:30] + "..." if len(value) > 30 else value
        print(f"✅ {var}: {display_value}")
    else:
        print(f"⚠️  {var}: NOT SET (using default)")

print("\n" + "=" * 60)
print("ALL ENVIRONMENT VARIABLES:")
print("=" * 60)
all_vars = dict(os.environ)
print(f"Total variables: {len(all_vars)}")
print("\nVariable names:")
for key in sorted(all_vars.keys()):
    print(f"  - {key}")

print("\n" + "=" * 60)
if missing_required:
    print("❌ MISSING REQUIRED VARIABLES:")
    for var in missing_required:
        print(f"   - {var}")
    print("\n💡 Add these variables in Railway dashboard:")
    print("   1. Go to Variables tab")
    print("   2. Click 'RAW Editor'")
    print("   3. Add the missing variables")
    print("   4. Save and redeploy")
    sys.exit(1)
else:
    print("✅ ALL REQUIRED VARIABLES ARE SET!")
    print("🚀 Ready to start the application")
    sys.exit(0)
