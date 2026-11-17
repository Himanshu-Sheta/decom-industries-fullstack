import path from 'path';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const prisma = new PrismaClient();

const SEED_PRODUCTS = [
  {
    slug: 'decgb-rainbow-pvc-saree-covers',
    sku: 'DCM-SAR-150G',
    name: 'DECGB Crystal PVC Saree Cover (Champagne Trim)',
    category: 'PVC Saree Covers',
    tagline: 'Ultra-clear 150-micron virgin PVC with ultrasonic seam welds & brass zipper.',
    description:
      'Engineered in Surat for luxury bridal and silk sarees. Protects delicate zari embroidery from humidity, dust, and snags while offering instant visual inventory inside boutiques and home wardrobes.',
    materialSpec: '150 Micron Virgin Crystal PVC + Satin Gold Piping',
    dimensions: '42 × 35 × 5 cm',
    moq: 10,
    priceINR: 145,
    samplePriceINR: 199,
    stock: 420,
    imageUrl: '/images/product-saree-organizer.jpg',
    isFeatured: true,
  },
  {
    slug: 'foldable-wardrobe-closet-cubes',
    sku: 'DCM-WRD-220C',
    name: 'Architectural Foldable Wardrobe Closet Cube',
    category: 'Wardrobe Cubes',
    tagline: 'Stackable non-woven linen organizer with crystal PVC viewing window.',
    description:
      'Rigid reinforced sideboards allow effortless stacking inside modern closets. Features dual smooth-glide zippers, breathable 100 GSM fabric walls, and a wide transparent front panel.',
    materialSpec: '100 GSM Breathable Non-Woven + Clear PVC Window',
    dimensions: '45 × 30 × 22 cm',
    moq: 5,
    priceINR: 340,
    samplePriceINR: 420,
    stock: 260,
    imageUrl: '/images/product-closet-storage.jpg',
    isFeatured: true,
  },
  {
    slug: 'luxury-travel-jewelry-vanity-kit',
    sku: 'DCM-JWL-110K',
    name: 'Multi-Pocket Bridal Travel Jewelry Kit',
    category: 'Jewelry Vanity Kits',
    tagline: '6 transparent zippered velvet-backed pouches for tangle-free travel.',
    description:
      'Designed to protect heirloom necklaces, bangles, and rings during destination weddings and retail display. Anti-tarnish soft velvet backing paired with heavy-gauge clear PVC pockets.',
    materialSpec: 'Plush Anti-Tarnish Velvet + 120 Micron Clear PVC',
    dimensions: '28 × 21 × 7 cm',
    moq: 5,
    priceINR: 480,
    samplePriceINR: 590,
    stock: 180,
    imageUrl: '/images/product-jewelry-kit.jpg',
    isFeatured: true,
  },
  {
    slug: 'transparent-multipurpose-storage-bags',
    sku: 'DCM-BAG-140M',
    name: 'Transparent Multipurpose Garment Storage Bag (Pack of 6)',
    category: 'Transparent Bags',
    tagline: 'Heavy-duty moisture-proof storage bags for ethnic wear, shirts & linens.',
    description:
      'Direct ex-factory value pack built with tear-resistant ultrasonic welded edges and rust-proof nylon runners. Ideal for textile wholesalers, boutiques, and seasonal wardrobe storage.',
    materialSpec: '140 Micron Virgin Transparent PVC',
    dimensions: '40 × 32 × 6 cm',
    moq: 5,
    priceINR: 499,
    samplePriceINR: 549,
    stock: 520,
    imageUrl: '/images/product-saree-organizer.jpg',
    isFeatured: false,
  },
  {
    slug: 'transparent-handbag-purse-covers',
    sku: 'DCM-HBG-180P',
    name: 'Dust-Free Transparent Handbag & Purse Shield',
    category: 'Handbag Covers',
    tagline: 'Structured clear protective cover with breathable top handle slot.',
    description:
      'Keeps designer leather handbags upright, dust-free, and clearly visible on closet shelves. Features reinforced gusset base and smooth top zipper access.',
    materialSpec: '180 Micron Rigid Clear Polymer + Non-Woven Gusset',
    dimensions: '38 × 28 × 16 cm',
    moq: 5,
    priceINR: 290,
    samplePriceINR: 350,
    stock: 195,
    imageUrl: '/images/product-closet-storage.jpg',
    isFeatured: false,
  },
  {
    slug: 'jumbo-waterproof-blanket-bag',
    sku: 'DCM-BLK-200J',
    name: 'Jumbo Waterproof Quilt & Blanket Storage Bag',
    category: 'Blanket Bags',
    tagline: 'Extra-large heavy-gauge comforter protector with reinforced carry handles.',
    description:
      'Built to store heavy king-size quilts, winter blankets, and bridal lehengas without tearing. Water-resistant sealed seams guard against monsoon dampness.',
    materialSpec: '200 Micron Heavy-Duty Waterproof PVC',
    dimensions: '60 × 45 × 28 cm',
    moq: 5,
    priceINR: 380,
    samplePriceINR: 450,
    stock: 310,
    imageUrl: '/images/product-closet-storage.jpg',
    isFeatured: true,
  },
  {
    slug: 'travel-cosmetic-vanity-pouch',
    sku: 'DCM-CSM-120V',
    name: 'Crystal Clear Travel Cosmetic & Vanity Pouch',
    category: 'Vanity Pouches',
    tagline: 'Spill-proof airport-friendly vanity organizer with wipe-clean lining.',
    description:
      'Compact, leak-resistant PVC cosmetic case finished with contrast piping and wide-mouth brass zipper for effortless packing.',
    materialSpec: '120 Micron Wipe-Clean PVC + Matte Piping',
    dimensions: '24 × 16 × 9 cm',
    moq: 10,
    priceINR: 185,
    samplePriceINR: 240,
    stock: 340,
    imageUrl: '/images/product-jewelry-kit.jpg',
    isFeatured: false,
  },
  {
    slug: 'bridal-trousseau-packaging-combo',
    sku: 'DCM-CMB-500B',
    name: 'Complete Bridal Trousseau Packaging Set (12 Pieces)',
    category: 'Value Combos',
    tagline: 'Curated wedding packing bundle: 8 Saree Covers, 2 Closet Cubes, 2 Jewelry Kits.',
    description:
      'Our flagship wedding and boutique gift set manufactured at our Surat cleanroom facility. Color-matched champagne gold accents across every piece.',
    materialSpec: 'Mixed Virgin PVC & 100 GSM Non-Woven Suite',
    dimensions: 'Assorted 12-Piece Master Pack',
    moq: 1,
    priceINR: 2499,
    samplePriceINR: 2499,
    stock: 65,
    imageUrl: '/images/product-saree-organizer.jpg',
    isFeatured: true,
  },
];

