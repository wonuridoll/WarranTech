import os
import re

emoji_pattern = re.compile(
    r"("
    r"[\U0001f600-\U0001f64f]|"  # emoticons
    r"[\U0001f300-\U0001f5ff]|"  # symbols & pictographs
    r"[\U0001f680-\U0001f6ff]|"  # transport & map symbols
    r"[\U0001f1e0-\U0001f1ff]|"  # flags (iOS)
    r"[\U00002702-\U000027b0]|"
    r"[\U000024C2-\U0001F251]"
    r")+",
    re.UNICODE
)

def find_emojis(directory):
    for root, dirs, files in os.walk(directory):
        if 'venv' in root or '.git' in root or '__pycache__' in root:
            continue
        for file in files:
            if file.endswith(('.html', '.js', '.py')):
                filepath = os.path.join(root, file)
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        lines = f.readlines()
                        for i, line in enumerate(lines):
                            if emoji_pattern.search(line):
                                print(f"{filepath}:{i+1}:{line.strip()}")
                except Exception:
                    pass

find_emojis('c:/Users/marya/Downloads/WarranTech-main/WarranTech-main/apps')
