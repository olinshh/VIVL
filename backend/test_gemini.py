"""Test script to verify Gemini API is working correctly."""
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

try:
    import google.generativeai as genai
    print("✅ google.generativeai library is installed")
except ImportError:
    print("❌ google.generativeai not installed. Run: pip install google-generativeai")
    exit(1)

# Check API key
api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
if not api_key:
    print("❌ GEMINI_API_KEY not found in .env file")
    exit(1)

print(f"✅ API key found: {api_key[:10]}...{api_key[-4:]}")

# Configure and test
try:
    genai.configure(api_key=api_key)
    model_name = os.getenv("GEMINI_MODEL", "gemini-2.0-flash-exp")
    print(f"📝 Using model: {model_name}")
    
    model = genai.GenerativeModel(model_name)
    print("✅ Model initialized successfully")
    
    # Simple test prompt
    print("\n🧪 Testing with simple prompt...")
    response = model.generate_content("Say 'Hello from Gemini!' in JSON format: {\"message\": \"...\"}")
    print(f"✅ API Response: {response.text}")
    
    print("\n🎉 SUCCESS! Gemini API is working correctly.")
    print("The LLM will now be used for fraud detection decisions.")
    
except Exception as e:
    print(f"❌ Error testing Gemini API: {e}")
    print("\nTroubleshooting:")
    print("1. Verify your API key is correct")
    print("2. Check if you have quota remaining")
    print("3. Ensure the model name is correct")
    exit(1)
