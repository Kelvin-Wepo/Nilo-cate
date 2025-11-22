import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'nilocate_project.settings')
django.setup()

from trees.models import TreeSpecies, Tree
from users.models import User

# Create endangered tree species
species_data = [
    {
        'name': 'Meru Oak',
        'scientific_name': 'Vitex keniensis',
        'description': 'A large, slow-growing tree found in montane forests of central Kenya.',
        'risk_level': 'endangered',
        'native_region': 'Central Kenya - Mount Kenya, Aberdare Range',
        'characteristics': 'Can grow up to 40m tall, has compound leaves, produces small purple flowers',
        'conservation_importance': 'Critical for watershed protection and local timber industry',
        'threats': 'Logging for timber, agricultural expansion, charcoal production'
    },
    {
        'name': 'East African Yellowwood',
        'scientific_name': 'Podocarpus latifolius',
        'description': 'An evergreen conifer endemic to East African highlands.',
        'risk_level': 'critically_endangered',
        'native_region': 'Aberdare Mountains, Mount Kenya',
        'characteristics': 'Slow-growing, can live for centuries, needle-like leaves, reddish bark',
        'conservation_importance': 'Essential for mountain ecosystem stability and carbon sequestration',
        'threats': 'Illegal logging, climate change, forest fires'
    },
    {
        'name': 'African Cherry',
        'scientific_name': 'Prunus africana',
        'description': 'A valuable medicinal tree found in Kenyan highland forests.',
        'risk_level': 'vulnerable',
        'native_region': 'Mount Kenya, Aberdares, Kakamega Forest',
        'characteristics': 'Grows 20-30m tall, dark glossy leaves, small white flowers, red-brown bark',
        'conservation_importance': 'Important medicinal tree for prostate health, supports forest wildlife',
        'threats': 'Over-harvesting of bark for medicine, habitat loss'
    },
    {
        'name': 'Kenya Cedar',
        'scientific_name': 'Juniperus procera',
        'description': 'Ancient conifer found in highland forests, known for its aromatic wood.',
        'risk_level': 'endangered',
        'native_region': 'Mount Kenya, Aberdares, Cherrangani Hills',
        'characteristics': 'Can reach 40m height, aromatic wood, scale-like leaves, blue berry-like cones',
        'conservation_importance': 'Vital for soil conservation and traditional medicine',
        'threats': 'Timber harvesting, charcoal production, agricultural encroachment'
    },
    {
        'name': 'Muhugu',
        'scientific_name': 'Brachylaena huillensis',
        'description': 'Slow-growing hardwood tree found in coastal and highland forests.',
        'risk_level': 'vulnerable',
        'native_region': 'Coastal Kenya, Shimba Hills, Kakamega',
        'characteristics': 'Dense hardwood, grows 20-30m, aromatic leaves, small white flowers',
        'conservation_importance': 'Excellent timber species, important for coastal forest ecosystems',
        'threats': 'Logging for construction, slow regeneration rate'
    }
]

print("🌳 Creating tree species...")
for species_info in species_data:
    species, created = TreeSpecies.objects.get_or_create(
        scientific_name=species_info['scientific_name'],
        defaults=species_info
    )
    if created:
        print(f"   ✓ Created: {species.name}")
    else:
        print(f"   - Already exists: {species.name}")

# Get the species
meru_oak = TreeSpecies.objects.get(scientific_name='Vitex keniensis')
yellowwood = TreeSpecies.objects.get(scientific_name='Podocarpus latifolius')
african_cherry = TreeSpecies.objects.get(scientific_name='Prunus africana')
kenya_cedar = TreeSpecies.objects.get(scientific_name='Juniperus procera')
muhugu = TreeSpecies.objects.get(scientific_name='Brachylaena huillensis')

# Get or create a default user
default_user, _ = User.objects.get_or_create(
    username='ranger_admin',
    defaults={
        'email': 'ranger@nilocate.com',
        'user_type': 'ranger',
        'first_name': 'System',
        'last_name': 'Ranger'
    }
)

print("\n🗺️  Creating trees across Kenyan forests...")

