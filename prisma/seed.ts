import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

const HARDWARE_PARTS = [
  // CPUs
  {
    name: "AMD Ryzen 9 5950X",
    manufacturer: "AMD",
    model: "RYZEN-9-5950X",
    sku: "CPU-AMD-5950X-001",
    quantity: 15,
    lowStockAt: 5,
    condition: "new",
    location: "Aisle 1, Shelf B",
    price: 549.99,
    specs: "16 cores, 32 threads, 3.4GHz base, 4.9GHz boost, AM4 socket",
    compatibility: "AMD AM4 motherboards, DDR4 memory",
    supplier: "AMD Direct",
    warrantyMonths: 36,
    notes: "Boxed processor with stock cooler",
    categoryName: "Processors",
  },
  {
    name: "Intel Core i9-13900K",
    manufacturer: "Intel",
    model: "I9-13900K",
    sku: "CPU-INT-13900K-001",
    quantity: 12,
    lowStockAt: 4,
    condition: "new",
    location: "Aisle 1, Shelf C",
    price: 589.99,
    specs:
      "24 cores (8P+16E), 32 threads, 3.0GHz base, 5.8GHz boost, LGA1700 socket",
    compatibility: "Intel 600/700 series motherboards, DDR4/DDR5",
    supplier: "Intel Corporation",
    warrantyMonths: 36,
    notes: "Boxed processor, no cooler included",
    categoryName: "Processors",
  },
  {
    name: "AMD Ryzen 7 5800X",
    manufacturer: "AMD",
    model: "RYZEN-7-5800X",
    sku: "CPU-AMD-5800X-001",
    quantity: 8,
    lowStockAt: 3,
    condition: "new",
    location: "Aisle 1, Shelf B",
    price: 349.99,
    specs: "8 cores, 16 threads, 3.8GHz base, 4.7GHz boost, AM4 socket",
    compatibility: "AMD AM4 motherboards, DDR4 memory",
    supplier: "AMD Direct",
    warrantyMonths: 36,
    categoryName: "Processors",
  },

  // Motherboards
  {
    name: "ASUS ROG Strix X570-E Gaming",
    manufacturer: "ASUS",
    model: "X570-E-GAMING",
    sku: "MB-ASUS-X570E-001",
    quantity: 20,
    lowStockAt: 6,
    condition: "new",
    location: "Aisle 2, Shelf A",
    price: 349.99,
    specs: "ATX, AMD X570, PCIe 4.0, WiFi 6, RGB lighting",
    compatibility: "AMD AM4 processors, DDR4 up to 128GB",
    supplier: "ASUS Distribution",
    warrantyMonths: 36,
    categoryName: "Motherboards",
  },
  {
    name: "MSI MAG B550 Tomahawk",
    manufacturer: "MSI",
    model: "B550-TOMAHAWK",
    sku: "MB-MSI-B550-001",
    quantity: 18,
    lowStockAt: 5,
    condition: "new",
    location: "Aisle 2, Shelf B",
    price: 179.99,
    specs: "ATX, AMD B550, PCIe 4.0, USB 3.2 Gen 2",
    compatibility: "AMD AM4 processors, DDR4 up to 128GB",
    supplier: "MSI Tech",
    warrantyMonths: 36,
    categoryName: "Motherboards",
  },
  {
    name: "Gigabyte Z790 AORUS Elite AX",
    manufacturer: "Gigabyte",
    model: "Z790-AORUS-ELITE",
    sku: "MB-GIG-Z790-001",
    quantity: 15,
    lowStockAt: 4,
    condition: "new",
    location: "Aisle 2, Shelf C",
    price: 279.99,
    specs: "ATX, Intel Z790, DDR5, WiFi 6E, PCIe 5.0",
    compatibility: "Intel 12th/13th gen processors, DDR5 memory",
    supplier: "Gigabyte Direct",
    warrantyMonths: 36,
    categoryName: "Motherboards",
  },

  // Graphics Cards
  {
    name: "NVIDIA GeForce RTX 4080",
    manufacturer: "NVIDIA",
    model: "RTX-4080-FE",
    sku: "GPU-NV-4080-001",
    quantity: 6,
    lowStockAt: 2,
    condition: "new",
    location: "Aisle 3, Shelf A",
    price: 1199.99,
    specs: "16GB GDDR6X, 9728 CUDA cores, PCIe 4.0, DLSS 3",
    compatibility: "PCIe 4.0 x16, 750W+ PSU recommended",
    supplier: "NVIDIA Official",
    warrantyMonths: 36,
    notes: "Founders Edition",
    categoryName: "Graphics Cards",
  },
  {
    name: "ASUS ROG Strix RTX 4070 Ti",
    manufacturer: "ASUS",
    model: "RTX-4070TI-ROG",
    sku: "GPU-ASUS-4070TI-001",
    quantity: 10,
    lowStockAt: 3,
    condition: "new",
    location: "Aisle 3, Shelf B",
    price: 899.99,
    specs: "12GB GDDR6X, 7680 CUDA cores, Triple fan cooling, RGB",
    compatibility: "PCIe 4.0 x16, 750W+ PSU recommended",
    supplier: "ASUS Distribution",
    warrantyMonths: 36,
    categoryName: "Graphics Cards",
  },
  {
    name: "AMD Radeon RX 7900 XTX",
    manufacturer: "AMD",
    model: "RX-7900-XTX",
    sku: "GPU-AMD-7900XTX-001",
    quantity: 8,
    lowStockAt: 2,
    condition: "new",
    location: "Aisle 3, Shelf C",
    price: 999.99,
    specs: "24GB GDDR6, 6144 stream processors, PCIe 4.0, Ray tracing",
    compatibility: "PCIe 4.0 x16, 800W+ PSU recommended",
    supplier: "AMD Direct",
    warrantyMonths: 36,
    categoryName: "Graphics Cards",
  },

  // Memory (RAM)
  {
    name: "Corsair Vengeance LPX 32GB (2x16GB) DDR4 3600MHz",
    manufacturer: "Corsair",
    model: "CMK32GX4M2D3600C18",
    sku: "RAM-COR-32GB-DDR4-001",
    quantity: 45,
    lowStockAt: 10,
    condition: "new",
    location: "Aisle 4, Shelf A",
    price: 119.99,
    specs: "DDR4 3600MHz, CL18, 1.35V, Dual channel kit",
    compatibility: "DDR4 compatible motherboards",
    supplier: "Corsair Memory",
    warrantyMonths: 60,
    categoryName: "Memory",
  },
  {
    name: "G.Skill Trident Z5 32GB (2x16GB) DDR5 6000MHz",
    manufacturer: "G.Skill",
    model: "F5-6000J3636F16GX2-TZ5RK",
    sku: "RAM-GSK-32GB-DDR5-001",
    quantity: 35,
    lowStockAt: 8,
    condition: "new",
    location: "Aisle 4, Shelf B",
    price: 179.99,
    specs: "DDR5 6000MHz, CL36, 1.35V, RGB lighting",
    compatibility: "DDR5 compatible motherboards (Intel 12th/13th gen)",
    supplier: "G.Skill International",
    warrantyMonths: 60,
    categoryName: "Memory",
  },
  {
    name: "Kingston FURY Beast 16GB (2x8GB) DDR4 3200MHz",
    manufacturer: "Kingston",
    model: "KF432C16BBK2/16",
    sku: "RAM-KNG-16GB-DDR4-001",
    quantity: 60,
    lowStockAt: 15,
    condition: "new",
    location: "Aisle 4, Shelf C",
    price: 69.99,
    specs: "DDR4 3200MHz, CL16, 1.35V, Dual channel kit",
    compatibility: "DDR4 compatible motherboards",
    supplier: "Kingston Technology",
    warrantyMonths: 60,
    categoryName: "Memory",
  },

  // Storage - SSDs
  {
    name: "Samsung 990 PRO 2TB NVMe M.2 SSD",
    manufacturer: "Samsung",
    model: "MZ-V9P2T0BW",
    sku: "SSD-SAM-990-2TB-001",
    quantity: 25,
    lowStockAt: 6,
    condition: "new",
    location: "Aisle 5, Shelf A",
    price: 199.99,
    specs: "PCIe 4.0 NVMe, 7450MB/s read, 6900MB/s write, 2TB capacity",
    compatibility: "M.2 PCIe 4.0 slot",
    supplier: "Samsung Electronics",
    warrantyMonths: 60,
    categoryName: "Storage",
  },
  {
    name: "WD Black SN850X 1TB NVMe M.2 SSD",
    manufacturer: "Western Digital",
    model: "WDS100T2X0E",
    sku: "SSD-WD-SN850X-1TB-001",
    quantity: 40,
    lowStockAt: 10,
    condition: "new",
    location: "Aisle 5, Shelf B",
    price: 99.99,
    specs: "PCIe 4.0 NVMe, 7300MB/s read, 6300MB/s write, 1TB capacity",
    compatibility: "M.2 PCIe 4.0 slot",
    supplier: "Western Digital",
    warrantyMonths: 60,
    categoryName: "Storage",
  },
  {
    name: "Crucial MX4 500GB SATA SSD",
    manufacturer: "Crucial",
    model: "CT500MX4SSD1",
    sku: "SSD-CRU-MX4-500GB-001",
    quantity: 55,
    lowStockAt: 15,
    condition: "new",
    location: "Aisle 5, Shelf C",
    price: 49.99,
    specs: "SATA 6Gb/s, 560MB/s read, 510MB/s write, 500GB capacity",
    compatibility: "SATA 6Gb/s port",
    supplier: "Crucial Memory",
    warrantyMonths: 60,
    categoryName: "Storage",
  },

  // Power Supplies
  {
    name: "Corsair RM850x 850W 80+ Gold Modular PSU",
    manufacturer: "Corsair",
    model: "CP-9020180-NA",
    sku: "PSU-COR-RM850X-001",
    quantity: 30,
    lowStockAt: 8,
    condition: "new",
    location: "Aisle 6, Shelf A",
    price: 149.99,
    specs: "850W, 80+ Gold certified, Fully modular, 140mm fan",
    compatibility: "ATX standard, Multiple PCIe connectors",
    supplier: "Corsair Components",
    warrantyMonths: 120,
    notes: "10-year warranty",
    categoryName: "Power Supplies",
  },
  {
    name: "Seasonic Focus GX-750 750W 80+ Gold Modular",
    manufacturer: "Seasonic",
    model: "SSR-750FX",
    sku: "PSU-SEA-GX750-001",
    quantity: 28,
    lowStockAt: 7,
    condition: "new",
    location: "Aisle 6, Shelf B",
    price: 129.99,
    specs: "750W, 80+ Gold certified, Fully modular, 120mm fan",
    compatibility: "ATX standard, Multiple PCIe connectors",
    supplier: "Seasonic Electronics",
    warrantyMonths: 120,
    categoryName: "Power Supplies",
  },
  {
    name: "EVGA SuperNOVA 1000W G6 80+ Gold Modular",
    manufacturer: "EVGA",
    model: "220-G6-1000-X1",
    sku: "PSU-EVGA-G6-1000W-001",
    quantity: 15,
    lowStockAt: 4,
    condition: "new",
    location: "Aisle 6, Shelf C",
    price: 219.99,
    specs: "1000W, 80+ Gold certified, Fully modular, 135mm fan",
    compatibility: "ATX standard, Multiple PCIe connectors",
    supplier: "EVGA Corporation",
    warrantyMonths: 120,
    categoryName: "Power Supplies",
  },

  // Cooling
  {
    name: "Noctua NH-D15 Chromax Black CPU Cooler",
    manufacturer: "Noctua",
    model: "NH-D15-CHROMAX",
    sku: "COOL-NOC-D15-001",
    quantity: 22,
    lowStockAt: 6,
    condition: "new",
    location: "Aisle 7, Shelf A",
    price: 109.99,
    specs: "Dual tower, Dual 140mm fans, AM4/AM5/LGA1700 compatible",
    compatibility: "Intel LGA1700/1200/115x, AMD AM4/AM5",
    supplier: "Noctua Cooling Solutions",
    warrantyMonths: 72,
    notes: "Includes thermal paste",
    categoryName: "Cooling",
  },
  {
    name: "Corsair iCUE H150i Elite Capellix 360mm AIO",
    manufacturer: "Corsair",
    model: "CW-9060051-WW",
    sku: "COOL-COR-H150I-001",
    quantity: 18,
    lowStockAt: 5,
    condition: "new",
    location: "Aisle 7, Shelf B",
    price: 189.99,
    specs: "360mm radiator, 3x 120mm RGB fans, Pump RGB, AM4/AM5/LGA1700",
    compatibility: "Intel LGA1700/1200/115x, AMD AM4/AM5",
    supplier: "Corsair Components",
    warrantyMonths: 60,
    categoryName: "Cooling",
  },
  {
    name: "Arctic Freezer 34 eSports DUO CPU Cooler",
    manufacturer: "Arctic",
    model: "ACFREEZER34DUO",
    sku: "COOL-ARC-34DUO-001",
    quantity: 35,
    lowStockAt: 10,
    condition: "new",
    location: "Aisle 7, Shelf C",
    price: 49.99,
    specs: "Tower cooler, Dual 120mm fans, AM4/LGA1700 compatible",
    compatibility: "Intel LGA1700/1200/115x, AMD AM4",
    supplier: "Arctic Cooling",
    warrantyMonths: 60,
    categoryName: "Cooling",
  },

  // Cases
  {
    name: "Fractal Design Meshify 2 Compact TG Dark",
    manufacturer: "Fractal Design",
    model: "FD-C-MES2C-02",
    sku: "CASE-FRA-MESHIFY2-001",
    quantity: 20,
    lowStockAt: 5,
    condition: "new",
    location: "Aisle 8, Shelf A",
    price: 129.99,
    specs: "Mid-tower, Tempered glass side panel, 3x 120mm fans included",
    compatibility: "ATX, Micro-ATX, Mini-ITX motherboards",
    supplier: "Fractal Design",
    warrantyMonths: 24,
    categoryName: "Cases",
  },
  {
    name: "Lian Li Lancool 216 RGB Mid Tower",
    manufacturer: "Lian Li",
    model: "LANCOOL-216-RGB",
    sku: "CASE-LIL-216-001",
    quantity: 16,
    lowStockAt: 4,
    condition: "new",
    location: "Aisle 8, Shelf B",
    price: 109.99,
    specs: "Mid-tower, 2x 160mm front fans, 1x 140mm rear fan, RGB",
    compatibility: "ATX, Micro-ATX, Mini-ITX motherboards",
    supplier: "Lian Li Industrial",
    warrantyMonths: 24,
    categoryName: "Cases",
  },
  {
    name: "NZXT H7 Flow Mid Tower Case",
    manufacturer: "NZXT",
    model: "CA-H7FW-B1",
    sku: "CASE-NZXT-H7-001",
    quantity: 18,
    lowStockAt: 5,
    condition: "new",
    location: "Aisle 8, Shelf C",
    price: 149.99,
    specs: "Mid-tower, Tempered glass side panel, Mesh front panel",
    compatibility: "ATX, Micro-ATX, Mini-ITX motherboards",
    supplier: "NZXT",
    warrantyMonths: 24,
    categoryName: "Cases",
  },
];

