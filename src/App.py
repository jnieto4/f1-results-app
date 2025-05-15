from flask import Flask, jsonify, request
import requests
from flask_cors import CORS
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

app = Flask(__name__)
CORS(app)

ERGAST_BASE_URL = "https://ergast.com/api/f1"

@app.route("/api/races")
def get_races():
    year = request.args.get("year")
    if not year:
        return jsonify({"error": "Missing year parameter"}), 400

    url = f"{ERGAST_BASE_URL}/{year}.json"
    response = requests.get(url, verify = False)

    if response.status_code != 200:
        return jsonify({"error": "Failed to fetch data from Ergast API"}), 500

    try:
        data = response.json()
        races = data['MRData']['RaceTable']['Races']
        race_list = [{"round": race['round'], "name": race['raceName']} for race in races]
        return jsonify(race_list)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/results")
def get_results():
    year = request.args.get("year")
    round = request.args.get("round")
    if not year or not round:
        return jsonify({"error": "Missing year or round parameter"}), 400

    url = f"{ERGAST_BASE_URL}/{year}/{round}/results.json"
    response = requests.get(url, verify = False)

    if response.status_code != 200:
        return jsonify({"error": "Failed to fetch results from Ergast API"}), 500

    try:
        data = response.json()
        race_info = data['MRData']['RaceTable']['Races'][0]
        results = []
        for result in race_info['Results']:
            results.append({
        "race_name": race_info['raceName'],
        "round": race_info['round'],
        "date": race_info['date'],
        "Driver": result['Driver'],            # Full nested Driver object
        "Constructor": result['Constructor'],  # Full nested Constructor object
        "grid": result['grid'],
        "position": result['position'],
        "status": result['status'],
        "points": result['points'],
        "laps": result.get('laps', None),               # Add laps if available
        "FastestLap": result.get('FastestLap', None),   # Add FastestLap if available
        "number": result.get('number', None),           # Add car number if available
            })
        return jsonify(results)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
