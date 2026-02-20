#!/usr/bin/env python3
"""
Comprehensive script to remove ALL photo requirements from equipment verification
"""
import re

def remove_all_photo_code():
    with open('app.js', 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_length = len(content)
    
    # Remove handlePhotos function (entire function)
    content = re.sub(
        r'function handlePhotos\(event, itemId, checkType\) \{[^}]*\n(?:[^}]*\n)*?\}',
        '',
        content,
        flags=re.MULTILINE
    )
    
    # Remove displayPhotos function (entire function)
    content = re.sub(
        r'function displayPhotos\(itemId, checkType\) \{[^}]*\n(?:[^}]*\n)*?\}',
        '',
        content,
        flags=re.MULTILINE
    )
    
    # Remove lines with needsPhoto assignments
    lines = content.split('\n')
    filtered_lines = []
    
    for line in lines:
        # Skip lines that contain photo-related code
        if any(pattern in line for pattern in [
            'item.needsPhoto.',
            'item.photosByType.',
            'photosByType: {},',
            'needsPhoto: {},',
            'handlePhotos(',
            'displayPhotos(',
            'allPhotosProvided',
            'needsPhoto[',
            'photosByType[',
        ]):
            continue
        
        # Skip photo upload input elements
        if 'type="file"' in line and 'photo' in line.lower():
            continue
        
        # Skip photo button elements
        if 'photo-btn' in line or 'photoBtn' in line:
            continue
            
        filtered_lines.append(line)
    
    content = '\n'.join(filtered_lines)
    
    # Fix any double empty lines
    content = re.sub(r'\n\n\n+', '\n\n', content)
    
    # Write back
    with open('app.js', 'w', encoding='utf-8') as f:
        f.write(content)
    
    final_length = len(content)
    print(f"Original length: {original_length} bytes")
    print(f"Final length: {final_length} bytes")
    print(f"Removed: {original_length - final_length} bytes")
    
    # Count lines
    with open('app.js', 'r') as f:
        line_count = len(f.readlines())
    print(f"Final line count: {line_count}")

if __name__ == '__main__':
    remove_all_photo_code()
