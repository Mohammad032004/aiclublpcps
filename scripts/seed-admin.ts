/**
 * Run once to seed the admin user:
 *   npx tsx scripts/seed-admin.ts
 *
 * Make sure MONGODB_URI is set in .env
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGODB_URI!;

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: "admin" },
  createdAt: { type: Date, default: Date.now },
});

async function seed() {
  try {
    console.log("🔌 Connecting to database...");
    await mongoose.connect(uri);
    console.log("✅ Connected to MongoDB");

    const User =
      mongoose.models.User || mongoose.model("User", UserSchema);

    // ✅ FINAL CREDENTIALS (use these to login)
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL!;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD!;

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

    const user = await User.findOneAndUpdate(
      { email: ADMIN_EMAIL },
      {
        name: "Aryan Kumar",
        email: ADMIN_EMAIL,
        password: hashedPassword,
        role: "admin",
      },
      { upsert: true, returnDocument: "after" } // ✅ fixed deprecation
    );

    console.log("\n🎉 Admin user ready:");
    console.log("   Email:   ", ADMIN_EMAIL);
    console.log("   Password:", ADMIN_PASSWORD);
    console.log("   User ID: ", user._id);
    console.log("⚠️  Change password after first login!\n");

    await mongoose.disconnect();
    console.log("🔌 Disconnected from DB");
  } catch (error) {
    console.error("❌ Error seeding admin:", error);
    process.exit(1);
  }
}

seed();