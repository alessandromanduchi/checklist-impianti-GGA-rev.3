#!/usr/bin/env python3
"""
Script to remove photo requirements from equipment verification in app.js
"""

def remove_photo_requirements():
    # Read the original file
    with open('app.js', 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    # Track lines to remove
    output_lines = []
    skip_until_line = -1
    i = 0
    
    while i < len(lines):
        line = lines[i]
        
        # Skip if we're in a removal block
        if i < skip_until_line:
            i += 1
            continue
        
        # Remove photosByType and needsPhoto initialization (lines 113-114)
        if 'photosByType: {},' in line or 'needsPhoto: {},' in line:
            print(f"Removing line {i+1}: {line.strip()}")
            i += 1
            continue
        
        # Remove photosByType array initializations
        if 'item.photosByType.' in line and '= []' in line:
            print(f"Removing line {i+1}: {line.strip()}")
            i += 1
            continue
        
        # Remove photo display forEach block (lines 245-247)
        if 'Object.keys(item.photosByType).forEach' in line:
            print(f"Removing photo display block starting at line {i+1}")
            # Skip this line and the next 2 lines (the block)
            skip_until_line = i + 3
            i += 1
            continue
        
        # Remove needsPhoto assignment
        if 'item.needsPhoto[checkType]' in line:
            print(f"Removing line {i+1}: {line.strip()}")
            i += 1
            continue
        
        # Remove photo button show/hide logic
        if 'photoBtn.style.display' in line and 'needsPhoto' in line:
            print(f"Removing line {i+1}: {line.strip()}")
            i += 1
            continue
        
        # Keep the line
        output_lines.append(line)
        i += 1
    
    # Write the modified file
    with open('app.js', 'w', encoding='utf-8') as f:
        f.writelines(output_lines)
    
    print(f"\nOriginal lines: {len(lines)}")
    print(f"Modified lines: {len(output_lines)}")
    print(f"Lines removed: {len(lines) - len(output_lines)}")

if __name__ == '__main__':
    remove_photo_requirements()
