from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/')
def home():
    return jsonify({"message": "Backend is running!"})

@app.route('/api/test')
def test():
    return jsonify({"status": "success", "data": "Hello from Python!"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)