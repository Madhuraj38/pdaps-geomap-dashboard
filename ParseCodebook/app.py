import json
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import pandas as pd

from sample import parse_excel_to_json, read_pdf_to_json 

app = Flask(__name__)
CORS(app)


PDF_FOLDER = os.path.join(os.path.dirname(__file__), 'codebooks')
DATA_FOLDER = os.path.join(os.path.dirname(__file__), 'data')

@app.route('/parse-pdf', methods=['POST'])
def parse_pdf():
    data = request.get_json()
    if not data or 'buttonText' not in data:
        return jsonify({"error": "No button text provided"}), 400

    button_text = data['buttonText']
    # pdf_path = os.path.join(PDF_FOLDER, f"{button_text}.pdf")
    pdf_path = os.path.join(PDF_FOLDER, f"{button_text}.pdf")

    if not os.path.isfile(pdf_path):
        return jsonify({"error": "pdf file not found"}), 404

    json_output = read_pdf_to_json(pdf_path)  
    return jsonify(json_output)
    # try:
    #     with open(json_path, 'r') as f:
    #         json_output = json.load(f)
    #     return jsonify(json_output)
    # except Exception as e:
    #     return jsonify({"error": f"Error reading JSON file: {str(e)}"}), 500

# @app.route('/parse-data', methods=['POST'])
# def parse_data():
#     data = request.get_json()
#     if not data or 'buttonText' not in data:
#         return jsonify({"error": "No button text provided"}), 400

#     button_text = data['buttonText']
#     file_path = os.path.join(DATA_FOLDER, f"{button_text}.xlsx")
    
#     parsed_json = parse_excel_to_json(file_path)
#     return jsonify(parsed_json)
@app.route('/parse-data', methods=['POST'])
def parse_data():
    data = request.get_json()
    button_text = data.get("buttonText")
    if not button_text:
        return jsonify({"error": "No button text provided"}), 400

    for ext in [".xlsx", ".csv"]:
        file_path = os.path.join(DATA_FOLDER, f"{button_text}{ext}")
        if os.path.isfile(file_path):
            try:
                parsed = parse_excel_to_json(file_path)
                return jsonify(parsed)
            except Exception as e:
                return jsonify({"error": str(e)}), 500

    return jsonify({"error": f"No file found for: {button_text}"}), 404

if __name__ == "__main__":
    app.run(debug=True)
