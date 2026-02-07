"""Quick diagnostic script to check current LLM configuration in running system."""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
load_dotenv()

print("=" * 60)
print("GEMINI API CONFIGURATION CHECK")
print("=" * 60)

# Check what's in .env file
print("\n📄 Reading from .env file:")
api_key = os.getenv("GEMINI_API_KEY")
model = os.getenv("GEMINI_MODEL", "gemini-2.0-flash-exp")

if api_key:
    print(f"✅ GEMINI_API_KEY: {api_key[:10]}...{api_key[-4:]}")
else:
    print("❌ GEMINI_API_KEY: Not found")

print(f"📝 GEMINI_MODEL: {model}")

# Check if library is available
print("\n📦 Checking google.generativeai library:")
try:
    import google.generativeai as genai
    print("✅ google.generativeai is installed")
    
    # Try to configure
    if api_key:
        genai.configure(api_key=api_key)
        print("✅ API configured successfully")
        
        # Try to create model
        try:
            test_model = genai.GenerativeModel(model)
            print(f"✅ Model '{model}' initialized")
            
            # Try a simple call
            print("\n🧪 Testing API call...")
            response = test_model.generate_content("Return: {\"status\": \"ok\"}")
            print(f"✅ API call successful!")
            print(f"   Response: {response.text[:100]}")
            
        except Exception as e:
            print(f"❌ Model initialization or API call failed: {e}")
    else:
        print("⚠️  Cannot configure - no API key")
        
except ImportError:
    print("❌ google.generativeai not installed")

# Test the actual llm_client module
print("\n🔧 Checking llm_client module:")
try:
    from llm_client import adjudicate_decision, GEMINI_API_KEY as CLIENT_KEY, GEMINI_AVAILABLE
    
    print(f"   GEMINI_AVAILABLE: {GEMINI_AVAILABLE}")
    print(f"   API Key loaded: {CLIENT_KEY[:10] + '...' + CLIENT_KEY[-4:] if CLIENT_KEY else 'None'}")
    
    if CLIENT_KEY != api_key:
        print("\n⚠️  WARNING: llm_client has a DIFFERENT API key than .env!")
        print(f"   .env key: {api_key[:10]}...{api_key[-4:]}")
        print(f"   module key: {CLIENT_KEY[:10]}...{CLIENT_KEY[-4:]}")
        print("\n   🔄 YOU NEED TO RESTART THE BACKEND SERVER!")
        print("   The module loaded the old API key when it first started.")
        
    # Try to call adjudicate_decision with dummy data
    print("\n🧪 Testing adjudicate_decision function...")
    test_tx = {
        "transaction_id": "TEST_001",
        "user_id": "user_test",
        "type": "withdrawal",
        "amount": 100,
        "currency": "USD"
    }
    test_signals = []
    
    result = adjudicate_decision(test_tx, test_signals, 35, "approve_candidate")
    
    if result is None:
        print("   ⚠️  Function returned None (likely quota exceeded or error)")
    else:
        print(f"   ✅ Function returned: {result.decision} (score: {result.risk_score})")
        
except Exception as e:
    print(f"   ❌ Error testing llm_client: {e}")

print("\n" + "=" * 60)
print("SUMMARY")
print("=" * 60)

if not api_key:
    print("❌ No API key found in .env")
    print("   → Add GEMINI_API_KEY to backend/.env")
elif CLIENT_KEY != api_key:
    print("⚠️  API key changed but backend hasn't restarted")
    print("   → Stop the backend and run: .\\run.ps1 backend")
else:
    print("✅ Configuration looks good!")
    print("   → If LLM still doesn't work, check backend terminal logs")

print("=" * 60)
