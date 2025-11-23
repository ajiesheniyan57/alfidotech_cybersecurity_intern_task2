from flask import Flask, render_template, request
import requests

app = Flask(__name__)

def check_security_headers(url):
    """
    Checks a given URL for common security headers and returns a list of results.
    """
    results = []
    
    if not url.startswith('http://') and not url.startswith('https://'):
        url = 'https://' + url

    try:
        response = requests.get(url, timeout=5)
        headers = response.headers
        
        # 1. Strict-Transport-Security
        if 'Strict-Transport-Security' in headers:
            results.append({'name': 'Strict-Transport-Security', 'status': '✅ Present'})
        else:
            results.append({'name': 'Strict-Transport-Security', 'status': '⚠ Missing'})

        # 2. Content-Security-Policy
        if 'Content-Security-Policy' in headers:
            results.append({'name': 'Content-Security-Policy', 'status': '✅ Present'})
        else:
            results.append({'name': 'Content-Security-Policy', 'status': '⚠ Missing'})

        # 3. X-Content-Type-Options
        if 'X-Content-Type-Options' in headers and headers['X-Content-Type-Options'] == 'nosniff':
            results.append({'name': 'X-Content-Type-Options', 'status': '✅ Present (nosniff)'})
        else:
            results.append({'name': 'X-Content-Type-Options', 'status': '⚠ Missing or incorrect'})

        # 4. X-Frame-Options
        if 'X-Frame-Options' in headers:
            results.append({'name': 'X-Frame-Options', 'status': f"✅ Present ({headers['X-Frame-Options']})"})
        else:
            results.append({'name': 'X-Frame-Options', 'status': '⚠ Missing'})

    except requests.exceptions.Timeout:
        results.append({'name': 'Connection Error', 'status': f'❌ Request timed out for {url}'})
    except requests.exceptions.ConnectionError:
        results.append({'name': 'Connection Error', 'status': f'❌ Could not connect to {url}'})
    except requests.exceptions.RequestException as e:
        results.append({'name': 'General Error', 'status': f'❌ An error occurred: {e}'})
        
    return results

@app.route('/')
def index():
    """Serves the homepage with the input form."""
    return render_template('index.html')

@app.route('/check', methods=['POST'])
def check_url():
    """Handles the form submission and displays results."""
    # Get the URL from the form submission
    url_to_check = request.form['url']
    
    # Run our function
    header_results = check_security_headers(url_to_check)
    
    # Pass the results to the results.html template
    return render_template('results.html', url=url_to_check, results=header_results)

if __name__ == '__main__':
    app.run(debug=True)