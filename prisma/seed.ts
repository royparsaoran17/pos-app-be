import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create superadmin
  await prisma.users.upsert({
    where: { email: 'superadmin@pos.com' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'superadmin@pos.com',
      password: hashedPassword,
      role: 'SUPERADMIN',
    },
  });

  // Create staff
  await prisma.users.upsert({
    where: { email: 'staff@pos.com' },
    update: {},
    create: {
      name: 'Staff 1',
      email: 'staff@pos.com',
      password: hashedPassword,
      role: 'STAFF',
    },
  });

  // Seed menu sizes
  const menuSizes = [
    { key: 'SMALL', label: 'Small', price: 4000, max_toppings: 2, sort_order: 1 },
    { key: 'MEDIUM', label: 'Medium', price: 7000, max_toppings: 4, sort_order: 2 },
    { key: 'LARGE', label: 'Large', price: 12000, max_toppings: null, sort_order: 3 },
    { key: 'THINWALL', label: 'Thinwall', price: 15000, max_toppings: null, sort_order: 4 },
  ];

  for (const size of menuSizes) {
    await prisma.menu_sizes.upsert({
      where: { key: size.key },
      update: { label: size.label, price: size.price, max_toppings: size.max_toppings, sort_order: size.sort_order },
      create: size,
    });
  }

  // Seed toppings
  const toppingNames = [
    'Usus Kriuk', 'Basreng Kering', 'Mie Gulung', 'Makroni Kering',
    'Makroni Basah', 'Bihun Kriuk', 'Kerupuk Bawang', 'Makroni Bantat',
    'Cimol Kering', 'Mie Kriuk', 'Sosis Kering', 'Makroni Kerang',
    'Makroni Spiral', 'Keripik Cireng', 'Keripik Kaca', 'Pilus Cikur',
    'Kerupuk Rafael', 'Basreng Basah',
  ];

  for (const name of toppingNames) {
    await prisma.toppings.upsert({
      where: { id: toppingNames.indexOf(name) + 1 },
      update: { name },
      create: { name },
    });
  }

  // Seed bumbu
  const bumbuNames = [
    'Minyak Bawang', 'Daun Jeruk', 'Asin', 'Balado', 'Keju', 'Jagung Bakar',
  ];

  for (const name of bumbuNames) {
    await prisma.bumbu.upsert({
      where: { id: bumbuNames.indexOf(name) + 1 },
      update: { name },
      create: { name },
    });
  }

  // Seed sample promo
  await prisma.promos.upsert({
    where: { code: 'GRAND10' },
    update: {},
    create: {
      code: 'GRAND10',
      name: 'Grand Opening 10%',
      description: 'Diskon 10% untuk semua pesanan',
      discount_type: 'PERCENTAGE',
      discount_value: 10,
      min_purchase: 10000,
      max_discount: 5000,
    },
  });

  await prisma.promos.upsert({
    where: { code: 'HEMAT5K' },
    update: {},
    create: {
      code: 'HEMAT5K',
      name: 'Hemat 5 Ribu',
      description: 'Potongan Rp 5.000 untuk pembelian minimal Rp 20.000',
      discount_type: 'FIXED',
      discount_value: 5000,
      min_purchase: 20000,
    },
  });

  // Seed SOP tasks
  const sopTasks = [
    // OPENING
    { category: 'OPENING', sort_order: 1, description: 'Datang tepat waktu sesuai jam yang sudah ditentukan' },
    { category: 'OPENING', sort_order: 2, description: 'Mengikat rambut dengan rapih' },
    { category: 'OPENING', sort_order: 3, description: 'Cek stok cemilan dan bahan baku' },
    { category: 'OPENING', sort_order: 4, description: 'Masak Makaroni basah secukupnya' },
    { category: 'OPENING', sort_order: 5, description: 'Menghitung uang dan mencatat pada catatan keuangan, "Saldo Awal"' },
    { category: 'OPENING', sort_order: 6, description: 'Mengisi Absensi' },
    { category: 'OPENING', sort_order: 7, description: 'Menyapu bagian depan toko' },
    { category: 'OPENING', sort_order: 8, description: 'Memasang keset hitam dengan rapih' },
    { category: 'OPENING', sort_order: 9, description: 'Membersihkan area meja belakang, meja kompor dan lemari samping' },
    { category: 'OPENING', sort_order: 10, description: 'Membersihkan Foodpan, toples, area bumbu dan area kasir' },
    { category: 'OPENING', sort_order: 11, description: 'Memasukan cemilan pada foodpan' },
    { category: 'OPENING', sort_order: 12, description: 'Melaporkan ke group Whatsapp berupa: Foto Foodpan, Foto Depan Toko, Foto Kebersihan Lantai' },
    { category: 'OPENING', sort_order: 13, description: 'Menyapu dan Mengepel area dalam toko' },
    { category: 'OPENING', sort_order: 14, description: 'Menyimpan banner pada halaman luar toko' },
    // OPERATIONAL
    { category: 'OPERATIONAL', sort_order: 1, description: 'Layani customer dengan ramah (3S: Senyum, Salam, Sapa)' },
    { category: 'OPERATIONAL', sort_order: 2, description: 'Gunakan takaran sesuai SOP yang berlaku' },
    { category: 'OPERATIONAL', sort_order: 3, description: 'Mencatat penjualan di Lembar Catatan Penjualan' },
    { category: 'OPERATIONAL', sort_order: 4, description: 'Mencatat Transaksi Qris pada Catatan Qris' },
    { category: 'OPERATIONAL', sort_order: 5, description: 'Menjaga Kebersihan Toko' },
    { category: 'OPERATIONAL', sort_order: 6, description: 'Mencatat setiap barang masuk / barang keluar' },
    { category: 'OPERATIONAL', sort_order: 7, description: 'Memfoto setiap transaksi menggunakan QRIS dan kirimkan ke group' },
    { category: 'OPERATIONAL', sort_order: 8, description: 'Menyalakan lampu jika kondisi toko mulai gelap' },
    // CLOSING
    { category: 'CLOSING', sort_order: 1, description: 'Membersihkan area meja belakang, meja kompor dan lemari samping' },
    { category: 'CLOSING', sort_order: 2, description: 'Membersihkan Foodpan, toples, area bumbu dan area kasir' },
    { category: 'CLOSING', sort_order: 3, description: 'Menyapu bagian depan toko' },
    { category: 'CLOSING', sort_order: 4, description: 'Menghitung uang dan mencatat pada catatan keuangan (Saldo Akhir, Uang masuk dll)' },
    { category: 'CLOSING', sort_order: 5, description: 'Melaporkan ke group Whatsapp berupa: Foto Foodpan, Foto Depan Toko, Foto Kebersihan Lantai' },
    { category: 'CLOSING', sort_order: 6, description: 'Mengunci Laci Kasir dan Toko dengan rapih' },
    { category: 'CLOSING', sort_order: 7, description: 'Menyapu dan Mengepel area dalam toko' },
    { category: 'CLOSING', sort_order: 8, description: 'Mencuci Peralatan Masak (Panci, wajan, saptula dll)' },
    { category: 'CLOSING', sort_order: 9, description: 'Mencuci Toples dan Sendok pengaduk' },
  ] as const;

  for (const task of sopTasks) {
    const existing = await prisma.sop_tasks.findFirst({
      where: { category: task.category, sort_order: task.sort_order },
    });
    if (!existing) {
      await prisma.sop_tasks.create({ data: task });
    } else {
      await prisma.sop_tasks.update({
        where: { id: existing.id },
        data: { description: task.description },
      });
    }
  }

  // Seed expense categories
  const expenseCategories = ['Sewa Tempat', 'Listrik', 'Gas', 'Air', 'Perlengkapan', 'Gaji', 'Lain-lain', 'Setoran', 'Beli Galon', 'Beli Token Listrik', 'Bayar Sampah', 'Beli Bawang Putih'];
  for (const name of expenseCategories) {
    const existing = await prisma.expense_categories.findFirst({ where: { name } });
    if (!existing) {
      await prisma.expense_categories.create({ data: { name } });
    }
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
