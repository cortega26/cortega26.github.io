from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.common.exceptions import NoSuchElementException, TimeoutException
from selenium.webdriver.common.by import By
import time


def login(username, password):
    try:
        service = webdriver.chrome.service.Service(executable_path='C:/Users/Carlos/Downloads/chromedriver.exe')
        driver = webdriver.Chrome(service=service)
        driver.get('https://bootcamp.e-camp.cl/login/index.php')
        time.sleep(5)

        username_field = driver.find_element(By.ID, 'username')
        password_field = driver.find_element(By.ID, 'password')
        username_field.send_keys(username)
        password_field.send_keys(password)
        password_field.send_keys(Keys.RETURN)
        time.sleep(5)

        return driver

    except NoSuchElementException as e:
        print("Error: Element not found -", e)
        return None
    except TimeoutException as e:
        print("Error: Timeout while loading page -", e)
        return None
    except Exception as e:
        print("Error: An unexpected error occurred -", e)
        return None


def click_next_activity_link(driver):
    try:
        driver.get('https://bootcamp.e-camp.cl/mod/assign/view.php?id=29393')
        time.sleep(5)

        counter = 0
        while True:
            try:
                next_activity_link = driver.find_element(By.ID, 'next-activity-link')
                next_activity_link.click()
                counter += 1
                print(f'Botón clickeado #{counter} en {driver.current_url}')
                time.sleep(5)
            except NoSuchElementException:
                print('El elemento con id "next-activity-link" no fue encontrado en la URL:', driver.current_url)
                break
    except TimeoutException as e:
        print("Error: Timeout while loading page -", e)
    except Exception as e:
        print("Error: An unexpected error occurred -", e)
    finally:
        driver.quit()


def main():
    username = '25005183-2'
    password = 'Co25005183-2'

    driver = login(username, password)
    if driver:
        click_next_activity_link(driver)


if __name__ == "__main__":
    main()
