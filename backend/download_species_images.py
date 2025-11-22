import os
import django
import requests
from pathlib import Path

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'nilocate_project.settings')
django.setup()

from trees.models import TreeSpecies
from django.core.files.base import ContentFile

# High-quality tree images from Unsplash - species-specific where possible
species_images = {
    'Vitex keniensis': {
        'url': 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=800&q=80',
        'filename': 'meru_oak.jpg'
    },
    'Podocarpus latifolius': {
        'url': 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=800&q=80',
        'filename': 'yellowwood.jpg'
    },
    'Prunus africana': {
        'url': 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?w=800&q=80',
        'filename': 'african_cherry.jpg'
    },
    'Juniperus procera': {
        'url': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80',
        'filename': 'kenya_cedar.jpg'
    },
    'Brachylaena huillensis': {
        'url': 'https://images.unsplash.com/photo-1511497584788-876760111969?w=800&q=80',
        'filename': 'muhugu.jpg'
    }
}

print("🖼️  Downloading and saving species images...\n")

for scientific_name, img_data in species_images.items():
    try:
        species = TreeSpecies.objects.get(scientific_name=scientific_name)
        
        if species.image:
            print(f"   ✓ {species.name}: Already has an image ({species.image.name})")
            continue
        
        print(f"   📥 Downloading image for {species.name}...")
        
        # Download the image
        response = requests.get(img_data['url'], timeout=30)
        
        if response.status_code == 200:
            # Save the image to the species
            species.image.save(
                img_data['filename'],
                ContentFile(response.content),
                save=True
            )
            print(f"   ✅ {species.name}: Image saved successfully!")
        else:
            print(f"   ❌ {species.name}: Failed to download (Status: {response.status_code})")
            
    except TreeSpecies.DoesNotExist:
        print(f"   ❌ Species not found: {scientific_name}")
    except Exception as e:
        print(f"   ❌ {species.name}: Error - {str(e)}")

print("\n" + "=" * 80)
print("✅ Species images download complete!")
print("   Images are now stored in the database and will appear on the map.")
print("=" * 80)
