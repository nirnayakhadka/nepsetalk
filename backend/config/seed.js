/**
 * NepseTalk Seed Script - With Reliable Images
 * First run this SQL: ALTER TABLE news ADD COLUMN image VARCHAR(500) DEFAULT '' AFTER excerpt;
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

const slugify = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\u0900-\u097F\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

const seed = async () => {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  console.log('✅ MySQL connected\n');

  // Admin User
  console.log('👤 Seeding admin user...');
  const email = process.env.SEED_ADMIN_EMAIL || 'admin@nepsetalk.com';
  const password = process.env.SEED_ADMIN_PASSWORD || 'hello123';
  const name = process.env.SEED_ADMIN_NAME || 'Super Admin';
  const hash = await bcrypt.hash(password, 12);

  await db.execute(
    `INSERT INTO admin_users (name, email, password, role)
     VALUES (?, ?, ?, 'superadmin')
     ON DUPLICATE KEY UPDATE name = VALUES(name)`,
    [name, email.toLowerCase(), hash]
  );

  const [[{ id: adminId }]] = await db.execute('SELECT id FROM admin_users WHERE email = ?', [email.toLowerCase()]);
  console.log(` ✔ Admin: ${email} / ${password}`);

  // Categories
  console.log('\n📂 Seeding categories...');
  const categories = [
    { name: 'NEPSE', slug: 'nepse' },
    { name: 'व्यवसाय', slug: 'business' },
    { name: 'राष्ट्रिय', slug: 'national' },
    { name: 'अन्तर्राष्ट्रिय', slug: 'international' },
    { name: 'प्रविधि', slug: 'technology' },
    { name: 'खेलकुद', slug: 'sports' },
    { name: 'मनोरञ्जन', slug: 'entertainment' },
    { name: 'विचार', slug: 'opinion' },
  ];

  for (const cat of categories) {
    await db.execute(
      `INSERT INTO categories (name, slug) VALUES (?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name)`,
      [cat.name, cat.slug]
    );
    console.log(` ✔ ${cat.name}`);
  }

  const [catRows] = await db.execute('SELECT id, slug FROM categories');
  const catMap = {};
  catRows.forEach((c) => { catMap[c.slug] = c.id; });

  // News Articles with Images
  console.log('\n📰 Seeding news articles with images...');

  const articles = [
    {
      title: 'नेप्से सूचक ८५ अंकले बढ्यो, २४०० को मनोवैज्ञानिक बिन्दु पार',
      category: 'nepse',
      excerpt: 'बैंकिङ र हाइड्रोपावर क्षेत्रको बलियो खरिदले नेप्से सूचकलाई ठूलो उछाल दिएको छ।',
      content: '<p>काठमाडौं — नेपाल स्टक एक्सचेन्ज सूचक बिहीबार ८५ अंकले बढेर २४०० पार गरेको छ। कुल कारोबार ८.२ अर्ब पुगेको छ।</p>',
      image: 'https://picsum.photos/id/1015/800/600'   // Stock market feel
    },
    {
      title: 'नबिल बैंकको शेयर १२०० माथि ब्रेकआउटको तयारी',
      category: 'nepse',
      excerpt: 'टेक्निकल विश्लेषणले गोल्डेन क्रस देखाएको छ।',
      content: '<p>नबिल बैंकको शेयर पछिल्लो समय ११००–११८० को बीचमा कारोबार भइरहेको छ।</p>',
      image: 'https://picsum.photos/id/106/800/600'
    },
    {
      title: 'आर्थिक वर्ष २०८१/८२ मा नेपालको जीडीपी ५.५% ले वृद्धि हुने',
      category: 'business',
      excerpt: 'IMF ले पर्यटन र विप्रेषणलाई मुख्य आधार मानेको छ।',
      content: '<p>अन्तर्राष्ट्रिय मुद्रा कोषले नेपालको आर्थिक वृद्धिदर ५.५% हुने प्रक्षेपण गरेको छ।</p>',
      image: 'https://picsum.photos/id/201/800/600'
    },
    {
      title: 'नेपाल राष्ट्र बैंकले ब्याजदर घटायो',
      category: 'business',
      excerpt: 'नीतिगत दर ५० आधार बिन्दुले घटाइएको छ।',
      content: '<p>केन्द्रीय बैंकले मौद्रिक नीतिको समीक्षामा ब्याज दर घटाएको छ।</p>',
      image: 'https://picsum.photos/id/133/800/600'
    },
    {
      title: 'सरकारले १९ खर्बको बजेट सार्वजनिक गर्‍यो',
      category: 'national',
      excerpt: 'पूर्वाधार र शिक्षा क्षेत्रमा ठूलो ध्यान।',
      content: '<p>अर्थमन्त्रीले १.९ खर्ब रुपैयाँको बजेट प्रस्तुत गर्नुभयो।</p>',
      image: 'https://picsum.photos/id/251/800/600'
    },
    {
      title: 'डिजिटल भुक्तानीमा उछाल : ई–सेवा र खल्ती',
      category: 'technology',
      excerpt: '५०० अर्बभन्दा बढी कारोबार भएको छ।',
      content: '<p>ई–सेवा र खल्तीले रेकर्ड ट्रान्जेक्सन गरेका छन्।</p>',
      image: 'https://picsum.photos/id/367/800/600'
    },
    {
      title: 'नेपाल क्रिकेट टोलीले टी२० विश्वकपका लागि छनोट',
      category: 'sports',
      excerpt: 'ऐतिहासिक सफलता हासिल गरेको छ।',
      content: '<p>नेपालले क्षेत्रीय छनोटमा राम्रो प्रदर्शन गरेको छ।</p>',
      image: 'https://picsum.photos/id/870/800/600'
    },
    {
      title: 'नेपाली फिल्म लुट ३ ले बक्स अफिस रेकर्ड तोड्यो',
      category: 'entertainment',
      excerpt: 'ओपनिङ विकेन्डमा ५ करोडभन्दा बढी कमाइ।',
      content: '<p>लुट ३ ले नयाँ रेकर्ड बनाएको छ।</p>',
      image: 'https://picsum.photos/id/1016/800/600'
    },
    {
      title: 'विचार : नेपालको स्टक बजारमा राम्रो नियमनको खाँचो',
      category: 'opinion',
      excerpt: 'SEBON ले खुद्रा लगानीकर्तालाई संरक्षण गर्नुपर्छ।',
      content: '<p>स्टक बजारमा जानकारीको असमानता अझै ठूलो समस्या छ।</p>',
      image: 'https://picsum.photos/id/180/800/600'
    }
  ];

  let created = 0;
  for (const article of articles) {
    const slug = slugify(article.title) + '-' + Date.now() + '-' + Math.floor(Math.random() * 9999);
    const categoryId = catMap[article.category] || null;

    try {
      await db.execute(
        `INSERT INTO news (title, slug, content, excerpt, category_id, author_id, image, status, published_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'published', NOW())`,
        [article.title, slug, article.content, article.excerpt, categoryId, adminId, article.image]
      );
      console.log(` ✔ [${article.category.padEnd(13)}] ${article.title.substring(0, 50)}...`);
      created++;
    } catch (err) {
      console.error(` ✘ Failed: ${article.title} — ${err.message}`);
    }
  }

  console.log(`\n🎉 Seeding completed successfully!`);
  console.log(` Articles seeded : ${created}/${articles.length}`);
  console.log(`\n🚀 You can now login with admin@nepsetalk.com / hello123`);

  await db.end();
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Fatal error:', err.message);
  process.exit(1);
});