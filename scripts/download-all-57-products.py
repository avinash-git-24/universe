from playwright.sync_api import sync_playwright
import urllib.parse
import urllib.request
import os
import sys
import subprocess
import time
import json

# Ensure UTF-8 output on Windows
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

PRODUCTS = [
  # ── Chips & Wafers (19) ──
  { "slug": "crunchex-chili-tadka", "name": "CrunchEx Chili Tadka", "price": 20, "subType": "Snacks", "q": "Balaji Crunchex Chili Tadka" },
  { "slug": "kurkure-masala-munch", "name": "Kurkure Masala Munch", "price": 20, "subType": "Snacks", "q": "Kurkure Masala Munch" },
  { "slug": "chili-chataka-kurkure", "name": "Chili Chataka Kurkure", "price": 20, "subType": "Snacks", "q": "Kurkure Chilli Chataka" },
  { "slug": "lays-magic-masala", "name": "Lays Magic Masala", "price": 20, "subType": "Snacks", "q": "Lays India's Magic Masala potato chips" },
  { "slug": "lays-sizzling-hot", "name": "Lays Sizzling Hot", "price": 20, "subType": "Snacks", "q": "Lays Sizzlin Hot potato chips" },
  { "slug": "lays-west-indies-sweet-chilli", "name": "Lays West Indies Sweet Chilli", "price": 20, "subType": "Snacks", "q": "Lays West Indies Hot Sweet Chilli" },
  { "slug": "puffcorn-lays", "name": "Puffcorn Lays", "price": 20, "subType": "Snacks", "q": "Kurkure Puffcorn Yummy Cheese" },
  { "slug": "balaji-masala-wafers", "name": "Balaji Masala Wafers", "price": 20, "subType": "Snacks", "q": "Balaji Masala Wafers" },
  { "slug": "balaji-salted-wafers", "name": "Balaji Salted Wafers", "price": 20, "subType": "Snacks", "q": "Balaji Simply Salted Wafers" },
  { "slug": "act-butter-popcorn", "name": "ACT Butter Popcorn", "price": 20, "subType": "Snacks", "q": "ACT II Butter Lovers Popcorn" },
  { "slug": "gopal-masala-sev-murmura", "name": "Gopal Masala Sev Murmura", "price": 15, "subType": "Snacks", "q": "Gopal Masala Sev Murmura" },
  { "slug": "gopal-tikha-mitha-mix", "name": "Gopal Tikha Mitha Mix", "price": 15, "subType": "Snacks", "q": "Gopal Tikha Mitha Mix" },
  { "slug": "gopal-farali-chevdo", "name": "Gopal Farali Chevdo", "price": 20, "subType": "Snacks", "q": "Gopal Farali Chevdo" },
  { "slug": "gopal-moong-dal", "name": "Gopal Moong Dal", "price": 15, "subType": "Snacks", "q": "Gopal Moong Dal namkeen" },
  { "slug": "gopal-mexican-chilli", "name": "Gopal Mexican Chilli", "price": 20, "subType": "Snacks", "q": "Gopal Mexican Chilli Corn Rings" },
  { "slug": "bingo-mad-angles-achaari", "name": "Bingo Mad Angles Achaari", "price": 20, "subType": "Snacks", "q": "Bingo Mad Angles Achaari Masti" },
  { "slug": "roaven-salted-peanut", "name": "Roaven Salted Peanut", "price": 30, "subType": "Snacks", "q": "Haldiram Salted Peanuts 40g" },
  { "slug": "maggi-2-min", "name": "Maggi 2-Min", "price": 20, "subType": "Snacks", "q": "Maggi 2-Minute Masala Noodles" },
  { "slug": "doritos-cheese", "name": "Doritos Cheese", "price": 30, "subType": "Snacks", "q": "Doritos Nacho Cheese" },

  # ── Drinks & Shakes (21) ──
  { "slug": "frooti-400ml", "name": "Frooti 400ml", "price": 30, "subType": "Drinks", "q": "Frooti Mango Drink bottle" },
  { "slug": "appy-fizz-250ml", "name": "Appy Fizz 250ml", "price": 20, "subType": "Drinks", "q": "Appy Fizz sparkling apple drink bottle" },
  { "slug": "amul-kool-cafe", "name": "Amul Kool Cafe", "price": 40, "subType": "Drinks", "q": "Amul Kool Cafe can" },
  { "slug": "amul-kool-dark-chocolate", "name": "Amul Kool Dark Chocolate", "price": 25, "subType": "Drinks", "q": "Amul Kool Dark Chocolate bottle" },
  { "slug": "amul-kool-koko", "name": "Amul Kool Koko", "price": 40, "subType": "Drinks", "q": "Amul Kool Koko can" },
  { "slug": "amul-kool-rose", "name": "Amul Kool Rose", "price": 30, "subType": "Drinks", "q": "Amul Kool Rose bottle" },
  { "slug": "dark-fantasy-shake", "name": "Dark Fantasy Shake", "price": 30, "subType": "Drinks", "q": "Sunfeast Dark Fantasy Chocolate Shake" },
  { "slug": "britannia-strawberry-shake", "name": "Britannia Strawberry Shake", "price": 40, "subType": "Drinks", "q": "Britannia Winkin Cow Strawberry Shake" },
  { "slug": "britannia-vanilla-shake", "name": "Britannia Vanilla Shake", "price": 40, "subType": "Drinks", "q": "Britannia Winkin Cow Vanilla Shake" },
  { "slug": "paper-boat-jamun", "name": "Paper Boat Jamun", "price": 25, "subType": "Drinks", "q": "Paper Boat Jamun juice" },
  { "slug": "paper-boat-apple", "name": "Paper Boat Apple", "price": 25, "subType": "Drinks", "q": "Paper Boat Apple juice" },
  { "slug": "paper-boat-orange", "name": "Paper Boat Orange", "price": 25, "subType": "Drinks", "q": "Paper Boat Orange juice" },
  { "slug": "swing-coconut-water", "name": "Swing Coconut Water", "price": 20, "subType": "Drinks", "q": "Paper Boat Swing Tender Coconut Water" },
  { "slug": "swing-mixed-fruit", "name": "Swing Mixed Fruit", "price": 20, "subType": "Drinks", "q": "Paper Boat Swing Mixed Fruit" },
  { "slug": "swing-guava", "name": "Swing Guava", "price": 20, "subType": "Drinks", "q": "Paper Boat Swing Chilli Guava" },
  { "slug": "swing-pomegranate", "name": "Swing Pomegranate", "price": 20, "subType": "Drinks", "q": "Paper Boat Swing Pomegranate" },
  { "slug": "jam-in-mix-fruit", "name": "Jam-in Mix Fruit", "price": 20, "subType": "Drinks", "q": "Kissan Mixed Fruit Squash or Drink" },
  { "slug": "sprite-mrp-20", "name": "Sprite MRP 20", "price": 20, "subType": "Drinks", "q": "Sprite 250ml bottle" },
  { "slug": "fanta-250ml", "name": "Fanta 250ml", "price": 20, "subType": "Drinks", "q": "Fanta Orange 250ml bottle" },
  { "slug": "coca-cola-can", "name": "Coca-Cola Can", "price": 40, "subType": "Drinks", "q": "Coca Cola 300ml can" },
  { "slug": "kinley-water-500ml", "name": "Kinley Water 500ml", "price": 10, "subType": "Drinks", "q": "Kinley 500ml water bottle" },

  # ── Chocolates & Biscuits (17) ──
  { "slug": "kitkat", "name": "KitKat", "price": 30, "subType": "Sweets", "q": "Nestle KitKat 4 finger chocolate bar" },
  { "slug": "dairy-milk-chocolate", "name": "Dairy Milk Chocolate", "price": 45, "subType": "Sweets", "q": "Cadbury Dairy Milk chocolate" },
  { "slug": "amul-fruit-nut", "name": "Amul Fruit Nut", "price": 45, "subType": "Sweets", "q": "Amul Fruit and Nut Dark Chocolate bar" },
  { "slug": "amul-velvet-chocolate", "name": "Amul Velvet Chocolate", "price": 30, "subType": "Sweets", "q": "Amul Velvet Milk Chocolate bar" },
  { "slug": "amul-smooth-chocolate", "name": "Amul Smooth Chocolate", "price": 20, "subType": "Sweets", "q": "Amul Smooth Milk Chocolate bar" },
  { "slug": "dark-fantasy-vanilla", "name": "Dark Fantasy Vanilla", "price": 30, "subType": "Sweets", "q": "Sunfeast Dark Fantasy Vanilla Fills biscuits" },
  { "slug": "lotte-chocopie", "name": "Lotte Chocopie", "price": 20, "subType": "Sweets", "q": "Lotte Choco Pie" },
  { "slug": "oreo-vanilla-biscuit", "name": "Oreo Vanilla Biscuit", "price": 30, "subType": "Sweets", "q": "Cadbury Oreo Vanilla Creme Biscuit" },
  { "slug": "dukes-bourbon", "name": "Dukes Bourbon", "price": 25, "subType": "Sweets", "q": "Dukes Bourbon chocolate biscuits" },
  { "slug": "dukes-strawberry-cream", "name": "Dukes Strawberry Cream", "price": 25, "subType": "Sweets", "q": "Dukes Waffy Strawberry cream wafer" },
  { "slug": "fab-vanilla-cream", "name": "Fab Vanilla Cream", "price": 30, "subType": "Sweets", "q": "Parle Hide and Seek Fab Vanilla Cream" },
  { "slug": "milk-bikis-cream", "name": "Milk Bikis Cream", "price": 30, "subType": "Sweets", "q": "Britannia Milk Bikis Cream biscuit" },
  { "slug": "butter-cookies", "name": "Butter Cookies", "price": 20, "subType": "Sweets", "q": "Britannia Good Day Butter Cookies" },
  { "slug": "snow-blueberry-pie", "name": "Snow Blueberry Pie", "price": 20, "subType": "Sweets", "q": "Orion Choco Pie Blueberry" },
  { "slug": "nut-grain-energy-bar", "name": "Nut & Grain Energy Bar", "price": 20, "subType": "Sweets", "q": "Yoga Bar Nuts and Seeds energy bar" },
  { "slug": "choco-desire-energy-bar", "name": "Choco Desire Energy Bar", "price": 20, "subType": "Sweets", "q": "RiteBite Max Protein Choco Slim bar" },
  { "slug": "amul-premium-butter", "name": "Amul Premium Butter", "price": 20, "subType": "Sweets", "q": "Amul Butter 100g pack" },
]

