from flask import Flask, jsonify, request
from flask_cors import CORS
import json
from pathlib import Path

app = Flask(__name__)
CORS(app)

DATA_DIR = Path(__file__).parent / "data"

def load_json(filename):
    file_path = DATA_DIR / filename
    with open(file_path, "r") as file:
        return json.load(file)
    
@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "Smart Campus Backend Running"
    })

@app.route("/users", methods=["GET"])
def get_users():
    users = load_json("campusDB.users.json")
    return jsonify(users)

@app.route("/tickets", methods=["GET"])
def get_tickets():
    tickets = load_json("campusDB.maintenance_tickets.json")
    return jsonify(tickets)

@app.route("/login", methods=["POST"])
def login():
    data 