from flask import Flask, request, jsonify
from llm import get_llm_answer

app = Flask(__name__)

# Disable CORS completely
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
    return response

# Handle OPTIONS preflight for all routes
@app.route('/', defaults={'path': ''}, methods=['OPTIONS'])
@app.route('/<path:path>', methods=['OPTIONS'])
def options_handler(path):
    return '', 200

# Health check
@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "message": "Server is running"})

# Advanced LLM endpoint
@app.route("/chat/advanced", methods=["POST", "OPTIONS"])
def chat_advanced():
    if request.method == "OPTIONS":
        return '', 200
        
    try:
        body = request.get_json()
        print(f"📥 Received body: {body}")
        
        if not body or "message" not in body:
            return jsonify({"error": "Missing 'message' field"}), 400

        message = body["message"]
        lang = body.get("lang", "en")
        history = body.get("history", [])

        print(f"🤖 Calling get_llm_answer with: message={message[:50]}, lang={lang}")
        
        answer, updated_history = get_llm_answer(message, history, lang)
        
        print(f"✅ Got answer: {answer[:100] if answer else 'None'}")
        
        return jsonify({
            "mode": "advanced",
            "lang": lang,
            "answer": answer,
            "history": updated_history
        })
        
    except Exception as e:
        import traceback
        print(f"❌ ERROR in chat_advanced: {e}")
        print(traceback.format_exc())
        return jsonify({
            "mode": "advanced",
            "lang": "en",
            "answer": f"Erreur serveur: {str(e)}",
            "history": []
        }), 200  # Return 200 even on error so app doesn't crash
# Simple test endpoint
@app.route("/test", methods=["GET"])
def test():
    return jsonify({"message": "Chatbot server is working!"})

if __name__ == "__main__":
    print("=" * 50)
    print("🤖 Chatbot Server Starting...")
    print("📍 Server IP: http://192.168.1.17:5000")
    print("📍 Test: http://192.168.1.17:5000/test")
    print("📍 Health: http://192.168.1.17:5000/health")
    print("=" * 50)
    
    # List all routes
    print("\nAvailable endpoints:")
    for rule in app.url_map.iter_rules():
        print(f"  {rule.methods} {rule}")
    print("=" * 50)
    
    app.run(debug=True, host="0.0.0.0", port=5000)