import csv
import os
import re
import json
import sys
import PyPDF2
import pandas as pd

def extract_text_from_pdf(pdf_path):
    extracted_text = ""
    
    with open(pdf_path, 'rb') as file:
        reader = PyPDF2.PdfReader(file)
        for page_num in range(len(reader.pages)):
            page = reader.pages[page_num]
            extracted_text += page.extract_text() + "\n"
    
    return extracted_text

def extract_questions_section(text):

    lines = text.split("\n")
    
    start_key = "Questions"
    end_key = "Value Label: 1 = Yes"

    collecting = False
    questions_section = []
    
    for line in lines:
        if start_key in line:
            collecting = True 
        if collecting:
            questions_section.append(line.strip())
        if end_key in line:
            break  

    return "\n".join(questions_section)

def parse_text_to_json(text):

    question_regex = re.compile(r'^Question\s+([\d\.\sA-Z]+):\s*(.*)')
    question_type_regex = re.compile(r'^Question Type:\s*(.*)')
    variable_name_regex = re.compile(r'^Variable Name(?:\s*[\d\.\(\)A-Z]*)?:\s*(.*)')
    variable_values_regex = re.compile(r'^Variable Values:\s*(.*)')
    value_label_regex = re.compile(r'^Value Label:\s*(\d+)\s*=\s*(.*)')

    new_section_patterns = [
        r'^Question\s+[\d\.\sA-Z]+:', 
        r'^Question Type:',
        r'^Variable Name',
        r'^Variable Values:',
        r'^Value Label:',
    ]

    questions = []
    current_question = None
    current_variable = None
    accumulating_question = False

    lines = text.splitlines()

    for line_num, line in enumerate(lines, 1):
        original_line = line 
        line = line.strip()

        if not line:
            continue  

        if accumulating_question and not any(re.match(pattern, line) for pattern in new_section_patterns):
            current_question["question"] += " " + line
            continue
        else:
            accumulating_question = False
        
        q_match = question_regex.match(line)
        if q_match:
            if current_question:
                questions.append(current_question)
            
            question_text = q_match.group(2).strip()
            current_question = {
                "question": question_text,
                "question_type": "",
                "variables": []
            }
            current_variable = None
            accumulating_question = True
            continue 

        qt_match = question_type_regex.match(line)
        if qt_match and current_question:
            question_type = qt_match.group(1).strip()
            current_question["question_type"] = question_type
            continue  

        vn_match = variable_name_regex.match(line)
        if vn_match and current_question:
            variable_name = vn_match.group(1).strip()

            variable = {
                "name": variable_name,
                "values": "",
                "labels": []
            }
            current_question["variables"].append(variable)
            current_variable = variable
            continue  

        vv_match = variable_values_regex.match(line)
        if vv_match and current_variable:
            variable_values = vv_match.group(1).strip()
            current_variable["values"] = variable_values
            continue  

        vl_match = value_label_regex.match(line)
        if vl_match and current_variable:
            label = vl_match.group(1).strip()
            value = vl_match.group(2).strip()
            current_variable["labels"].append({
                "label": label,
                "value": value
            })
            continue  

    if current_question:
        questions.append(current_question)

    json_output = {
        "questions": questions
    }

    return json_output


def consolidate_questions(json_result):
    unique_questions = {}
    
    for question_data in json_result['questions']:
        question = question_data['question']
        question_type = question_data['question_type']
        variables = question_data['variables']
        
        if question_type != "Binary - mutually exclusive":
            if question not in unique_questions:
                unique_questions[question] = {
                    "question": question,
                    "question_type": question_type,
                    "variables": []
                }
            for variable in variables:
                parts = variable['name'].split('_')
                if len(parts) > 1:
                    variable['var_name'] = variable['name']
                    variable['name'] = parts[-1] 
                    
                unique_questions[question]["variables"].append(variable)
        else:
            unique_questions[question] = {
                "question": question,
                "question_type": question_type,
                "variables": variables
            }
    
    json_result['questions'] = list(unique_questions.values())
    # print(json_result)
    return json_result

def read_pdf_to_json(pdf_path):
    # pdf_path = './codebooks/2.pdf' 

    extracted_text = extract_text_from_pdf(pdf_path)
    # print(extracted_text)
    # questions_text = extract_questions_section(extracted_text)
    # print(questions_text)
    json_result = parse_text_to_json(extracted_text)
    result = consolidate_questions(json_result)
    # print(json.dumps(result, indent=4))
    return result

# def parse_excel_to_json(file_path):
#     try:
#         sheet_names = pd.ExcelFile(file_path).sheet_names
#         # print("Available sheets:", sheet_names)
#         print(sheet_names)
#         target_sheet = None
#         for sheet in sheet_names:
#             if 'Statistical' in sheet:
#                 target_sheet = sheet
#                 break

