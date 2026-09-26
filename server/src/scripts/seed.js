/**
 * Rich demo seed for StockSense.
 *   npm run seed            → refuses if users already exist
 *   npm run seed -- --reset → wipes everything first, then seeds
 *
 * Creates:
 *   • 2 warehouses  (Main + Secondary)
 *   • 8 locations   (spread across both warehouses)
 *   • 3 categories  (Furniture, Electronics, Packaging)
 *   • 15 products   (various stock levels: in-stock, low, out-of-stock)
 *   • 6 operations  (receipts, deliveries, transfers – in various states)
 *   • 1 admin user
 */
import mongoose from 'mongoose';
import env from '../config/env.js';
import { connectDB, disconnectDB } from '../config/db.js';
import Category from '../models/Category.js';
import User from '../models/User.js';
import * as operationService from '../services/operation.service.js';
import * as productService from '../services/product.service.js';
import * as warehouseService from '../services/warehouse.service.js';

/* ── Credentials ─────────────────────────────────────────────── */
const DEMO_USER = {
  name: 'Admin User',
  loginId: 'admin01',
  email: 'admin@stocksense.local',
  password: 'Admin@12345',
};

/* ── Helpers ─────────────────────────────────────────────────── */
const p = (name, sku, cat, uom, cost, reorder, qty, locationId) =>
  productService.create(
    {
      name,
      sku,
      category: cat._id,
      uom,
      unitCost: cost,
      reorderLevel: reorder,
      reorderQty: reorder * 2,
      ...(qty > 0 && { initialStock: { quantity: qty, location: locationId } }),
    },
    user
  );

let user; // set in main()

/* ── Main ────────────────────────────────────────────────────── */
async function connectWithRetry(uri, retries = 5) {
  for (let i = 1; i <= retries; i++) {
    try {
      await connectDB(uri);
      return;
    } catch (err) {
      console.warn(`[seed] Connection attempt ${i}/${retries} failed: ${err.message}`);
      if (i === retries) throw err;
      await new Promise((r) => setTimeout(r, 3000 * i));
    }
  }
}