async function main() {
  console.log("🌱 Starting seed process...");

  // Find or create user
  const userEmail = "velosinventory@gmail.com";
  const user = await prisma.user.findUnique({
    where: { email: userEmail },
  });

  if (!user) {
    console.log(`❌ User with email ${userEmail} not found.`);
    console.log("Please create the user first or ensure the email is correct.");
    return;
  }

  console.log(`✅ Found user: ${user.name} (${user.email})`);

  // Create categories
  const categoryNames = [
    "Processors",
    "Motherboards",
    "Graphics Cards",
    "Memory",
    "Storage",
    "Power Supplies",
    "Cooling",
    "Cases",
  ];

  const categories = new Map<string, string>();

  for (const categoryName of categoryNames) {
    // Check if category already exists
    let category = await prisma.category.findFirst({
      where: {
        userId: user.id,
        name: categoryName,
      },
    });

    if (!category) {
      category = await prisma.category.create({
        data: {
          userId: user.id,
          name: categoryName,
        },
      });
      console.log(`✅ Created category: ${categoryName}`);
    } else {
      console.log(`ℹ️  Category already exists: ${categoryName}`);
    }

    categories.set(categoryName, category.id);
  }

  // Create products
  let createdCount = 0;
  let skippedCount = 0;

  for (const part of HARDWARE_PARTS) {
    // Check if product already exists for this user
    // First check by SKU if it exists globally
    let productSku = part.sku || null;
    const existingProduct = productSku
      ? await prisma.product.findUnique({
          where: { sku: productSku },
        })
      : null;

    // If product exists with this SKU, check if it belongs to this user
    if (existingProduct) {
      if (existingProduct.userId === user.id) {
        console.log(`⏭️  Skipping ${part.name} (already exists for this user)`);
        skippedCount++;
        continue;
      } else {
        // SKU exists but belongs to another user, create with modified SKU
        console.log(
          `⚠️  SKU ${productSku} exists for another user, creating with modified SKU`
        );
        productSku = `${productSku}-${user.id.slice(0, 8)}`;
      }
    }

    // Also check if product with same name, manufacturer, and model exists for this user
    const duplicateCheck = await prisma.product.findFirst({
      where: {
        userId: user.id,
        name: part.name,
        manufacturer: part.manufacturer,
        model: part.model || null,
      },
    });

    if (duplicateCheck) {
      console.log(`⏭️  Skipping ${part.name} (duplicate exists for this user)`);
      skippedCount++;
      continue;
    }

    const categoryId = categories.get(part.categoryName);

    await prisma.product.create({
      data: {
        userId: user.id,
        categoryId: categoryId || null,
        name: part.name,
        manufacturer: part.manufacturer,
        model: part.model || null,
        sku: productSku,
        quantity: part.quantity,
        lowStockAt: part.lowStockAt || null,
        condition: part.condition,
        location: part.location || null,
        price: part.price,
        specs: part.specs || null,
        compatibility: part.compatibility || null,
        supplier: part.supplier || null,
        warrantyMonths: part.warrantyMonths || null,
        notes: part.notes || null,
      },
    });

    createdCount++;
    console.log(`✅ Created product: ${part.name}`);
  }

  console.log("\n📊 Seed Summary:");
  console.log(`   ✅ Created: ${createdCount} products`);
  console.log(`   ⏭️  Skipped: ${skippedCount} products (already exist)`);
  console.log(`   📁 Categories: ${categories.size}`);
  console.log("\n🎉 Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
