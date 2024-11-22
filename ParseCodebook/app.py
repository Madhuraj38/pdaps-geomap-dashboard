from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import pandas as pd

from sample import read_pdf_to_json 

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
        return jsonify({"error": "PDF file not found"}), 404

    json_output = read_pdf_to_json(pdf_path)  
    return jsonify(json_output)

@app.route('/parse-data', methods=['POST'])
def parse_data():
    # Load the dataset
    data = request.get_json()
    if not data or 'buttonText' not in data:
        return jsonify({"error": "No button text provided"}), 400

    button_text = data['buttonText']
    file_path = os.path.join(DATA_FOLDER, f"{button_text}.xlsx")
    data = pd.read_excel(file_path, sheet_name='Statistical Data')

    # Prepare the JSON structure
    parsed_data = {}
    for var_name in data.columns[3:]:  # Variables start after 'Effective Date' and 'Valid Through Date'
        var_data = {}
        for state_name, group in data.groupby('Jurisdictions'):
            state_records = group[['Effective Date', 'Valid Through Date', var_name]].dropna().values.tolist()
            var_data[state_name] = state_records
        parsed_data[var_name] = var_data

    print(parsed_data)
    # Return the JSON response
    return jsonify(parsed_data)
if __name__ == "__main__":
    app.run(debug=True)
