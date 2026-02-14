#!/usr/bin/env python3
"""
Script per generare le icone PWA di NicheSafe in diverse dimensioni
Richiede: pip install Pillow
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_icon(size, output_path):
    """Crea un'icona con il logo NicheSafe"""
    
    # Crea un'immagine con sfondo gradient-like
    img = Image.new('RGB', (size, size), color='#0f172a')
    draw = ImageDraw.Draw(img)
    
    # Disegna un cerchio centrale con gradiente simulato
    center = size // 2
    radius = int(size * 0.35)
    
    # Cerchio esterno (accent color)
    draw.ellipse(
        [center - radius, center - radius, center + radius, center + radius],
        fill='#3b82f6',
        outline='#22c55e',
        width=int(size * 0.05)
    )
    
    # Simbolo centrale (✓)
    try:
        # Prova a usare un font se disponibile
        font_size = int(size * 0.4)
        try:
            font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", font_size)
        except:
            font = ImageFont.load_default()
        
        # Disegna il checkmark
        text = "✓"
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        
        position = ((size - text_width) // 2, (size - text_height) // 2 - int(size * 0.05))
        draw.text(position, text, fill='white', font=font)
    except:
        # Fallback: disegna un semplice checkmark con linee
        line_width = int(size * 0.08)
        # Linea corta del check
        draw.line(
            [center - radius//2, center, center - radius//4, center + radius//2],
            fill='white',
            width=line_width
        )
        # Linea lunga del check
        draw.line(
            [center - radius//4, center + radius//2, center + radius//2, center - radius//2],
            fill='white',
            width=line_width
        )
    
    # Salva l'icona
    img.save(output_path, 'PNG', optimize=True)
    print(f"✓ Creata icona: {output_path} ({size}x{size})")

def main():
    """Genera tutte le icone necessarie per PWA"""
    
    # Crea la cartella icons se non esiste
    icons_dir = 'icons'
    if not os.path.exists(icons_dir):
        os.makedirs(icons_dir)
        print(f"📁 Creata cartella: {icons_dir}/")
    
    # Dimensioni richieste per PWA
    sizes = [72, 96, 128, 144, 152, 192, 384, 512]
    
    print("\n🎨 Generazione icone NicheSafe PWA...\n")
    
    for size in sizes:
        output_path = os.path.join(icons_dir, f'icon-{size}x{size}.png')
        create_icon(size, output_path)
    
    print(f"\n✅ Tutte le icone sono state generate in {icons_dir}/")
    print("\nPer ottenere icone di qualità superiore, considera di:")
    print("1. Creare un design personalizzato con software come Figma o Adobe Illustrator")
    print("2. Usare servizi online come https://realfavicongenerator.net/")
    print("3. Sostituire le icone generate con le tue versioni personalizzate\n")

if __name__ == '__main__':
    try:
        from PIL import Image, ImageDraw, ImageFont
        main()
    except ImportError:
        print("❌ Errore: Pillow non è installato")
        print("\nInstalla Pillow con:")
        print("  pip install Pillow")
        print("\nOppure crea manualmente le icone nelle seguenti dimensioni:")
        print("  72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512")
