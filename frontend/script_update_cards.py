import os
import glob

def process_files():
    base_dir = r"C:\Users\Sahil Kumar\OneDrive\Desktop\Documents\Hackathon-Hack-win\frontend\src\pages"
    files = glob.glob(os.path.join(base_dir, "*.jsx"))
    
    count = 0
    for file_path in files:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Replace occurrences
        new_content = content.replace('className="card"', 'className="card glass-card"')
        new_content = new_content.replace('className="card ', 'className="card glass-card ')
        new_content = new_content.replace("className='card'", "className='card glass-card'")
        new_content = new_content.replace("className='card ", "className='card glass-card ")
        
        if content != new_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            count += 1
            print(f"Updated {os.path.basename(file_path)}")
            
    print(f"Finished. Updated {count} files.")

if __name__ == "__main__":
    process_files()
