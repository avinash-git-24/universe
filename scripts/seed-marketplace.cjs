const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const SELLERS = [
  {
    id: '5c1967cb-96f7-4588-81f8-4db565f5530d',
    full_name: 'Rahul Verma',
    enrollment_number: '22BCSE042',
    department: 'Computer Science & Engineering',
    semester: '6th Semester',
    avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: '40fa9161-a47b-4891-8cf2-c88f288fcc0d',
    full_name: 'Priya Sharma',
    enrollment_number: '23BECE019',
    department: 'Electronics & Communication',
    semester: '4th Semester',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: '5f3533ae-edd7-4949-a7cc-406f83538489',
    full_name: 'Ankit Raj',
    enrollment_number: '22BME034',
    department: 'Mechanical Engineering',
    semester: '6th Semester',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'fcb058ac-d46b-4dfb-b14c-ee6eeb86540e',
    full_name: 'Sneha Roy',
    enrollment_number: '23BEE028',
    department: 'Electrical Engineering',
    semester: '4th Semester',
    avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'eb749ef7-51a2-4f2a-96b8-f09429071d20',
    full_name: 'Aman Gupta',
    enrollment_number: '21BCIV012',
    department: 'Civil Engineering',
    semester: '8th Semester',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
  },
];

const ITEMS = [
  {
    sellerIndex: 0,
    title: 'Casio fx-991EX ClassWiz Scientific Calculator',
    description: 'Original Casio fx-991EX ClassWiz with natural textbook display and 552 mathematical functions. Used for 1 semester in 1st year engineering mathematics. Battery and solar panel working 100%. Protective slide case included. Permitted in university semester exams.',
    category: 'electronics',
    condition: 'like_new',
    price: 850,
    original_price: 1595,
    negotiable: true,
    pickup_location: 'Ramanujan Hostel (Block B, Room 314)',
    imageUrl: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=800&q=80',
  },
  {
    sellerIndex: 2,
    title: 'Omega Mini Drafter & Engineering Graphics Set',
    description: 'Heavy-duty steel rod mini drafter with clamp, 360-degree protractor head, and drafting compass kit. Precision scaled ruler with zero deflection. Essential for 1st & 2nd sem Engineering Graphics & Design labs. Free sheet clips included.',
    category: 'study_materials',
    condition: 'good',
    price: 420,
    original_price: 890,
    negotiable: false,
    pickup_location: 'Mechanical Dept Drawing Hall / Hostel A',
    imageUrl: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=800&q=80',
  },
  {
    sellerIndex: 1,
    title: 'Prestige 1.5L Stainless Steel Electric Kettle',
    description: 'Prestige 1500W electric kettle with 1.5 litre capacity and 360-degree swivel base. Life saver in hostel for midnight Maggi, boiled eggs, hot water, and coffee during exam weeks. Automatic cut-off working flawlessly.',
    category: 'hostel',
    condition: 'like_new',
    price: 390,
    original_price: 995,
    negotiable: true,
    pickup_location: 'Sarojini Naidu Girls Hostel / Central Canteen',
    imageUrl: 'https://images.unsplash.com/photo-1594213114663-dd2934ff2497?auto=format&fit=crop&w=800&q=80',
  },
  {
    sellerIndex: 4,
    title: 'Hero Sprint 26T Mountain Bicycle (Single Speed)',
    description: 'Hero Sprint 26T MTB cycle in great running condition. Both tires and inner tubes replaced last month. Smooth front & rear V-brakes, comfortable seat cover, and bell. Comes with heavy-duty 4-digit combination cable lock. Ideal for quick commutes across campus.',
    category: 'sports',
    condition: 'good',
    price: 2400,
    original_price: 6500,
    negotiable: true,
    pickup_location: 'Main Gate Cycle Stand / Hostel 4 Parking',
    imageUrl: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80',
  },
  {
    sellerIndex: 0,
    title: 'Yonex Carbonex 8000 Plus Badminton Racket',
    description: 'Authentic Yonex Carbonex full-graphite shaft racket strung at 24 lbs with Yonex BG-65 string. Balanced weight for swift defense and powerful smashes. Only used occasionally on weekends at campus indoor badminton courts. Padded head cover included.',
    category: 'sports',
    condition: 'like_new',
    price: 520,
    original_price: 1450,
    negotiable: false,
    pickup_location: 'University Sports Complex Badminton Court',
    imageUrl: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80',
  },
  {
    sellerIndex: 3,
    title: '100% Pure Cotton Lab Coat / Apron (Size Medium)',
    description: 'Clean, washed and sanitized thick white cotton lab coat with 3 deep pockets and back belt. No chemical stains or tears. Required for first year Chemistry lab, Environmental Science, and Workshop practice.',
    category: 'clothing',
    condition: 'like_new',
    price: 180,
    original_price: 450,
    negotiable: false,
    pickup_location: 'Science Block Ground Floor / Chemistry Lab 2',
    imageUrl: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=800&q=80',
  },
  {
    sellerIndex: 2,
    title: 'Higher Engineering Mathematics by B.S. Grewal (44th Ed.)',
    description: 'The gold standard book for Engineering Mathematics across all semesters (M-1, M-2, M-3). Covers Calculus, Differential Equations, Linear Algebra, Vector Calculus, and Complex Analysis. Crisp pages, no missing sheets, formulas underlined neatly with pencil.',
    category: 'books',
    condition: 'good',
    price: 340,
    original_price: 975,
    negotiable: true,
    pickup_location: 'Central Library Ground Floor Lobby',
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
  },
  {
    sellerIndex: 1,
    title: 'Wipro Garnet 10W Rechargeable LED Study Lamp',
    description: 'Wipro LED desk lamp with touch controls and 3 light temperatures (Cool Daylight, Natural White, Warm White). 360-degree flexible gooseneck arm. Built-in lithium battery gives 4-5 hours continuous backup during hostel power cuts. Micro-USB charging cable included.',
    category: 'electronics',
    condition: 'like_new',
    price: 290,
    original_price: 799,
    negotiable: false,
    pickup_location: 'Hostel Block A, Reading Room',
    imageUrl: 'https://images.unsplash.com/photo-1534972195531-a756b1126f24?auto=format&fit=crop&w=800&q=80',
  },
  {
    sellerIndex: 4,
    title: 'Anchor 4-Socket Power Strip Spike Guard (2m Cable)',
    description: 'Anchor by Panasonic 4-way universal socket power extension with individual switches and LED indicators. Built-in surge protection for charging laptop, mobile, study lamp, and headphones simultaneously in hostel room sockets.',
    category: 'hostel',
    condition: 'good',
    price: 190,
    original_price: 480,
    negotiable: false,
    pickup_location: 'Hostel B Common Room',
    imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
  },
  {
    sellerIndex: 3,
    title: 'Foldable Bed Study Table with iPad & Cup Holder',
    description: 'Ergonomic multi-purpose wooden bed desk with sturdy non-slip metal legs. Features dedicated iPad/tablet holder slot and cup holder. Folds flat in 2 seconds to store under the hostel bed. Perfect for study sessions, laptop work, and hostel assignments.',
    category: 'furniture',
    condition: 'like_new',
    price: 310,
    original_price: 749,
    negotiable: true,
    pickup_location: 'Tagore Hostel / University Cafeteria',
    imageUrl: 'https://images.unsplash.com/photo-1588854337236-6889d631faa8?auto=format&fit=crop&w=800&q=80',
  },
];

