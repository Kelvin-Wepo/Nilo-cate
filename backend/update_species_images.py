import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'nilocate_project.settings')
django.setup()

from trees.models import TreeSpecies
import urllib.request
from pathlib import Path

# Image URLs from Unsplash and other sources (high-quality tree images)
species_images = {
    'Vitex keniensis': {
        'url': 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=2070',
        'filename': 'meru_oak.jpg'
    },
    'Podocarpus latifolius': {
        'url': 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=2074',
        'filename': 'yellowwood.jpg'
    },
    'Prunus africana': {
        'url': 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?q=80&w=2084',
        'filename': 'african_cherry.jpg'
    },
    'Juniperus procera': {
        'url': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2071',
        'filename': 'kenya_cedar.jpg'
    },
    'Brachylaena huillensis': {
        'url': 'https://images.unsplash.com/photo-1511497584788-876760111969?q=80&w=2089',
        'filename': 'muhugu.jpg'
    }
}

print("🖼️  Updating species with image URLs...")

for scientific_name, img_data in species_images.items():
    try:
        species = TreeSpecies.objects.get(scientific_name=scientific_name)
        
        # For now, we'll just store the URL in a note
        # In production, you'd download and save the actual image
        if not species.image:
            print(f"   ℹ️  {species.name}: Image URL available: {img_data['url']}")
            print(f"      To use actual images, download manually to media/species/{img_data['filename']}")
        else:
            print(f"   ✓ {species.name}: Already has an image")
            
    except TreeSpecies.DoesNotExist:
        print(f"   ❌ Species not found: {scientific_name}")

print("\n💡 Image URLs for each species:")
print("=" * 80)
for scientific_name, img_data in species_images.items():
    try:
        species = TreeSpecies.objects.get(scientific_name=scientific_name)
        print(f"\n{species.name} ({scientific_name})")
        print(f"URL: {img_data['url']}")
    except TreeSpecies.DoesNotExist:
        pass

print("\n" + "=" * 80)
print("✅ To display these images in the frontend, use the URLs above")
print("   or download them to the media folder.")
