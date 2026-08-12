import db from "../config/db.js";

export const getDashboardMetrics = async (req, res) => {
  try {
    const { baseId, equipmentTypeId, startDate, endDate } = req.query;

    const scopedBase =
      req.user.role === "BASE_COMMANDER"
        ? req.user.baseId
        : (baseId || null);

    const purchaseParams = [];
    const transferInParams = [];
    const transferOutParams = [];
    const assignmentParams = [];
    const expenditureParams = [];

    let purchaseWhere = "WHERE 1=1";
    let transferInWhere = "WHERE status='COMPLETED'";
    let transferOutWhere = "WHERE status='COMPLETED'";
    let assignmentWhere = "WHERE 1=1";
    let expenditureWhere = "WHERE 1=1";

    if (scopedBase !== null && scopedBase !== undefined && scopedBase !== "") {
      purchaseWhere += " AND base_id = ?";
      purchaseParams.push(scopedBase);
      transferInWhere += " AND destination_base_id = ?";
      transferInParams.push(scopedBase);
      transferOutWhere += " AND source_base_id = ?";
      transferOutParams.push(scopedBase);
      assignmentWhere += " AND base_id = ?";
      assignmentParams.push(scopedBase);
      expenditureWhere += " AND base_id = ?";
      expenditureParams.push(scopedBase);
    }

    if (equipmentTypeId) {
      purchaseWhere += " AND equipment_type_id = ?";
      purchaseParams.push(equipmentTypeId);
      transferInWhere += " AND equipment_type_id = ?";
      transferInParams.push(equipmentTypeId);
      transferOutWhere += " AND equipment_type_id = ?";
      transferOutParams.push(equipmentTypeId);
      assignmentWhere += " AND equipment_type_id = ?";
      assignmentParams.push(equipmentTypeId);
      expenditureWhere += " AND equipment_type_id = ?";
      expenditureParams.push(equipmentTypeId);
    }

    if (startDate) {
      purchaseWhere += " AND created_at >= ?";
      purchaseParams.push(startDate);
      transferInWhere += " AND timestamp >= ?";
      transferInParams.push(startDate);
      transferOutWhere += " AND timestamp >= ?";
      transferOutParams.push(startDate);
      assignmentWhere += " AND created_at >= ?";
      assignmentParams.push(startDate);
      expenditureWhere += " AND created_at >= ?";
      expenditureParams.push(startDate);
    }

    if (endDate) {
      purchaseWhere += " AND created_at <= ?";
      purchaseParams.push(endDate);
      transferInWhere += " AND timestamp <= ?";
      transferInParams.push(endDate);
      transferOutWhere += " AND timestamp <= ?";
      transferOutParams.push(endDate);
      assignmentWhere += " AND created_at <= ?";
      assignmentParams.push(endDate);
      expenditureWhere += " AND created_at <= ?";
      expenditureParams.push(endDate);
    }

    const [purchases] = await db.execute(
      `SELECT COALESCE(SUM(quantity),0) AS total
       FROM purchases ${purchaseWhere}`,
      purchaseParams
    );

    const [transfersIn] = await db.execute(
      `SELECT COALESCE(SUM(quantity),0) AS total
       FROM transfers ${transferInWhere}`,
      transferInParams
    );

    const [transfersOut] = await db.execute(
      `SELECT COALESCE(SUM(quantity),0) AS total
       FROM transfers ${transferOutWhere}`,
      transferOutParams
    );

    const [assigned] = await db.execute(
      `SELECT COALESCE(SUM(quantity),0) AS total
       FROM assignments ${assignmentWhere}`,
      assignmentParams
    );

    const [expended] = await db.execute(
      `SELECT COALESCE(SUM(quantity),0) AS total
       FROM expenditures ${expenditureWhere}`,
      expenditureParams
    );

    const p = Number(purchases[0].total);
    const tin = Number(transfersIn[0].total);
    const tout = Number(transfersOut[0].total);
    const a = Number(assigned[0].total);
    const e = Number(expended[0].total);

    const netMovement = p + tin - tout;
    const closingBalance = netMovement - a - e;

    res.json({
      openingBalance: 0,
      purchases: p,
      transfersIn: tin,
      transfersOut: tout,
      netMovement,
      assigned: a,
      expended: e,
      closingBalance
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

export const getInventory = async (req, res) => {
  try {
    const baseId =
      req.user.role === "BASE_COMMANDER"
        ? req.user.baseId
        : (req.query.baseId || null);

    const [rows] = await db.execute(`
      SELECT
        e.id,
        e.name,
        e.category,

        COALESCE((
          SELECT SUM(p.quantity)
          FROM purchases p
          WHERE p.equipment_type_id = e.id
            AND (? IS NULL OR p.base_id = ?)
        ),0)

        + COALESCE((
          SELECT SUM(t.quantity)
          FROM transfers t
          WHERE t.equipment_type_id = e.id
            AND t.status = 'COMPLETED'
            AND (? IS NULL OR t.destination_base_id = ?)
        ),0)

        - COALESCE((
          SELECT SUM(t.quantity)
          FROM transfers t
          WHERE t.equipment_type_id = e.id
            AND t.status = 'COMPLETED'
            AND (? IS NULL OR t.source_base_id = ?)
        ),0)

        - COALESCE((
          SELECT SUM(a.quantity)
          FROM assignments a
          WHERE a.equipment_type_id = e.id
            AND (? IS NULL OR a.base_id = ?)
        ),0)

        - COALESCE((
          SELECT SUM(x.quantity)
          FROM expenditures x
          WHERE x.equipment_type_id = e.id
            AND (? IS NULL OR x.base_id = ?)
        ),0) AS quantity

      FROM equipment_types e
      ORDER BY e.category, e.name
    `, [
      baseId, baseId,
      baseId, baseId,
      baseId, baseId,
      baseId, baseId,
      baseId, baseId
    ]);

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

export const getBases = async (_req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT id, name, location FROM bases ORDER BY id"
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getEquipment = async (_req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT id, name, category FROM equipment_types ORDER BY category, name"
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
