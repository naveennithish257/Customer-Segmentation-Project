import os
import requests

def upload_dataset(filepath='sample_data/customers.csv', url='http://localhost:5000/api/upload'):
    """Uploads a customer dataset (CSV or Excel) to the running Flask server."""
    if not os.path.exists(filepath):
        # Fallback to local search if executed from within sample_data directory
        if os.path.exists('customers.csv'):
            filepath = 'customers.csv'
        else:
            print(f"[-] Error: Dataset file not found at: {filepath}")
            return False

    print(f"[*] Preparing to upload '{filepath}' to API endpoint: {url}...")
    
    try:
        with open(filepath, 'rb') as f:
            files = {'file': (os.path.basename(filepath), f, 'text/csv')}
            response = requests.post(url, files=files)
            
        if response.status_code == 200:
            result = response.json()
            print("[+] Upload successful!")
            print(f"    - Customers Loaded: {result.get('rows')}")
            print(f"    - Columns Detected: {', '.join(result.get('columns_detected', []))}")
            print(f"    - KPIs Generated: {result.get('kpis')}")
            return True
        else:
            print(f"[-] Upload failed with status code {response.status_code}.")
            print(f"    Error detail: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("[-] Connection Error: Make sure your Flask backend is running on http://localhost:5000.")
        return False
    except Exception as e:
        print(f"[-] An unexpected error occurred: {e}")
        return False

if __name__ == '__main__':
    # Default path relative to backend folder
    default_path = os.path.join(os.path.dirname(__file__), 'sample_data', 'customers.csv')
    upload_dataset(default_path)
