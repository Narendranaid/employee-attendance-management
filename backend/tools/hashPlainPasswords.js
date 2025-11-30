// backend/tools/hashPlainPasswords.js
require('dotenv').config();
const connectDB = require('../config/db');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

(async () => {
  try {
    await connectDB();
    console.log('Connected to DB');

    const users = await User.find({}).lean();
    console.log(`Found ${users.length} users, checking passwords...`);

    let updated = 0;

    for (const u of users) {
      const pwd = u.password || '';
      // A bcrypt hash typically starts with $2 (e.g. $2a$, $2b$) and length ~60
      const looksLikeBcrypt = typeof pwd === 'string' && pwd.startsWith('$2') && pwd.length >= 50;

      if (!looksLikeBcrypt && pwd.length > 0) {
        // hash the existing plaintext password
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(pwd, salt);

        await User.updateOne({ _id: u._id }, { $set: { password: hash } });
        console.log(`-> Updated ${u.email} (password hashed)`);
        updated++;
      } else {
        console.log(`-> Skipped ${u.email} (already hashed or empty)`);
      }
    }

    console.log(`Finished. Updated ${updated} user(s).`);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})();