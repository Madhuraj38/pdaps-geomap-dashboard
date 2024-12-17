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

def parse_excel_to_json(file_path):
    try:
        sheet_names = pd.ExcelFile(file_path).sheet_names
        # print("Available sheets:", sheet_names)

        target_sheet = None
        for sheet in sheet_names:
            if 'Statistical' in sheet:
                target_sheet = sheet
                break

        if not target_sheet:
            target_sheet = sheet_names[0]

        data = pd.read_excel(file_path, sheet_name=target_sheet)
        # data = pd.read_excel(file_path, sheet_name='Statistical')
        # print("Columns in the dataset:", data.columns.tolist())

        data.columns = data.columns.str.strip()

        # data = data.where(pd.notnull(data), None)
        # result = {"states": {}}

        # for state, group in data.groupby('Jurisdictions'):
        #     result["states"][state] = []
        #     for _, row in group.iterrows():
        #         entry = {
        #             "effective_date": row["Effective Date"],
        #             "valid_through_date": row["Valid Through Date"],
        #             "variables": {var_name: row[var_name] for var_name in data.columns[3:]}
        #         }
        #         result["states"][state].append(entry)

        result = {"variables": {}}

        for var_name in data.columns[3:]:
            result["variables"][var_name] = {"states": []}

            for _, row in data.iterrows():
                if pd.notna(row[var_name]): 
                    result["variables"][var_name]["states"].append({
                        "state": row["Jurisdictions"],
                        "effective_date": row["Effective Date"],
                        "valid_through_date": row["Valid Through Date"],
                        "value": row[var_name]
                    })

        return result

    except ValueError as e:
        print(f"ValueError: {e}")
        raise

    except Exception as e:
        print(f"Unexpected error: {e}")
        raise
