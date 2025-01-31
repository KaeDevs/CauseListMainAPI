# import requests
# from pprint import pprint as pp

# req = requests.get("https://mhc.tn.gov.in/judis/clists/clists-madurai/views/a.php?result=Y2F1c2VfMDkxMjIwMjQueG1s&cdate=MjAyNC0xMi0wOQ==&ft=2&fil=", verify=False)

# # print(req.text)

# pp(req.text)

#!/usr/bin/env python


from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager


from selenium.webdriver.common.by import By
import time
import os
import base64
from datetime import datetime

def Generate_Parts(specified_date=None):
    

    # :param specified_date: A string in 'YYYY-MM-DD' format or None for the current date
    
    if specified_date:
        # Parse the specified date string into a datetime object
        current_date = datetime.strptime(specified_date, "%Y-%m-%d")
    else:
        # Fallback to the current date
        current_date = datetime.now()

    # Create the result_to_encode and cdate_to_encode strings
    result_to_encode = f"cause_{current_date.strftime('%d%m%Y')}.xml"
    cdate_to_encode = current_date.strftime('%Y-%m-%d')

    # Encode the strings using Base64
    encoded_result = base64.b64encode(result_to_encode.encode()).decode()
    encoded_cdate = base64.b64encode(cdate_to_encode.encode()).decode()

    return encoded_result, encoded_cdate

def Generate_Url(midpart, lastpart, mdu):
    if(mdu == True):
        url = f"https://mhc.tn.gov.in/judis/clists/clists-madurai/views/a.php?result={midpart}&cdate={lastpart}&ft=2&fil="
        return url
    else:
        url = f"https://mhc.tn.gov.in/judis/clists/clists-madras/views/a.php?result={midpart}&cdate={lastpart}&ft=2&fil="
        return url



def save_webpage_selenium(url, save_dir, date=None):
    # Setup WebDriver (Chrome in this case)
    if(date):
        current_date = datetime.strptime(date, "%d-%m-%Y")
        # Format current_date to exclude time part and remove invalid filename characters
        formatted_date = current_date.strftime("%d-%m-%Y")  # This excludes the time part
    else:
        current_date = datetime.now()
        # Format current_date to exclude time part and remove invalid filename characters
        formatted_date = current_date.strftime("%d-%m-%Y")  # This excludes the time part
    
    if("madurai" in url):
        name = f"mdu{formatted_date}"
    else:
        name = f"madr{formatted_date}"

        print(f"name is :: {name}")

    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))
   
    # Load the webpage
    driver.get(url)
    
    # Wait for the page to load completely (you can adjust the wait time)
    time.sleep(5)  # You can also use WebDriverWait for more precise waits
    
    # Save the HTML source
    if not os.path.exists(save_dir):
        os.makedirs(save_dir)
    
    html_path = os.path.join(save_dir, f"{name}.html")
    with open(html_path, "w", encoding="utf-8") as f:
        f.write(driver.page_source)
    
    # Optionally, capture screenshots for visual verification
    screenshot_path = os.path.join(save_dir, "screenshot.png")
    driver.save_screenshot(screenshot_path)
    
    print(f"Webpage saved as {html_path}")
    print(f"Screenshot saved as {screenshot_path}")
    
    # Close the driver
    driver.quit()

# Example usage
date = "01-02-2025"
date_for_generate = "2025-02-01"
midPart, lastPart = Generate_Parts(date_for_generate)
# midPart, lastPart = Generate_Parts()
print(midPart, "  " ,lastPart)


url1 = Generate_Url(midpart=midPart, lastpart=lastPart, mdu = True)
url2 = Generate_Url(midpart=midPart, lastpart=lastPart, mdu = False)
print(url1)
print(url2)

save_webpage_selenium(url1, "saved_webpage", date)
save_webpage_selenium(url2, "saved_webpage", date)


# save_webpage_selenium(url1, "saved_webpage")
# save_webpage_selenium(url2, "saved_webpage")