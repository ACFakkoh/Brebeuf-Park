import os
import sys
import base64
import json
import urllib.request
import urllib.error
from package_app import deploy_files

REPO_NAME = "Brebeuf-Park"
FILES_DIR = os.path.dirname(os.path.abspath(__file__))

def github_api_request(url, method="GET", token=None, data=None):
    headers = {
        "Accept": "application/vnd.github+json",
        "User-Agent": "Brebeuf-Parking-Deployer"
    }
    if token:
        headers["Authorization"] = f"token {token}"
    
    body = None
    if data is not None:
        headers["Content-Type"] = "application/json"
        body = json.dumps(data).encode("utf-8")
        
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            content = resp.read().decode("utf-8")
            return json.loads(content) if content else {}
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8")
        try:
            err_json = json.loads(error_body)
            raise RuntimeError(f"GitHub API Error ({e.code}): {err_json.get('message', error_body)}")
        except Exception:
            raise RuntimeError(f"GitHub API Error ({e.code}): {error_body}")

def deploy():
    print("=" * 60)
    print("🚀  GITHUB PAGES DEPLOYMENT FOR BRÉBEUF PARKING APP  🚀")
    print("=" * 60)
    
    token = os.environ.get("GITHUB_TOKEN")
    if not token:
        if len(sys.argv) > 1:
            token = sys.argv[1].strip()
        else:
            token = input("\nEnter your GitHub Personal Access Token (PAT): ").strip()
            
    if not token:
        print("Error: No GitHub token provided.")
        sys.exit(1)
        
    # 1. Verify user
    print("\n1. Authenticating with GitHub...")
    user_info = github_api_request("https://api.github.com/user", token=token)
    username = user_info["login"]
    print(f"   Authenticated as: @{username}")
    
    # 2. Check if repo exists or create it
    print(f"\n2. Creating/checking repository '{REPO_NAME}'...")
    repo_url = f"https://api.github.com/repos/{username}/{REPO_NAME}"
    try:
        repo = github_api_request(repo_url, token=token)
        print(f"   Repository already exists at: {repo['html_url']}")
    except Exception:
        # Create it
        payload = {
            "name": REPO_NAME,
            "description": "Montreal Street Cleaning Reminder for Rue de Brébeuf & perimeter",
            "private": False,
            "auto_init": True
        }
        repo = github_api_request("https://api.github.com/user/repos", method="POST", token=token, data=payload)
        print(f"   Created repository: {repo['html_url']}")
        
    # 3. Upload/Update files
    print(f"\n3. Uploading application files to GitHub...")
    files = deploy_files
    
    for filename in sorted(files):
        filepath = os.path.join(FILES_DIR, filename)
        with open(filepath, "rb") as f:
            content_bytes = f.read()
            b64_content = base64.b64encode(content_bytes).decode("utf-8")
            
        file_api_url = f"https://api.github.com/repos/{username}/{REPO_NAME}/contents/{filename}"
        
        # Check if file exists to get SHA
        sha = None
        try:
            existing = github_api_request(file_api_url, token=token)
            sha = existing.get("sha")
        except Exception:
            pass
            
        put_payload = {
            "message": f"Deploy {filename}",
            "content": b64_content,
            "branch": "main"
        }
        if sha:
            put_payload["sha"] = sha
            
        github_api_request(file_api_url, method="PUT", token=token, data=put_payload)
        print(f"   Uploaded: {filename}")
        
    # 4. Enable GitHub Pages
    print(f"\n4. Activating GitHub Pages...")
    pages_api_url = f"https://api.github.com/repos/{username}/{REPO_NAME}/pages"
    try:
        github_api_request(pages_api_url, method="POST", token=token, data={
            "source": {"branch": "main", "path": "/"}
        })
        print("   GitHub Pages activated successfully!")
    except Exception as e:
        if "already" in str(e).lower():
            print("   GitHub Pages is already active.")
        else:
            print(f"   Notice: {e}")
            
    live_url = f"https://{username}.github.io/{REPO_NAME}/"
    print("\n" + "=" * 60)
    print("🎉 DEPLOYMENT COMPLETE! 🎉")
    print(f"Your app will be live within 1-2 minutes at:")
    print(f"➔  {live_url}")
    print("=" * 60)
    print("\nOn your iPhone:")
    print("1. Open Safari and go to your URL above.")
    print("2. Tap the Share button (square with arrow ⎋).")
    print("3. Tap 'Add to Home Screen'.")
    print("Enjoy your new street cleaning reminder app!")

if __name__ == "__main__":
    deploy()
