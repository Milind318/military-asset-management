import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../config/db.js";

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password are required"
      });
    }

    const [rows] = await db.execute(
      `SELECT id, username, password_hash, role, base_id
       FROM users
       WHERE username = ?`,
      [username]
    );

    if (!rows.length) {
      return res.status(401).json({
        message: "Invalid username or password"
      });
    }

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid) {
      return res.status(401).json({
        message: "Invalid username or password"
      });
    }

    const payload = {
      id: user.id,
      username: user.username,
      role: user.role,
      baseId: user.base_id
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "8h"
    });

    res.json({ token, user: payload });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Login failed" });
  }
};

export const me = async (req, res) => {
  res.json({ user: req.user });
};
