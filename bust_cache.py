import os

directory = 'c:/Users/marya/Downloads/WarranTech-main/WarranTech-main/apps/frontend/templates'

for root, dirs, files in os.walk(directory):
    for const_file in files:
        if const_file.endswith('.html'):
            filepath = os.path.join(root, const_file)
            with open(filepath, 'r+', encoding='utf-8') as f:
                content = f.read()
                new_content = content.replace("%}\"></script>", "%}?v=2\"></script>")
                f.seek(0)
                f.write(new_content)
                f.truncate()
