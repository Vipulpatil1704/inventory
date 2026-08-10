import connectDB from '../config/db.js';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import InventoryTransaction from '../models/InventoryTransaction.js';

async function seed() {
  await connectDB();

  console.log('Clearing existing data...');
  await Promise.all([
    InventoryTransaction.deleteMany({}),
    Product.deleteMany({}),
    Category.deleteMany({}),
    User.deleteMany({}),
  ]);

  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@inventory.local',
    password: 'Admin123!',
    role: 'admin',
  });

  const staff = await User.create({
    name: 'Staff User',
    email: 'staff@inventory.local',
    password: 'Staff123!',
    role: 'staff',
  });

  const categories = await Category.insertMany([
    { name: 'Electronics', description: 'Electronic devices and accessories', createdBy: admin._id },
    { name: 'Office Supplies', description: 'Stationery and office essentials', createdBy: admin._id },
    { name: 'Furniture', description: 'Desks, chairs, and storage', createdBy: staff._id },
    { name: 'Networking', description: 'Network hardware and cables', createdBy: admin._id },
  ]);

  const [electronics, office, furniture, networking] = categories;

  const productsData = [
    {
      name: 'Wireless Mouse',
      sku: 'ELE-MOUSE-001',
      category: electronics._id,
      description: 'Ergonomic wireless mouse with USB receiver',
      quantity: 45,
      unitPrice: 24.99,
      supplierName: 'TechSupply Co',
      createdBy: admin._id,
    },
    {
      name: 'Mechanical Keyboard',
      sku: 'ELE-KEY-002',
      category: electronics._id,
      description: 'RGB mechanical keyboard',
      quantity: 8,
      unitPrice: 89.99,
      supplierName: 'TechSupply Co',
      createdBy: admin._id,
    },
    {
      name: 'USB-C Hub',
      sku: 'ELE-HUB-003',
      category: electronics._id,
      description: '7-in-1 USB-C hub',
      quantity: 0,
      unitPrice: 49.5,
      supplierName: 'GadgetWorld',
      createdBy: staff._id,
    },
    {
      name: 'A4 Copier Paper',
      sku: 'OFF-PAPER-001',
      category: office._id,
      description: '500-sheet ream of A4 paper',
      quantity: 120,
      unitPrice: 6.5,
      supplierName: 'OfficeMart',
      createdBy: staff._id,
    },
    {
      name: 'Ballpoint Pens (Box)',
      sku: 'OFF-PEN-002',
      category: office._id,
      description: 'Box of 50 blue ballpoint pens',
      quantity: 5,
      unitPrice: 12.0,
      supplierName: 'OfficeMart',
      createdBy: admin._id,
    },
    {
      name: 'Standing Desk',
      sku: 'FUR-DESK-001',
      category: furniture._id,
      description: 'Electric height-adjustable standing desk',
      quantity: 12,
      unitPrice: 399.0,
      supplierName: 'FurniPro',
      createdBy: admin._id,
    },
    {
      name: 'Ergonomic Chair',
      sku: 'FUR-CHAIR-002',
      category: furniture._id,
      description: 'Mesh back office chair',
      quantity: 3,
      unitPrice: 229.99,
      supplierName: 'FurniPro',
      createdBy: staff._id,
    },
    {
      name: 'Cat6 Ethernet Cable 5m',
      sku: 'NET-CABLE-001',
      category: networking._id,
      description: 'Shielded Cat6 patch cable',
      quantity: 80,
      unitPrice: 9.99,
      supplierName: 'NetGear Supplies',
      createdBy: admin._id,
    },
    {
      name: 'Gigabit Switch 8-Port',
      sku: 'NET-SW-002',
      category: networking._id,
      description: 'Unmanaged 8-port gigabit switch',
      quantity: 0,
      unitPrice: 34.99,
      supplierName: 'NetGear Supplies',
      createdBy: staff._id,
    },
  ];

  const products = await Product.insertMany(productsData);

  const transactions = products
    .filter((p) => p.quantity > 0)
    .map((p) => ({
      product: p._id,
      user: p.createdBy,
      type: 'increase',
      quantityChange: p.quantity,
      previousQty: 0,
      newQty: p.quantity,
      note: 'Initial seed stock',
    }));

  if (transactions.length) {
    await InventoryTransaction.insertMany(transactions);
  }

  console.log('Seed completed successfully');
  console.log('Demo accounts:');
  console.log('  admin@inventory.local / Admin123!');
  console.log('  staff@inventory.local / Staff123!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