# Real forest locations across different Kenyan counties
tree_locations = [
    # NAIROBI COUNTY - Karura Forest
    {'species': meru_oak, 'lat': -1.2368, 'lng': 36.8515, 'location': 'Karura Forest, Nairobi County', 'health': 'healthy', 'age': 65, 'height': 32.0},
    {'species': african_cherry, 'lat': -1.2395, 'lng': 36.8502, 'location': 'Karura Forest, Nairobi County', 'health': 'stressed', 'age': 45, 'height': 24.5},
    {'species': kenya_cedar, 'lat': -1.2410, 'lng': 36.8490, 'location': 'Karura Forest, Nairobi County', 'health': 'healthy', 'age': 80, 'height': 35.0},
    
    # KAJIADO COUNTY - Ngong Forest
    {'species': meru_oak, 'lat': -1.3694, 'lng': 36.6527, 'location': 'Ngong Forest, Kajiado County', 'health': 'healthy', 'age': 55, 'height': 28.0},
    {'species': african_cherry, 'lat': -1.3720, 'lng': 36.6545, 'location': 'Ngong Forest, Kajiado County', 'health': 'diseased', 'age': 40, 'height': 22.0},
    
    # NYERI COUNTY - Mount Kenya Forest
    {'species': yellowwood, 'lat': -0.1521, 'lng': 37.3084, 'location': 'Mount Kenya National Park, Nyeri County', 'health': 'critical', 'age': 120, 'height': 38.0},
    {'species': meru_oak, 'lat': -0.1589, 'lng': 37.3105, 'location': 'Mount Kenya Forest, Nyeri County', 'health': 'healthy', 'age': 70, 'height': 33.5},
    {'species': kenya_cedar, 'lat': -0.1650, 'lng': 37.3150, 'location': 'Mount Kenya Forest, Nyeri County', 'health': 'healthy', 'age': 90, 'height': 36.0},
    
    # NYANDARUA COUNTY - Aberdare Range
    {'species': yellowwood, 'lat': -0.3833, 'lng': 36.7333, 'location': 'Aberdare National Park, Nyandarua County', 'health': 'healthy', 'age': 110, 'height': 37.0},
    {'species': african_cherry, 'lat': -0.4012, 'lng': 36.7401, 'location': 'Aberdare Forest, Nyandarua County', 'health': 'stressed', 'age': 60, 'height': 29.0},
    {'species': kenya_cedar, 'lat': -0.3900, 'lng': 36.7380, 'location': 'Aberdare Forest, Nyandarua County', 'health': 'healthy', 'age': 95, 'height': 34.5},
    
    # KAKAMEGA COUNTY - Kakamega Forest (Western Kenya)
    {'species': african_cherry, 'lat': 0.2827, 'lng': 34.8574, 'location': 'Kakamega Forest, Kakamega County', 'health': 'healthy', 'age': 50, 'height': 26.0},
    {'species': meru_oak, 'lat': 0.2901, 'lng': 34.8612, 'location': 'Kakamega Forest, Kakamega County', 'health': 'healthy', 'age': 48, 'height': 25.5},
    {'species': muhugu, 'lat': 0.2750, 'lng': 34.8550, 'location': 'Kakamega Forest, Kakamega County', 'health': 'stressed', 'age': 55, 'height': 23.0},
    
    # NAKURU COUNTY - Mau Forest Complex
    {'species': yellowwood, 'lat': -0.4833, 'lng': 35.6167, 'location': 'Mau Forest Complex, Nakuru County', 'health': 'critical', 'age': 100, 'height': 35.0},
    {'species': african_cherry, 'lat': -0.4950, 'lng': 35.6250, 'location': 'Mau Forest Complex, Nakuru County', 'health': 'diseased', 'age': 42, 'height': 21.0},
    {'species': kenya_cedar, 'lat': -0.5100, 'lng': 35.6300, 'location': 'Mau Forest Complex, Nakuru County', 'health': 'healthy', 'age': 75, 'height': 31.0},
    
    # KWALE COUNTY - Shimba Hills (Coastal Forest)
    {'species': muhugu, 'lat': -4.2380, 'lng': 39.3720, 'location': 'Shimba Hills National Reserve, Kwale County', 'health': 'healthy', 'age': 60, 'height': 27.0},
    {'species': african_cherry, 'lat': -4.2450, 'lng': 39.3800, 'location': 'Shimba Hills Forest, Kwale County', 'health': 'stressed', 'age': 38, 'height': 20.5},
    
    # MOMBASA COUNTY - Mombasa Municipal Forest
    {'species': muhugu, 'lat': -4.0435, 'lng': 39.6682, 'location': 'Mombasa Municipal Forest, Mombasa County', 'health': 'healthy', 'age': 35, 'height': 18.0},
    
    # ELGEYO MARAKWET COUNTY - Cherangani Hills
    {'species': kenya_cedar, 'lat': 1.1500, 'lng': 35.4500, 'location': 'Cherangani Hills Forest, Elgeyo Marakwet County', 'health': 'healthy', 'age': 85, 'height': 33.0},
    {'species': yellowwood, 'lat': 1.1600, 'lng': 35.4600, 'location': 'Cherangani Hills Forest, Elgeyo Marakwet County', 'health': 'stressed', 'age': 95, 'height': 34.0},
    
    # KERICHO COUNTY - Mau Forest
    {'species': african_cherry, 'lat': -0.3677, 'lng': 35.2839, 'location': 'Mau Forest, Kericho County', 'health': 'healthy', 'age': 52, 'height': 26.5},
    {'species': kenya_cedar, 'lat': -0.3750, 'lng': 35.2900, 'location': 'Mau Forest, Kericho County', 'health': 'diseased', 'age': 68, 'height': 29.0},
]

for i, tree_data in enumerate(tree_locations, start=1):
    # Create unique tree_id
    county = tree_data['location'].split(',')[-1].strip().replace(' County', '').replace(' ', '')[:3].upper()
    tree_id = f"{county}-{tree_data['species'].scientific_name[:4].upper()}-{i:03d}"
    
    # Check if tree already exists at this exact location
    existing_tree = Tree.objects.filter(
        latitude=tree_data['lat'],
        longitude=tree_data['lng']
    ).first()
    
    if not existing_tree:
        tree = Tree.objects.create(
            tree_id=tree_id,
            species=tree_data['species'],
            latitude=tree_data['lat'],
            longitude=tree_data['lng'],
            location_name=tree_data['location'],
            health_status=tree_data['health'],
            estimated_age=tree_data.get('age', 50),
            height=tree_data.get('height', 25.0),
            diameter=1.2,
            added_by=default_user,
            notes=f'Endangered tree in {tree_data["location"]}'
        )
        print(f"   ✓ {tree.location_name} - {tree.species.name}")
    else:
        print(f"   - Tree already exists at {tree_data['location']}")

print(f"\n✅ Sample data creation complete!")
print(f"📊 Total locations across {len(set([t['location'].split(',')[-1].strip() for t in tree_locations]))} different counties")
print("🌳 Counties: Nairobi, Kajiado, Nyeri, Nyandarua, Kakamega, Nakuru, Kwale, Mombasa, Elgeyo Marakwet, Kericho")
