export interface VendingProduct {
  id: string;
  name: string;
  price: number;
  subType: "Drinks" | "Snacks" | "Sweets";
  image: string;
  slot: string;
}

export const VENDING_PRODUCTS: VendingProduct[] = [
  // ── Chips & Wafers (19) ──
  { id: "crunchex-chili-tadka", name: "CrunchEx Chili Tadka", price: 20, subType: "Snacks", image: "/products/crunchex-chili-tadka.webp", slot: "A-01" },
  { id: "kurkure-masala-munch", name: "Kurkure Masala Munch", price: 20, subType: "Snacks", image: "/products/kurkure-masala-munch.webp", slot: "A-02" },
  { id: "chili-chataka-kurkure", name: "Chili Chataka Kurkure", price: 20, subType: "Snacks", image: "/products/chili-chataka-kurkure.webp", slot: "A-03" },
  { id: "lays-magic-masala", name: "Lays Magic Masala", price: 20, subType: "Snacks", image: "/products/lays-magic-masala.webp", slot: "A-04" },
  { id: "lays-sizzling-hot", name: "Lays Sizzling Hot", price: 20, subType: "Snacks", image: "/products/lays-sizzling-hot.webp", slot: "A-05" },
  { id: "lays-west-indies-sweet-chilli", name: "Lays West Indies Sweet Chilli", price: 20, subType: "Snacks", image: "/products/lays-west-indies-sweet-chilli.webp", slot: "A-06" },
  { id: "puffcorn-lays", name: "Puffcorn Lays", price: 20, subType: "Snacks", image: "/products/puffcorn-lays.webp", slot: "A-07" },
  { id: "balaji-masala-wafers", name: "Balaji Masala Wafers", price: 20, subType: "Snacks", image: "/products/balaji-masala-wafers.webp", slot: "A-08" },
  { id: "balaji-salted-wafers", name: "Balaji Salted Wafers", price: 20, subType: "Snacks", image: "/products/balaji-salted-wafers.webp", slot: "A-09" },
  { id: "act-butter-popcorn", name: "ACT Butter Popcorn", price: 20, subType: "Snacks", image: "/products/act-butter-popcorn.webp", slot: "A-10" },
  { id: "gopal-masala-sev-murmura", name: "Gopal Masala Sev Murmura", price: 15, subType: "Snacks", image: "/products/gopal-masala-sev-murmura.webp", slot: "A-11" },
  { id: "gopal-tikha-mitha-mix", name: "Gopal Tikha Mitha Mix", price: 15, subType: "Snacks", image: "/products/gopal-tikha-mitha-mix.webp", slot: "A-12" },
  { id: "gopal-farali-chevdo", name: "Gopal Farali Chevdo", price: 20, subType: "Snacks", image: "/products/gopal-farali-chevdo.webp", slot: "A-13" },
  { id: "gopal-moong-dal", name: "Gopal Moong Dal", price: 15, subType: "Snacks", image: "/products/gopal-moong-dal.webp", slot: "A-14" },
  { id: "gopal-mexican-chilli", name: "Gopal Mexican Chilli", price: 20, subType: "Snacks", image: "/products/gopal-mexican-chilli.webp", slot: "A-15" },
  { id: "bingo-mad-angles-achaari", name: "Bingo Mad Angles Achaari", price: 20, subType: "Snacks", image: "/products/bingo-mad-angles-achaari.webp", slot: "A-16" },
  { id: "roaven-salted-peanut", name: "Roaven Salted Peanut", price: 30, subType: "Snacks", image: "/products/roaven-salted-peanut.webp", slot: "A-17" },
  { id: "maggi-2-min", name: "Maggi 2-Min", price: 20, subType: "Snacks", image: "/products/maggi-2-min.webp", slot: "A-18" },
  { id: "doritos-cheese", name: "Doritos Cheese", price: 30, subType: "Snacks", image: "/products/doritos-cheese.webp", slot: "A-19" },

  // ── Drinks & Shakes (21) ──
  { id: "frooti-400ml", name: "Frooti 400ml", price: 30, subType: "Drinks", image: "/products/frooti-400ml.webp", slot: "B-01" },
  { id: "appy-fizz-250ml", name: "Appy Fizz 250ml", price: 20, subType: "Drinks", image: "/products/appy-fizz-250ml.webp", slot: "B-02" },
  { id: "amul-kool-cafe", name: "Amul Kool Cafe", price: 40, subType: "Drinks", image: "/products/amul-kool-cafe.webp", slot: "B-03" },
  { id: "amul-kool-dark-chocolate", name: "Amul Kool Dark Chocolate", price: 25, subType: "Drinks", image: "/products/amul-kool-dark-chocolate.webp", slot: "B-04" },
  { id: "amul-kool-koko", name: "Amul Kool Koko", price: 40, subType: "Drinks", image: "/products/amul-kool-koko.webp", slot: "B-05" },
  { id: "amul-kool-rose", name: "Amul Kool Rose", price: 30, subType: "Drinks", image: "/products/amul-kool-rose.webp", slot: "B-06" },
  { id: "dark-fantasy-shake", name: "Dark Fantasy Shake", price: 30, subType: "Drinks", image: "/products/dark-fantasy-shake.webp", slot: "B-07" },
  { id: "britannia-strawberry-shake", name: "Britannia Strawberry Shake", price: 40, subType: "Drinks", image: "/products/britannia-strawberry-shake.webp", slot: "B-08" },
  { id: "britannia-vanilla-shake", name: "Britannia Vanilla Shake", price: 40, subType: "Drinks", image: "/products/britannia-vanilla-shake.webp", slot: "B-09" },
  { id: "paper-boat-jamun", name: "Paper Boat Jamun", price: 25, subType: "Drinks", image: "/products/paper-boat-jamun.webp", slot: "B-10" },
  { id: "paper-boat-apple", name: "Paper Boat Apple", price: 25, subType: "Drinks", image: "/products/paper-boat-apple.webp", slot: "B-11" },
  { id: "paper-boat-orange", name: "Paper Boat Orange", price: 25, subType: "Drinks", image: "/products/paper-boat-orange.webp", slot: "B-12" },
  { id: "swing-coconut-water", name: "Swing Coconut Water", price: 20, subType: "Drinks", image: "/products/swing-coconut-water.webp", slot: "B-13" },
  { id: "swing-mixed-fruit", name: "Swing Mixed Fruit", price: 20, subType: "Drinks", image: "/products/swing-mixed-fruit.webp", slot: "B-14" },
  { id: "swing-guava", name: "Swing Guava", price: 20, subType: "Drinks", image: "/products/swing-guava.webp", slot: "B-15" },
  { id: "swing-pomegranate", name: "Swing Pomegranate", price: 20, subType: "Drinks", image: "/products/swing-pomegranate.webp", slot: "B-16" },
  { id: "jam-in-mix-fruit", name: "Jam-in Mix Fruit", price: 20, subType: "Drinks", image: "/products/jam-in-mix-fruit.webp", slot: "B-17" },
  { id: "sprite-mrp-20", name: "Sprite MRP 20", price: 20, subType: "Drinks", image: "/products/sprite-mrp-20.webp", slot: "B-18" },
  { id: "fanta-250ml", name: "Fanta 250ml", price: 20, subType: "Drinks", image: "/products/fanta-250ml.webp", slot: "B-19" },
  { id: "coca-cola-can", name: "Coca-Cola Can", price: 40, subType: "Drinks", image: "/products/coca-cola-can.webp", slot: "B-20" },
  { id: "kinley-water-500ml", name: "Kinley Water 500ml", price: 10, subType: "Drinks", image: "/products/kinley-water-500ml.webp", slot: "B-21" },

  // ── Chocolates & Biscuits (17) ──
  { id: "kitkat", name: "KitKat", price: 30, subType: "Sweets", image: "/products/kitkat.webp", slot: "C-01" },
  { id: "dairy-milk-chocolate", name: "Dairy Milk Chocolate", price: 45, subType: "Sweets", image: "/products/dairy-milk-chocolate.webp", slot: "C-02" },
  { id: "amul-fruit-nut", name: "Amul Fruit Nut", price: 45, subType: "Sweets", image: "/products/amul-fruit-nut.webp", slot: "C-03" },
  { id: "amul-velvet-chocolate", name: "Amul Velvet Chocolate", price: 30, subType: "Sweets", image: "/products/amul-velvet-chocolate.webp", slot: "C-04" },
  { id: "amul-smooth-chocolate", name: "Amul Smooth Chocolate", price: 20, subType: "Sweets", image: "/products/amul-smooth-chocolate.webp", slot: "C-05" },
  { id: "dark-fantasy-vanilla", name: "Dark Fantasy Vanilla", price: 30, subType: "Sweets", image: "/products/dark-fantasy-vanilla.webp", slot: "C-06" },
  { id: "lotte-chocopie", name: "Lotte Chocopie", price: 20, subType: "Sweets", image: "/products/lotte-chocopie.webp", slot: "C-07" },
  { id: "oreo-vanilla-biscuit", name: "Oreo Vanilla Biscuit", price: 30, subType: "Sweets", image: "/products/oreo-vanilla-biscuit.webp", slot: "C-08" },
  { id: "dukes-bourbon", name: "Dukes Bourbon", price: 25, subType: "Sweets", image: "/products/dukes-bourbon.webp", slot: "C-09" },
  { id: "dukes-strawberry-cream", name: "Dukes Strawberry Cream", price: 25, subType: "Sweets", image: "/products/dukes-strawberry-cream.webp", slot: "C-10" },
  { id: "fab-vanilla-cream", name: "Fab Vanilla Cream", price: 30, subType: "Sweets", image: "/products/fab-vanilla-cream.webp", slot: "C-11" },
  { id: "milk-bikis-cream", name: "Milk Bikis Cream", price: 30, subType: "Sweets", image: "/products/milk-bikis-cream.webp", slot: "C-12" },
  { id: "butter-cookies", name: "Butter Cookies", price: 20, subType: "Sweets", image: "/products/butter-cookies.webp", slot: "C-13" },
  { id: "snow-blueberry-pie", name: "Snow Blueberry Pie", price: 20, subType: "Sweets", image: "/products/snow-blueberry-pie.webp", slot: "C-14" },
  { id: "nut-grain-energy-bar", name: "Nut & Grain Energy Bar", price: 20, subType: "Sweets", image: "/products/nut-grain-energy-bar.webp", slot: "C-15" },
  { id: "choco-desire-energy-bar", name: "Choco Desire Energy Bar", price: 20, subType: "Sweets", image: "/products/choco-desire-energy-bar.webp", slot: "C-16" },
  { id: "amul-premium-butter", name: "Amul Premium Butter", price: 20, subType: "Sweets", image: "/products/amul-premium-butter.webp", slot: "C-17" },
];
