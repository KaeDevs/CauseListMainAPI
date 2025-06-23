# GenerateAndParse.py
import sys
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
import time
import os
import base64
import json
from bs4 import BeautifulSoup


print("Python script started")
print("Received date:", sys.argv[1])
# your actual logic here



def Generate_Parts(specified_date):
    current_date = datetime.strptime(specified_date, "%Y-%m-%d")
    result_to_encode = f"cause_{current_date.strftime('%d%m%Y')}.xml"
    encoded_result = base64.b64encode(result_to_encode.encode()).decode()
    encoded_cdate = base64.b64encode(specified_date.encode()).decode()
    return encoded_result, encoded_cdate

def Generate_Url(midpart, lastpart, mdu):
    if mdu:
        return f"https://mhc.tn.gov.in/judis/clists/clists-madurai/views/a.php?result={midpart}&cdate={lastpart}&ft=2&fil="
    else:
        return f"https://mhc.tn.gov.in/judis/clists/clists-madras/views/a.php?result={midpart}&cdate={lastpart}&ft=2&fil="

def save_webpage_selenium(url, save_dir, name):
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))
    driver.get(url)
    time.sleep(5)
    if not os.path.exists(save_dir):
        os.makedirs(save_dir)
    html_path = os.path.join(save_dir, f"{name}.html")
    with open(html_path, "w", encoding="utf-8") as f:
        f.write(driver.page_source)
    driver.quit()

def Generate_JSON(path, name, current_date):
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
    category_counts = {}
    category_case_list = {}

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
            category_counts[current_category] = 0
            category_case_list[current_category] = []
            continue

        cols = row.find_all('td')
        if len(cols) >= 5:
            serial_number = cols[0].get_text(strip=True)
            if serial_number:
                category_counts[current_category] += 1
            case_data = {
                'serial_number': serial_number,
                'case_number': cols[1].get_text(strip=True),
                'parties': cols[2].get_text(strip=True).replace('VS', ' VS '),
                'petitioner_advocates': cols[3].get_text(strip=True),
                'respondent_advocates': cols[4].get_text(strip=True),
                'category': current_category,
                'COURT NO.': court_number,
                'Justice': justices_list
            }
            category_case_list[current_category].append(case_data)

    for category, count in category_counts.items():
        updated_category_name = f"{category} ({count})"
        for case in category_case_list[category]:
            case['category'] = updated_category_name
        data.extend(category_case_list[category])

    final_json = {
        'cases': data,
        'courts': courts,
        'court_numbers': court_numbers
    }

    with open(f'jsons/{name}{current_date}.json', 'w', encoding='utf-8') as json_file:
        json.dump(final_json, json_file, indent=4)

def main(date_str):  # date_str in "dd-mm-yyyy"
    save_dir = "saved_webpage"
    current_date = datetime.strptime(date_str, "%d-%m-%Y")
    formatted_date = current_date.strftime("%d-%m-%Y")
    date_for_generate = current_date.strftime("%Y-%m-%d")

    midPart, lastPart = Generate_Parts(date_for_generate)

    # Madurai
    url1 = Generate_Url(midPart, lastPart, True)
    save_webpage_selenium(url1, save_dir, f"mdu{formatted_date}")
    Generate_JSON(os.path.join(save_dir, f"mdu{formatted_date}.html"), "mdu", formatted_date)

    # Madras
    url2 = Generate_Url(midPart, lastPart, False)
    save_webpage_selenium(url2, save_dir, f"madr{formatted_date}")
    Generate_JSON(os.path.join(save_dir, f"madr{formatted_date}.html"), "madr", formatted_date)

if __name__ == "__main__":
    print("Python script started successfully")
    if len(sys.argv) < 2:
        print("Usage: python GenerateAndParse.py dd-mm-yyyy")
    else:
        main(sys.argv[1])
    print("Python script finished successfully")
