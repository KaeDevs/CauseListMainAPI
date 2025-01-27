from datetime import datetime
import json
from bs4 import BeautifulSoup

def Generate_JSON(path, name):
    with open(path, 'r', encoding='utf-8') as file:
        content = file.read()


    soup = BeautifulSoup(content, 'html.parser')


    data = []
    courts = {}  
    court_numbers = []  
    court_number = ""
    justices = ""
    timing = ""
    current_category = ""
    rows = soup.find_all('tr')

    for row in rows:
        
        court_heading = row.find('span', class_='court')
        head_judge = row.find('span', class_='head_judge')

        
        court_timing = row.find('span', style=lambda value: value and 'font-size:12px' in value)  

        if court_heading and head_judge:
            court_number = court_heading.get_text(strip=True)
            justices = head_judge.get_text(strip=True)

            
            justices_list = [f'The Honourable {j.strip()}' for j in justices.split('The Honourable') if j.strip()]

            
            if court_timing:
                timing = court_timing.get_text(strip=True)

            
            court_info = {
                'court_number': court_number,
                'justices': justices_list,  
                'timing': timing  
            }

            
            if court_number not in courts:
                courts[court_number] = []
                court_numbers.append(court_number)  

            courts[court_number].append(court_info)

            continue  

        
        heading = row.find('span', class_='stagename_heading')
        if heading:
            
            current_category = heading.get_text(strip=True)
            continue  

        
        cols = row.find_all('td')
        if len(cols) >= 5:  
            case_data = {
                'serial_number': cols[0].get_text(strip=True),
                'case_number': cols[1].get_text(strip=True),
                'parties': cols[2].get_text(strip=True).replace('VS', ' VS '), 
                'petitioner_advocates': cols[3].get_text(strip=True),
                'respondent_advocates': cols[4].get_text(strip=True),
                'category': current_category,  
                'COURT NO.': court_number,  
                'Justice': justices_list  
            }
            data.append(case_data)


    final_json = {
        'cases': data,
        'courts': courts,  
        'court_numbers': court_numbers  
    }


    json_data = json.dumps(final_json, indent=4)


    with open(f'jsons\{name}{current_date}.json', 'w', encoding='utf-8') as json_file:
        json_file.write(json_data)


    print(json_data)

current_date = datetime.now().strftime("%d-%m-%Y")
try:
    Generate_JSON(f'saved_webpage\mdu{current_date}.html', "mdu")
except(Exception):
    print(Exception)

try:
    Generate_JSON(f'saved_webpage\madr{current_date}.html', "madr")
except(Exception):
    print(Exception)