async function main() {
  await connectWithRetry(env.mongodbUri);
  const reset = process.argv.includes('--reset');

  if (reset) {
    for (const model of Object.values(mongoose.models)) await model.deleteMany({});
    console.log('[seed] Existing data wiped.');
  } else if (await User.exists({})) {
    console.log('[seed] DB already has users. Run: npm run seed -- --reset');
    return;
  }

  await Promise.all(Object.values(mongoose.models).map((m) => m.init()));

  /* ── User ──────────────────────────────────────────────────── */
  user = await User.create(DEMO_USER);
  console.log('[seed] User created.');

  /* ── Warehouses + Locations ────────────────────────────────── */
  const wh1 = await warehouseService.createWarehouse({
    name: 'Main Warehouse',
    code: 'WH',
    address: '12 Industrial Estate, Pune, Maharashtra 411001',
  });
  const wh2 = await warehouseService.createWarehouse({
    name: 'Secondary Warehouse',
    code: 'WH2',
    address: '7 Logistics Park, Mumbai, Maharashtra 400001',
  });

  // Main warehouse locations
  const mainStock = wh1.locations.find((l) => l.isDefault); // WH/Stock (default)
  const rackA     = await warehouseService.createLocation({ name: 'Rack A',            code: 'RACK-A',  warehouse: wh1._id });
  const rackB     = await warehouseService.createLocation({ name: 'Rack B',            code: 'RACK-B',  warehouse: wh1._id });
  const prodFloor = await warehouseService.createLocation({ name: 'Production Floor',  code: 'PROD',    warehouse: wh1._id });
  const dispatch  = await warehouseService.createLocation({ name: 'Dispatch Bay',      code: 'DISP',    warehouse: wh1._id });

  // Secondary warehouse locations
  const sec2Stock = wh2.locations.find((l) => l.isDefault); // WH2/Stock (default)
  const sec2Rack  = await warehouseService.createLocation({ name: 'Cold Storage',      code: 'COLD',    warehouse: wh2._id });
  const sec2Bulk  = await warehouseService.createLocation({ name: 'Bulk Storage',      code: 'BULK',    warehouse: wh2._id });

  console.log('[seed] Warehouses & locations created.');

  /* ── Categories ─────────────────────────────────────────────── */
  const [furniture, electronics, packaging, rawMat, office] = await Category.create([
    { name: 'Furniture',     description: 'Tables, chairs, shelves and other furnishings' },
    { name: 'Electronics',   description: 'Computers, peripherals, cables and gadgets' },
    { name: 'Packaging',     description: 'Boxes, tapes, bubble wrap and packing materials' },
    { name: 'Raw Materials', description: 'Steel, wood, plastic and other base materials' },
    { name: 'Office Supplies', description: 'Stationery, printing and desk accessories' },
  ]);
  console.log('[seed] Categories created.');

  /* ── Products ───────────────────────────────────────────────── */
  // Furniture — good stock
  const desk      = await productService.create({ name: 'Office Desk',        sku: 'DESK001',  category: furniture._id,    uom: 'Units', unitCost: 4500, reorderLevel: 5,  reorderQty: 10, description: 'Standard 4-ft office desk, laminate finish', initialStock: { quantity: 50, location: mainStock._id } }, user);
  const chair     = await productService.create({ name: 'Ergonomic Chair',     sku: 'CHAIR001', category: furniture._id,    uom: 'Units', unitCost: 2800, reorderLevel: 8,  reorderQty: 15, description: 'Mesh back adjustable chair', initialStock: { quantity: 4, location: mainStock._id } }, user);  // low stock
  const shelf     = await productService.create({ name: 'Metal Shelving Unit', sku: 'SHELF001', category: furniture._id,    uom: 'Units', unitCost: 1800, reorderLevel: 5,  reorderQty: 10, initialStock: { quantity: 30, location: rackA._id } }, user);
  const cabinet   = await productService.create({ name: 'Filing Cabinet',      sku: 'CAB001',   category: furniture._id,    uom: 'Units', unitCost: 3200, reorderLevel: 4,  reorderQty: 8,  initialStock: { quantity: 20, location: rackB._id } }, user);

  // Electronics — mixed stock
  const laptop    = await productService.create({ name: 'Laptop 15"',          sku: 'LAP001',   category: electronics._id,  uom: 'Units', unitCost: 55000, reorderLevel: 3, reorderQty: 5,  description: 'Business laptop, i5 16GB', initialStock: { quantity: 12, location: mainStock._id } }, user);
  const monitor   = await productService.create({ name: '24" Monitor',         sku: 'MON001',   category: electronics._id,  uom: 'Units', unitCost: 12000, reorderLevel: 5, reorderQty: 10, initialStock: { quantity: 2, location: mainStock._id } }, user);  // low stock
  const keyboard  = await productService.create({ name: 'Mechanical Keyboard', sku: 'KBD001',   category: electronics._id,  uom: 'Units', unitCost: 3500,  reorderLevel: 10, reorderQty: 20, initialStock: { quantity: 35, location: rackA._id } }, user);
  const usbHub    = await productService.create({ name: 'USB-C Hub 7-port',    sku: 'USB001',   category: electronics._id,  uom: 'Units', unitCost: 1800,  reorderLevel: 10, reorderQty: 20, initialStock: { quantity: 0, location: mainStock._id } }, user);  // out of stock
  const webcam    = await productService.create({ name: 'HD Webcam 1080p',     sku: 'CAM001',   category: electronics._id,  uom: 'Units', unitCost: 2500,  reorderLevel: 5,  reorderQty: 10, initialStock: { quantity: 18, location: sec2Stock._id } }, user);

  // Packaging
  const box       = await productService.create({ name: 'Cardboard Box (Large)', sku: 'BOX001', category: packaging._id,    uom: 'Units', unitCost: 35,   reorderLevel: 100, reorderQty: 200, initialStock: { quantity: 500, location: dispatch._id } }, user);
  const tape      = await productService.create({ name: 'Packing Tape Roll',    sku: 'TAPE001', category: packaging._id,    uom: 'Units', unitCost: 25,   reorderLevel: 50,  reorderQty: 100, initialStock: { quantity: 200, location: dispatch._id } }, user);
  const bubble    = await productService.create({ name: 'Bubble Wrap Roll 50m', sku: 'BWRAP01', category: packaging._id,    uom: 'Rolls', unitCost: 180,  reorderLevel: 20,  reorderQty: 40,  initialStock: { quantity: 60,  location: dispatch._id } }, user);

  // Raw Materials
  const steel     = await productService.create({ name: 'Steel Rod (6m)',       sku: 'STEEL01', category: rawMat._id,       uom: 'kg',    unitCost: 95,   reorderLevel: 200, reorderQty: 500, initialStock: { quantity: 800, location: sec2Bulk._id } }, user);
  const plywood   = await productService.create({ name: 'Plywood Sheet 8x4',    sku: 'PLY001',  category: rawMat._id,       uom: 'Sheets',unitCost: 650,  reorderLevel: 30,  reorderQty: 60,  initialStock: { quantity: 3, location: sec2Bulk._id } }, user);  // low stock

  // Office Supplies
  const paper     = await productService.create({ name: 'A4 Paper Ream 500',    sku: 'PAPER01', category: office._id,       uom: 'Reams', unitCost: 280,  reorderLevel: 20,  reorderQty: 50,  initialStock: { quantity: 75, location: rackB._id } }, user);

  console.log('[seed] Products created.');

  /* ── Operations ─────────────────────────────────────────────── */

  // 1. Receipt — DRAFT (vendor just confirmed PO)
  await operationService.create('receipt', {
    contact: 'TechnoSupply India',
    destLocation: mainStock._id,
    scheduledDate: new Date(Date.now() + 2 * 86400000), // in 2 days
    notes: 'Urgent restock for USB hubs and monitors.',
    lines: [
      { product: usbHub._id,   quantity: 50 },
      { product: monitor._id,  quantity: 10 },
      { product: webcam._id,   quantity: 20 },
    ],
  }, user);

  // 2. Receipt — READY (confirmed, waiting goods arrival)
  const rec2 = await operationService.create('receipt', {
    contact: 'Furniture World',
    destLocation: rackA._id,
    scheduledDate: new Date(Date.now() + 1 * 86400000),
    lines: [
      { product: desk._id,  quantity: 20 },
      { product: chair._id, quantity: 15 },
    ],
  }, user);
  await operationService.confirm('receipt', rec2._id);

  // 3. Delivery — DRAFT
  await operationService.create('delivery', {
    contact: 'Anjali Enterprises',
    deliveryAddress: 'B-204, Hitech City, Hyderabad 500081',
    sourceLocation: mainStock._id,
    scheduledDate: new Date(Date.now() + 1 * 86400000),
    lines: [
      { product: laptop._id,   quantity: 3 },
      { product: keyboard._id, quantity: 5 },
    ],
  }, user);

  // 4. Delivery — WAITING (stock reserved but not fully available)
  const del2 = await operationService.create('delivery', {
    contact: 'Ravi Logistics',
    deliveryAddress: '14 MG Road, Bengaluru 560001',
    sourceLocation: mainStock._id,
    scheduledDate: new Date(Date.now() - 1 * 86400000), // 1 day late
    lines: [
      { product: desk._id,  quantity: 8 },
      { product: shelf._id, quantity: 6 },
    ],
  }, user);
  await operationService.confirm('delivery', del2._id);

  // 5. Internal Transfer — DRAFT (moving stock to dispatch)
  await operationService.create('transfer', {
    sourceLocation: rackA._id,
    destLocation: dispatch._id,
    scheduledDate: new Date(Date.now() + 3 * 86400000),
    notes: 'Pre-positioning stock for upcoming deliveries.',
    lines: [
      { product: keyboard._id, quantity: 10 },
      { product: box._id,      quantity: 50 },
    ],
  }, user);

  // 6. Internal Transfer — READY (confirmed, stock reserved)
  const tr2 = await operationService.create('transfer', {
    sourceLocation: mainStock._id,
    destLocation: sec2Stock._id,
    scheduledDate: new Date(Date.now() + 1 * 86400000),
    lines: [
      { product: laptop._id,   quantity: 2 },
      { product: monitor._id,  quantity: 1 },
    ],
  }, user);
  await operationService.confirm('transfer', tr2._id);

  console.log('[seed] Operations created.');

  /* ── Done ───────────────────────────────────────────────────── */
  console.log('\n✅  Seed complete!\n');
  console.log('  Login ID : admin01');
  console.log('  Password : Admin@12345\n');
  console.log('  Warehouses : Main Warehouse (WH) · Secondary Warehouse (WH2)');
  console.log('  Locations  : WH/Stock, WH/Rack A, WH/Rack B, WH/Production Floor, WH/Dispatch Bay');
  console.log('               WH2/Stock, WH2/Cold Storage, WH2/Bulk Storage');
  console.log('  Categories : Furniture, Electronics, Packaging, Raw Materials, Office Supplies');
  console.log('  Products   : 15 products (in-stock, low-stock, out-of-stock)');
  console.log('  Operations : 2 receipts, 2 deliveries, 2 transfers (mix of draft/ready/waiting)\n');
}

main()
  .catch((err) => {
    console.error('[seed] ❌ Failed:', err.message);
    process.exitCode = 1;
  })
  .finally(() => disconnectDB());