async function main() {
  console.log('🌱 Seeding Decom Industries PostgreSQL database...');

  // 1. Seed Primary Admin Account (Himanshu Sheta)
  const adminPasswordHash = await bcrypt.hash('Admin@1234', 12);
  const himanshuAdmin = await prisma.user.upsert({
    where: { email: 'himanshusheta2022@gmail.com' },
    update: {
      name: 'Himanshu Sheta',
      phone: '+91 9429279768',
      businessName: 'Decom Industries',
      city: 'Surat, Gujarat',
      role: 'ADMIN',
    },
    create: {
      name: 'Himanshu Sheta',
      email: 'himanshusheta2022@gmail.com',
      phone: '+91 9429279768',
      businessName: 'Decom Industries',
      city: 'Surat, Gujarat',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
    },
  });

  // 2. Seed Secondary Decom Admin Account
  const admin = await prisma.user.upsert({
    where: { email: 'admin@decomindustries.in' },
    update: {},
    create: {
      name: 'Dev Kukadiya (Admin)',
      email: 'admin@decomindustries.in',
      phone: '+91 98251 00001',
      businessName: 'Decom Industries Surat',
      city: 'Surat, Gujarat',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
    },
  });

  // 2. Seed Demo Customer Account
  const customerPasswordHash = await bcrypt.hash('Buyer@1234', 12);
  const customer = await prisma.user.upsert({
    where: { email: 'buyer@example.com' },
    update: {},
    create: {
      name: 'Rajesh Varma',
      email: 'buyer@example.com',
      phone: '+91 98251 12345',
      businessName: 'Varma Silk Collection',
      city: 'Ahmedabad, Gujarat',
      passwordHash: customerPasswordHash,
      role: 'USER',
    },
  });

  // 3. Seed 8 Decom Industries Products
  for (const product of SEED_PRODUCTS) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: product,
    });
  }

  console.log(`✅ Admin ready:    ${himanshuAdmin.email} / Admin@1234`);
  console.log(`✅ Admin ready:    ${admin.email} / Admin@1234`);
  console.log(`✅ Customer ready: ${customer.email} / Buyer@1234`);
  console.log(`✅ Products ready: ${SEED_PRODUCTS.length} Decom Industries SKUs seeded!\n`);
}

main()
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
