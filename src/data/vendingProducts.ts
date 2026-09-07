export interface VendingProduct {
  id: string;
  name: string;
  price: number;
  subType: "Drinks" | "Snacks" | "Sweets";
  image: string;
}

export const VENDING_PRODUCTS: VendingProduct[] = [
  // ── Chips & Wafers (19) ──
  { id: "crunchex-chili-tadka", name: "CrunchEx Chili Tadka", price: 20, subType: "Snacks", image: "/products/crunchex-chili-tadka.webp" },
  { id: "kurkure-masala-munch", name: "Kurkure Masala Munch", price: 20, subType: "Snacks", image: "/products/kurkure-masala-munch.webp" },
  { id: "chili-chataka-kurkure", name: "Chili Chataka Kurkure", price: 20, subType: "Snacks", image: "/products/chili-chataka-kurkure.webp" },
  { id: "lays-magic-masala", name: "Lays Magic Masala", price: 20, subType: "Snacks", image: "/products/lays-magic-masala.webp" },
  { id: "lays-sizzling-hot", name: "Lays Sizzling Hot", price: 20, subType: "Snacks", image: "/products/lays-sizzling-hot.webp" },
  { id: "lays-west-indies-sweet-chilli", name: "Lays West Indies Sweet Chilli", price: 20, subType: "Snacks", image: "/products/lays-west-indies-sweet-chilli.webp" },
  { id: "puffcorn-lays", name: "Puffcorn Lays", price: 20, subType: "Snacks", image: "/products/puffcorn-lays.webp" },
  { id: "balaji-masala-wafers", name: "Balaji Masala Wafers", price: 20, subType: "Snacks", image: "/products/balaji-masala-wafers.webp" },
  { id: "balaji-salted-wafers", name: "Balaji Salted Wafers", price: 20, subType: "Snacks", image: "/products/balaji-salted-wafers.webp" },
  { id: "act-butter-popcorn", name: "ACT Butter Popcorn", price: 20, subType: "Snacks", image: "/products/act-butter-popcorn.webp" },
  { id: "gopal-masala-sev-murmura", name: "Gopal Masala Sev Murmura", price: 15, subType: "Snacks", image: "/products/gopal-masala-sev-murmura.webp" },
  { id: "gopal-tikha-mitha-mix", name: "Gopal Tikha Mitha Mix", price: 15, subType: "Snacks", image: "/products/gopal-tikha-mitha-mix.webp" },
  { id: "gopal-farali-chevdo", name: "Gopal Farali Chevdo", price: 20, subType: "Snacks", image: "/products/gopal-farali-chevdo.webp" },
  { id: "gopal-moong-dal", name: "Gopal Moong Dal", price: 15, subType: "Snacks", image: "/products/gopal-moong-dal.webp" },
  { id: "gopal-mexican-chilli", name: "Gopal Mexican Chilli", price: 20, subType: "Snacks", image: "/products/gopal-mexican-chilli.webp" },
  { id: "bingo-mad-angles-achaari", name: "Bingo Mad Angles Achaari", price: 20, subType: "Snacks", image: "/products/bingo-mad-angles-achaari.webp" },
  { id: "roaven-salted-peanut", name: "Roaven Salted Peanut", price: 30, subType: "Snacks", image: "/products/roaven-salted-peanut.webp" },
  { id: "maggi-2-min", name: "Maggi 2-Min", price: 20, subType: "Snacks", image: "/products/maggi-2-min.webp" },
  { id: "doritos-cheese", name: "Doritos Cheese", price: 30, subType: "Snacks", image: "/products/doritos-cheese.webp" },

  // ── Drinks & Shakes (21) ──
  { id: "frooti-400ml", name: "Frooti 400ml", price: 30, subType: "Drinks", image: "/products/frooti-400ml.webp" },
  { id: "appy-fizz-250ml", name: "Appy Fizz 250ml", price: 20, subType: "Drinks", image: "/products/appy-fizz-250ml.webp" },
  { id: "amul-kool-cafe", name: "Amul Kool Cafe", price: 40, subType: "Drinks", image: "/products/amul-kool-cafe.webp" },
  { id: "amul-kool-dark-chocolate", name: "Amul Kool Dark Chocolate", price: 25, subType: "Drinks", image: "/products/amul-kool-dark-chocolate.webp" },
  { id: "amul-kool-koko", name: "Amul Kool Koko", price: 40, subType: "Drinks", image: "/products/amul-kool-koko.webp" },
  { id: "amul-kool-rose", name: "Amul Kool Rose", price: 30, subType: "Drinks", image: "/products/amul-kool-rose.webp" },
  { id: "dark-fantasy-shake", name: "Dark Fantasy Shake", price: 30, subType: "Drinks", image: "/products/dark-fantasy-shake.webp" },
  { id: "britannia-strawberry-shake", name: "Britannia Strawberry Shake", price: 40, subType: "Drinks", image: "/products/britannia-strawberry-shake.webp" },
  { id: "britannia-vanilla-shake", name: "Britannia Vanilla Shake", price: 40, subType: "Drinks", image: "/products/britannia-vanilla-shake.webp" },
  { id: "paper-boat-jamun", name: "Paper Boat Jamun", price: 25, subType: "Drinks", image: "/products/paper-boat-jamun.webp" },
  { id: "paper-boat-apple", name: "Paper Boat Apple", price: 25, subType: "Drinks", image: "/products/paper-boat-apple.webp" },
  { id: "paper-boat-orange", name: "Paper Boat Orange", price: 25, subType: "Drinks", image: "/products/paper-boat-orange.webp" },
  { id: "swing-coconut-water", name: "Swing Coconut Water", price: 20, subType: "Drinks", image: "/products/swing-coconut-water.webp" },
  { id: "swing-mixed-fruit", name: "Swing Mixed Fruit", price: 20, subType: "Drinks", image: "/products/swing-mixed-fruit.webp" },
  { id: "swing-guava", name: "Swing Guava", price: 20, subType: "Drinks", image: "/products/swing-guava.webp" },
  { id: "swing-pomegranate", name: "Swing Pomegranate", price: 20, subType: "Drinks", image: "/products/swing-pomegranate.webp" },
  { id: "jam-in-mix-fruit", name: "Jam-in Mix Fruit", price: 20, subType: "Drinks", image: "/products/jam-in-mix-fruit.webp" },
  { id: "sprite-mrp-20", name: "Sprite MRP 20", price: 20, subType: "Drinks", image: "/products/sprite-mrp-20.webp" },
  { id: "fanta-250ml", name: "Fanta 250ml", price: 20, subType: "Drinks", image: "/products/fanta-250ml.webp" },
  { id: "coca-cola-can", name: "Coca-Cola Can", price: 40, subType: "Drinks", image: "/products/coca-cola-can.webp" },
  { id: "kinley-water-500ml", name: "Kinley Water 500ml", price: 10, subType: "Drinks", image: "/products/kinley-water-500ml.webp" },

  // ── Chocolates & Biscuits (17) ──
  { id: "kitkat", name: "KitKat", price: 30, subType: "Sweets", image: "/products/kitkat.webp" },
  { id: "dairy-milk-chocolate", name: "Dairy Milk Chocolate", price: 45, subType: "Sweets", image: "/products/dairy-milk-chocolate.webp" },
  { id: "amul-fruit-nut", name: "Amul Fruit Nut", price: 45, subType: "Sweets", image: "/products/amul-fruit-nut.webp" },
  { id: "amul-velvet-chocolate", name: "Amul Velvet Chocolate", price: 30, subType: "Sweets", image: "/products/amul-velvet-chocolate.webp" },
  { id: "amul-smooth-chocolate", name: "Amul Smooth Chocolate", price: 20, subType: "Sweets", image: "/products/amul-smooth-chocolate.webp" },
  { id: "dark-fantasy-vanilla", name: "Dark Fantasy Vanilla", price: 30, subType: "Sweets", image: "/products/dark-fantasy-vanilla.webp" },
  { id: "lotte-chocopie", name: "Lotte Chocopie", price: 20, subType: "Sweets", image: "/products/lotte-chocopie.webp" },
  { id: "oreo-vanilla-biscuit", name: "Oreo Vanilla Biscuit", price: 30, subType: "Sweets", image: "/products/oreo-vanilla-biscuit.webp" },
  { id: "dukes-bourbon", name: "Dukes Bourbon", price: 25, subType: "Sweets", image: "/products/dukes-bourbon.webp" },
  { id: "dukes-strawberry-cream", name: "Dukes Strawberry Cream", price: 25, subType: "Sweets", image: "/products/dukes-strawberry-cream.webp" },
  { id: "fab-vanilla-cream", name: "Fab Vanilla Cream", price: 30, subType: "Sweets", image: "/products/fab-vanilla-cream.webp" },
  { id: "milk-bikis-cream", name: "Milk Bikis Cream", price: 30, subType: "Sweets", image: "/products/milk-bikis-cream.webp" },
  { id: "butter-cookies", name: "Butter Cookies", price: 20, subType: "Sweets", image: "/products/butter-cookies.webp" },
  { id: "snow-blueberry-pie", name: "Snow Blueberry Pie", price: 20, subType: "Sweets", image: "/products/snow-blueberry-pie.webp" },
  { id: "nut-grain-energy-bar", name: "Nut & Grain Energy Bar", price: 20, subType: "Sweets", image: "/products/nut-grain-energy-bar.webp" },
  { id: "choco-desire-energy-bar", name: "Choco Desire Energy Bar", price: 20, subType: "Sweets", image: "/products/choco-desire-energy-bar.webp" },
  { id: "amul-premium-butter", name: "Amul Premium Butter", price: 20, subType: "Sweets", image: "/products/amul-premium-butter.webp" },
];
