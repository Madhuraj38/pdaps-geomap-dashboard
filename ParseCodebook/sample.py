import re
import json
import sys
import PyPDF2

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

def read_pdf_to_json(pdf_path):
    # pdf_path = './codebooks/2.pdf' 

    extracted_text = extract_text_from_pdf(pdf_path)
    # print(extracted_text)
    # questions_text = extract_questions_section(extracted_text)
    # print(questions_text)
    json_result = parse_text_to_json(extracted_text)

    print(json.dumps(json_result, indent=4))
    return json_result