async function seed() {
  console.log('🚀 Starting real database seeding...');

  // 1. Update Profiles
  console.log('👤 Updating real student profiles in public.profiles...');
  for (const seller of SELLERS) {
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: seller.full_name,
        enrollment_number: seller.enrollment_number,
        department: seller.department,
        semester: seller.semester,
        avatar_url: seller.avatar_url,
        account_status: 'active',
      })
      .eq('id', seller.id);

    if (error) {
      console.warn(`Failed to update profile ${seller.id}:`, error.message);
    } else {
      console.log(`✓ Updated profile: ${seller.full_name} (${seller.department})`);
    }
  }

  // 2. Remove any previously created active starter items to keep DB clean
  await supabase.from('resale_listings').delete().eq('status', 'active');

  // 3. Insert listings & Upload real images into Supabase Storage
  console.log('\n📦 Inserting 10 real listings and uploading images into Supabase storage...');

  for (let i = 0; i < ITEMS.length; i++) {
    const item = ITEMS[i];
    const seller = SELLERS[item.sellerIndex];

    // Create listing row
    const { data: listing, error: lError } = await supabase
      .from('resale_listings')
      .insert({
        seller_id: seller.id,
        title: item.title,
        description: item.description,
        category: item.category,
        condition: item.condition,
        price: item.price,
        original_price: item.original_price,
        negotiable: item.negotiable,
        pickup_location: item.pickup_location,
        status: 'active',
      })
      .select('id')
      .single();

    if (lError || !listing) {
      console.error(`Failed to insert listing ${item.title}:`, lError);
      continue;
    }

    console.log(`✓ [${i + 1}/10] Created listing: "${item.title}" (ID: ${listing.id})`);

    // Download high-quality image and upload to Supabase Storage
    try {
      const res = await fetch(item.imageUrl);
      if (res.ok) {
        const buffer = Buffer.from(await res.arrayBuffer());
        const storagePath = `${seller.id}/${listing.id}/image_0.jpg`;

        const { error: uploadError } = await supabase.storage
          .from('resale-listing-images')
          .upload(storagePath, buffer, {
            contentType: 'image/jpeg',
            upsert: true,
          });

        if (uploadError) {
          console.warn(`  Image upload error for ${listing.id}:`, uploadError.message);
        } else {
          // Insert image record in resale_listing_images
          const { error: imgRowError } = await supabase
            .from('resale_listing_images')
            .insert({
              listing_id: listing.id,
              storage_path: storagePath,
              display_order: 0,
            });

          if (imgRowError) {
            console.warn(`  Image row insert error:`, imgRowError.message);
          } else {
            console.log(`  📸 Image uploaded to storage: ${storagePath}`);
          }
        }
      }
    } catch (fetchErr) {
      console.warn(`  Could not download image for ${item.title}:`, fetchErr.message);
    }
  }

  console.log('\n🎉 Real database seeding finished successfully!');
}

seed().catch(console.error);