#         if not target_sheet:
#             target_sheet = sheet_names[0]

#         data = pd.read_excel(file_path, sheet_name=target_sheet)
#         # data = pd.read_excel(file_path, sheet_name='Statistical')
#         # Normalize column names
#         data.columns = (
#             data.columns
#             .str.encode('ascii', 'ignore').str.decode('utf-8')  # Remove non-ascii
#             .str.replace(r'[^A-Za-z0-9 ]+', '', regex=True)     # Remove weird symbols
#             .str.strip()
#         )

#         data.columns = data.columns.str.replace(r'[^ -~]', '', regex=True).str.strip()
#         print(data.columns)
#         # data = data.where(pd.notnull(data), None)
#         # result = {"states": {}}

#         # for state, group in data.groupby('Jurisdictions'):
#         #     result["states"][state] = []
#         #     for _, row in group.iterrows():
#         #         entry = {
#         #             "effective_date": row["Effective Date"],
#         #             "valid_through_date": row["Valid Through Date"],
#         #             "variables": {var_name: row[var_name] for var_name in data.columns[3:]}
#         #         }
#         #         result["states"][state].append(entry)

#         result = {"variables": {}}

#         for var_name in data.columns[3:]:
#             result["variables"][var_name] = {"states": []}

#             for _, row in data.iterrows():
#                 if pd.notna(row[var_name]): 
#                     result["variables"][var_name]["states"].append({
#                         "state": row["Jurisdictions"],
#                         "effective_date": row["Effective Date"],
#                         "valid_through_date": row["Valid Through Date"],
#                         "value": row[var_name]
#                     })

#         return result

#     except ValueError as e:
#         print(f"ValueError: {e}")
#         raise

#     except Exception as e:
#         print(f"Unexpected error: {e}")
#         raise

def clean_columns(columns):
    return [re.sub(r'[^\x20-\x7E]', '', str(c)).strip() for c in columns]

def read_csv_fallback(file_path):
    encodings = ['utf-8', 'utf-8-sig', 'utf-16', 'ISO-8859-1', 'cp1252']
    delimiters = [',', '\t', ';', '|']

    for enc in encodings:
        for delim in delimiters:
            try:
                df = pd.read_csv(file_path, encoding=enc, delimiter=delim, dtype=str)
                if len(df.columns) > 1:
                    print(f"Loaded with encoding={enc}, delimiter={repr(delim)}")
                    return df
            except Exception as e:
                print(f"Failed with encoding={enc}, delimiter={repr(delim)}: {e}")

    raise ValueError("Could not parse CSV file with available encodings and delimiters.")


def parse_excel_to_json(file_path):
    ext = os.path.splitext(file_path)[-1].lower()

    try:
        if ext == ".csv":
            df = read_csv_fallback(file_path)
        elif ext == ".xlsx":
            xl = pd.ExcelFile(file_path)
            if not xl.sheet_names:
                raise ValueError("No sheets found in Excel file.")
            sheet = next((s for s in xl.sheet_names if "Statistical" in s), xl.sheet_names[0])
            df = pd.read_excel(xl, sheet_name=sheet, dtype=str)
        else:
            raise ValueError("Unsupported file type.")

        df.columns = clean_columns(df.columns)
        df.dropna(how="all", inplace=True)
        # print("CLEANED COLUMNS:", df.columns.tolist())

        # Extract standard columns
        jurisdiction_col = next((c for c in df.columns if "Jurisdiction" in c), None)
        effective_col = next((c for c in df.columns if "Effective" in c), None)
        valid_col = next((c for c in df.columns if "Valid" in c), None)

        if not (jurisdiction_col and effective_col and valid_col):
            raise ValueError("Missing required columns")

        result = {"variables": {}}

        for var_name in df.columns:
            if var_name in [jurisdiction_col, effective_col, valid_col]:
                continue  # skip metadata

            result["variables"][var_name] = {"states": []}

            for _, row in df.iterrows():
                result["variables"][var_name]["states"].append({
                    "state": row[jurisdiction_col],
                    "effective_date": pd.to_datetime(row[effective_col], errors='coerce').strftime("%a, %d %b %Y %H:%M:%S GMT") if pd.notna(row[effective_col]) else "",
                    "valid_through_date": pd.to_datetime(row[valid_col], errors='coerce').strftime("%a, %d %b %Y %H:%M:%S GMT") if pd.notna(row[valid_col]) else "",
                    "value": row[var_name] if pd.notna(row[var_name]) else "."
                })

        return result
    except Exception as e:
        print(f"Unexpected error: {e}")
        raise