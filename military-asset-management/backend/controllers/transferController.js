import db from "../config/db.js";

export const listTransfers = async (req, res) => {
  try {
    const baseId =
      req.user.role === "BASE_COMMANDER"
        ? req.user.baseId
        : (req.query.baseId || null);

    const [rows] = await db.execute(`
      SELECT
        t.*,
        sb.name AS source_base_name,
        db.name AS destination_base_name,
        e.name AS equipment_name,
        u.username AS initiated_by_name
      FROM transfers t
      JOIN bases sb ON sb.id = t.source_base_id
      JOIN bases db ON db.id = t.destination_base_id
      JOIN equipment_types e ON e.id = t.equipment_type_id
      LEFT JOIN users u ON u.id = t.initiated_by
      WHERE (
        ? IS NULL
        OR t.source_base_id = ?
        OR t.destination_base_id = ?
      )
      ORDER BY t.timestamp DESC
    `, [baseId, baseId, baseId]);

    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createTransfer = async (req, res) => {
  const {
    sourceBaseId,
    destinationBaseId,
    equipmentTypeId,
    quantity
  } = req.body;

  if (
    !sourceBaseId ||
    !destinationBaseId ||
    !equipmentTypeId ||
    !quantity ||
    Number(quantity) <= 0
  ) {
    return res.status(400).json({
      message: "All fields are required and quantity must be positive"
    });
  }

  if (Number(sourceBaseId) === Number(destinationBaseId)) {
    return res.status(400).json({
      message: "Source and destination bases must differ"
    });
  }

  if (
    req.user.role === "BASE_COMMANDER" &&
    Number(sourceBaseId) !== Number(req.user.baseId)
  ) {
    return res.status(403).json({
      message: "You can only transfer from your assigned base"
    });
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [stockRows] = await connection.execute(`
      SELECT
        COALESCE((
          SELECT SUM(quantity)
          FROM purchases
          WHERE base_id = ?
            AND equipment_type_id = ?
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
          WHERE base_id = ?
            AND equipment_type_id = ?
        ),0)

        - COALESCE((
          SELECT SUM(quantity)
          FROM expenditures
          WHERE base_id = ?
            AND equipment_type_id = ?
        ),0) AS available
    `, [
      sourceBaseId, equipmentTypeId,
      sourceBaseId, equipmentTypeId,
      sourceBaseId, equipmentTypeId,
      sourceBaseId, equipmentTypeId,
      sourceBaseId, equipmentTypeId
    ]);

    const available = Number(stockRows[0].available);

    if (available < Number(quantity)) {
      await connection.rollback();
      return res.status(400).json({
        message: `Insufficient stock. Available: ${available}`
      });
    }

    const [result] = await connection.execute(`
      INSERT INTO transfers
        (source_base_id, destination_base_id, equipment_type_id, quantity, status, initiated_by)
      VALUES (?, ?, ?, ?, 'COMPLETED', ?)
    `, [
      sourceBaseId,
      destinationBaseId,
      equipmentTypeId,
      quantity,
      req.user.id
    ]);

    await connection.execute(`
      INSERT INTO audit_logs
        (user_id, action, details)
      VALUES (?, 'TRANSFER', ?)
    `, [
      req.user.id,
      `Transferred ${quantity} units of equipment #${equipmentTypeId} from base #${sourceBaseId} to #${destinationBaseId}`
    ]);

    await connection.commit();

    res.status(201).json({
      message: "Transfer completed successfully",
      id: result.insertId
    });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: error.message });
  } finally {
    connection.release();
  }
};
