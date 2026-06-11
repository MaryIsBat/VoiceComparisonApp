import os
from pathlib import Path

project_dir = Path(r"C:\Users\grace\Voice Comparison app")

files_to_check = [
    project_dir / "README.md",
    project_dir / "web_app.py",
    project_dir / "templates" / "index.html",
    project_dir / "static" / "js" / "app.js",
    project_dir / "static" / "css" / "style.css",
]

for file_path in files_to_check:
    if file_path.exists():
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
        
        original_content = content
        
        # Replace occurrences that are meant to be the app's name.
        # Note: We must not replace 'from resemblyzer' or 'resemblyzer' in imports.
        # So we'll replace "Resemblyzer" with case sensitivity where it's used as a title.
        content = content.replace("Resemblyzer_clone", "Voice Comparison app")
        content = content.replace("Resemblyzer app", "Voice Comparison app")
        content = content.replace("Resemblyzer Web App", "Voice Comparison app")
        content = content.replace("Resemblyzer model", "Voice Comparison model")
        
        # Replace Resemblyzer if it's not lowercase (lowercase is usually for the module)
        if "Resemblyzer" in content:
            lines = content.split('\n')
            new_lines = []
            for line in lines:
                if "import resemblyzer" not in line and "from resemblyzer" not in line:
                    line = line.replace("Resemblyzer", "Voice Comparison app")
                new_lines.append(line)
            content = '\n'.join(new_lines)
            
        if content != original_content:
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(content)
            print(f"Updated {file_path.name}")
        else:
            print(f"No changes needed in {file_path.name}")