OUT_DIR = os.path.join(os.getcwd(), 'public', 'products')
TEMP_DIR = os.path.join(os.getcwd(), 'public', 'temp_raw')
os.makedirs(OUT_DIR, exist_ok=True)
os.makedirs(TEMP_DIR, exist_ok=True)

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
}

def main():
    print(f"Starting Playwright Amazon Packshot Harvester for all {len(PRODUCTS)} products...", flush=True)
    
    with sync_playwright() as p:
        browser = p.chromium.launch(
            executable_path=r'C:\Program Files\Google\Chrome\Application\chrome.exe',
            headless=True
        )
        page = browser.new_page(
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
        )
        
        saved_count = 0
        
        for idx, prod in enumerate(PRODUCTS):
            target_file = os.path.join(OUT_DIR, f"{prod['slug']}.webp")
            if os.path.exists(target_file) and os.path.getsize(target_file) > 2000:
                print(f"[{idx+1}/{len(PRODUCTS)}] Exists: {prod['slug']}.webp", flush=True)
                saved_count += 1
                continue
                
            q = prod['q']
            url = f"https://www.amazon.in/s?k={urllib.parse.quote(q)}"
            
            try:
                page.goto(url, wait_until='domcontentloaded', timeout=15000)
                time.sleep(0.7)
                
                # Find organic search result items
                items = page.locator('div.s-result-item[data-component-type="s-search-result"]:not(.AdHolder)').all()
                chosen_url = None
                matched_title = ""
                
                for it in items:
                    # check not sponsored
                    if it.locator('span:has-text("Sponsored")').count() > 0:
                        continue
                    img = it.locator('img.s-image').first
                    if img.count() > 0:
                        src = img.get_attribute('src')
                        alt = img.get_attribute('alt') or ''
                        if src and ('media-amazon.com' in src or 'images-amazon' in src):
                            chosen_url = src
                            matched_title = alt
                            break
                            
                # fallback if organic items had no images
                if not chosen_url:
                    all_imgs = page.locator('img.s-image').all()
                    for img in all_imgs[:3]:
                        src = img.get_attribute('src')
                        if src and ('media-amazon.com' in src or 'images-amazon' in src):
                            chosen_url = src
                            matched_title = img.get_attribute('alt') or ''
                            break
                
                if chosen_url:
                    # Upgrade resolution to high-res packshot
                    highres_url = chosen_url
                    for suffix in ['_AC_UL320_', '_AC_SR320,320_', '_AC_UL160_', '_AC_SR160,160_', '._AC_UY218_', '._AC_UY327_FMwebp_QL65_']:
                        if suffix in highres_url:
                            highres_url = highres_url.replace(suffix, '_AC_SL800_')
                    
                    raw_ext = '.jpg'
                    raw_file = os.path.join(TEMP_DIR, f"{prod['slug']}{raw_ext}")
                    
                    # Download raw image
                    try:
                        req = urllib.request.Request(highres_url, headers=headers)
                        with urllib.request.urlopen(req, timeout=10) as resp:
                            with open(raw_file, 'wb') as f:
                                f.write(resp.read())
                    except Exception:
                        # Fallback to chosen_url
                        req = urllib.request.Request(chosen_url, headers=headers)
                        with urllib.request.urlopen(req, timeout=10) as resp:
                            with open(raw_file, 'wb') as f:
                                f.write(resp.read())
                                
                    # Convert to WebP using sharp in Node.js
                    node_cmd = [
                        'node', '-e',
                        f"""
                        const sharp = require('sharp');
                        sharp({json.dumps(raw_file)})
                            .resize(400, 400, {{ fit: 'inside', withoutEnlargement: true }})
                            .webp({{ quality: 85 }})
                            .toFile({json.dumps(target_file)})
                            .then(() => console.log('OK'))
                            .catch(err => {{ console.error(err); process.exit(1); }});
                        """
                    ]
                    sub_res = subprocess.run(node_cmd, capture_output=True, text=True)
                    if sub_res.returncode == 0 and os.path.exists(target_file):
                        sz = os.path.getsize(target_file)
                        print(f"[{idx+1}/{len(PRODUCTS)}] [OK] {prod['name']} -> {prod['slug']}.webp ({round(sz/1024)} KB) | Title: {matched_title[:45]}", flush=True)
                        saved_count += 1
                    else:
                        print(f"[{idx+1}/{len(PRODUCTS)}] [FAIL] sharp error for {prod['name']}: {sub_res.stderr}", flush=True)
                else:
                    print(f"[{idx+1}/{len(PRODUCTS)}] [FAIL] No image found for {prod['name']}", flush=True)
                    
            except Exception as ex:
                print(f"[{idx+1}/{len(PRODUCTS)}] Error querying {prod['name']}: {ex}", flush=True)
                
            time.sleep(0.4)
            
        browser.close()
        
    print(f"\nFinished harvesting. Total products ready: {saved_count} / {len(PRODUCTS)}", flush=True)
    
    # Clean up temp_raw
    try:
        for f in os.listdir(TEMP_DIR):
            os.remove(os.path.join(TEMP_DIR, f))
        os.rmdir(TEMP_DIR)
    except Exception:
        pass

if __name__ == '__main__':
    main()
