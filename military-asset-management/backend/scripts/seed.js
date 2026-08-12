import bcrypt from "bcryptjs";
import db from "../config/db.js";

const users = [
  {
    username: "admin_user",
    password: "AdminPass123!",
    role: "ADMIN",
    baseId: null
  },
  {
    username: "commander_alpha",
    password: "CommandPass123!",
    role: "BASE_COMMANDER",
    baseId: 1
  },
  {
    username: "logistics_officer",
    password: "LogisticsPass123!",
    role: "LOGISTICS_OFFICER",
    baseId: 1
  }
];

try {
  for (const user of users) {
    const hash = await bcrypt.hash(user.password, 10);

    await db.execute(`
      INSERT INTO users
        (username, password_hash, role, base_id)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        password_hash = VALUES(password_hash),
        role = VALUES(role),
        base_id = VALUES(base_id)
    `, [
      user.username,
      hash,
      user.role,
      user.baseId
    ]);
  }

  console.log("Demo users created/updated successfully.");
  console.log("Admin: admin_user / AdminPass123!");
  console.log("Commander: commander_alpha / CommandPass123!");
  console.log("Logistics: logistics_officer / LogisticsPass123!");
} catch (error) {
  console.error("Seed failed:", error.message);
} finally {
  await db.end();
}
