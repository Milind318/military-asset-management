import db from "../config/db.js";

export const listPurchases = async (req, res) => {
  try {
    const baseId =
      req.user.role === "BASE_COMMANDER"
        ? req.user.baseId
        : (req.query.baseId || null);

    const [rows] = await db.execute(`
      SELECT
        p.*,
        b.name AS base_name,
        e.name AS equipment_name,
        u.username AS created_by_name
      FROM purchases p
      JOIN bases b ON b.id = p.base_id
      JOIN equipment_types e ON e.id = p.equipment_type_id
      LEFT JOIN users u ON u.id = p.created_by
      WHERE (? IS NULL OR p.base_id = ?)
      ORDER BY p.created_at DESC
    `, [baseId, baseId]);

    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createPurchase = async (req, res) => {
  const {
    baseId,
    equipmentTypeId,
    quantity,
    date,
    supplier
  } = req.body;

  if (!baseId || !equipmentTypeId || !quantity || Number(quantity) <= 0) {
    return res.status(400).json({
      message: "Base, equipment type and positive quantity are required"
    });
  }

  if (
    req.user.role === "BASE_COMMANDER" &&
    Number(baseId) !== Number(req.user.baseId)
  ) {
    return res.status(403).json({
      message: "You can only purchase for your assigned base"
    });
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [result] = await connection.execute(`
      INSERT INTO purchases
        (base_id, equipment_type_id, quantity, purchase_date, supplier, created_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      baseId,
      equipmentTypeId,
      quantity,
      date || new Date(),
      supplier || null,
      req.user.id
    ]);

    await connection.execute(`
      INSERT INTO audit_logs
        (user_id, action, details)
      VALUES (?, 'PURCHASE', ?)
    `, [
      req.user.id,
      `Purchased ${quantity} units of equipment #${equipmentTypeId} for base #${baseId}`
    ]);

    await connection.commit();

    res.status(201).json({
      message: "Purchase recorded",
      id: result.insertId
    });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: error.message });
  } finally {
    connection.release();
  }
};
