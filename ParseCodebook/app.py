from flask import Flask, request, jsonify
from flask_cors import CORS
import os

from sample import read_pdf_to_json 

app = Flask(__name__)
CORS(app)


PDF_FOLDER = os.path.join(os.path.dirname(__file__), 'codebooks')

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

if __name__ == "__main__":
    app.run(debug=True)
