import db from "../config/db.js";

const getAvailableStock = async (connection, baseId, equipmentTypeId) => {
  const [rows] = await connection.execute(`
    SELECT
      COALESCE((
        SELECT SUM(quantity)
        FROM purchases
        WHERE base_id = ? AND equipment_type_id = ?
      ),0)

      + COALESCE((
        SELECT SUM(quantity)
        FROM transfers
        WHERE destination_base_id = ?
          AND equipment_type_id = ?
          AND status = 'COMPLETED'
      ),0)

      - COALESCE((
        SELECT SUM(quantity)
        FROM transfers
        WHERE source_base_id = ?
          AND equipment_type_id = ?
          AND status = 'COMPLETED'
      ),0)

      - COALESCE((
        SELECT SUM(quantity)
        FROM assignments
        WHERE base_id = ? AND equipment_type_id = ?
      ),0)

      - COALESCE((
        SELECT SUM(quantity)
        FROM expenditures
        WHERE base_id = ? AND equipment_type_id = ?
      ),0) AS available
  `, [
    baseId, equipmentTypeId,
    baseId, equipmentTypeId,
    baseId, equipmentTypeId,
    baseId, equipmentTypeId,
    baseId, equipmentTypeId
  ]);

  return Number(rows[0].available);
};

export const listAssignments = async (req, res) => {
  try {
    const baseId =
      req.user.role === "BASE_COMMANDER"
        ? req.user.baseId
        : (req.query.baseId || null);

    const [rows] = await db.execute(`
      SELECT
        a.*,
        b.name AS base_name,
        e.name AS equipment_name,
        u.username AS created_by_name
      FROM assignments a
      JOIN bases b ON b.id = a.base_id
      JOIN equipment_types e ON e.id = a.equipment_type_id
      LEFT JOIN users u ON u.id = a.created_by
      WHERE (? IS NULL OR a.base_id = ?)
      ORDER BY a.created_at DESC
    `, [baseId, baseId]);

    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createAssignment = async (req, res) => {
  const {
    baseId,
    equipmentTypeId,
    quantity,
    personnelName,
    purpose
  } = req.body;

  if (!baseId || !equipmentTypeId || !quantity || !personnelName) {
    return res.status(400).json({
      message: "Base, equipment, quantity and personnel are required"
    });
  }

  if (
    req.user.role === "BASE_COMMANDER" &&
    Number(baseId) !== Number(req.user.baseId)
  ) {
    return res.status(403).json({ message: "Base scope violation" });
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const available = await getAvailableStock(
      connection,
      baseId,
      equipmentTypeId
    );

    if (available < Number(quantity)) {
      await connection.rollback();
      return res.status(400).json({
        message: `Insufficient stock. Available: ${available}`
      });
    }

    const [result] = await connection.execute(`
      INSERT INTO assignments
        (base_id, equipment_type_id, quantity, personnel_name, purpose, created_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      baseId,
      equipmentTypeId,
      quantity,
      personnelName,
      purpose || null,
      req.user.id
    ]);

    await connection.execute(`
      INSERT INTO audit_logs
        (user_id, action, details)
      VALUES (?, 'ASSIGNMENT', ?)
    `, [
      req.user.id,
      `Assigned ${quantity} units to ${personnelName}`
    ]);

    await connection.commit();

    res.status(201).json({
      message: "Assignment recorded",
      id: result.insertId
    });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: error.message });
  } finally {
    connection.release();
  }
};

export const listExpenditures = async (req, res) => {
  try {
    const baseId =
      req.user.role === "BASE_COMMANDER"
        ? req.user.baseId
        : (req.query.baseId || null);

    const [rows] = await db.execute(`
      SELECT
        x.*,
        b.name AS base_name,
        e.name AS equipment_name,
        u.username AS created_by_name
      FROM expenditures x
      JOIN bases b ON b.id = x.base_id
      JOIN equipment_types e ON e.id = x.equipment_type_id
      LEFT JOIN users u ON u.id = x.created_by
      WHERE (? IS NULL OR x.base_id = ?)
      ORDER BY x.created_at DESC
    `, [baseId, baseId]);

    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createExpenditure = async (req, res) => {
  const {
    baseId,
    equipmentTypeId,
    quantity,
    reason
  } = req.body;

  if (!baseId || !equipmentTypeId || !quantity) {
    return res.status(400).json({
      message: "Base, equipment and quantity are required"
    });
  }

  if (
    req.user.role === "BASE_COMMANDER" &&
    Number(baseId) !== Number(req.user.baseId)
  ) {
    return res.status(403).json({ message: "Base scope violation" });
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const available = await getAvailableStock(
      connection,
      baseId,
      equipmentTypeId
    );

    if (available < Number(quantity)) {
      await connection.rollback();
      return res.status(400).json({
        message: `Insufficient stock. Available: ${available}`
      });
    }

    const [result] = await connection.execute(`
      INSERT INTO expenditures
        (base_id, equipment_type_id, quantity, reason, created_by)
      VALUES (?, ?, ?, ?, ?)
    `, [
      baseId,
      equipmentTypeId,
      quantity,
      reason || null,
      req.user.id
    ]);

    await connection.execute(`
      INSERT INTO audit_logs
        (user_id, action, details)
      VALUES (?, 'EXPENDITURE', ?)
    `, [
      req.user.id,
      `Expended ${quantity} units of equipment #${equipmentTypeId}`
    ]);

    await connection.commit();

    res.status(201).json({
      message: "Expenditure recorded",
      id: result.insertId
    });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: error.message });
  } finally {
    connection.release();
  }
};
