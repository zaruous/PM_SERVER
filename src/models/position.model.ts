import pool from '../database/db';

export const positionLevelModel = {
  async findAll(): Promise<string[]> {
    const { rows } = await pool.query('SELECT name FROM position_levels ORDER BY sort_order');
    return rows.map(row => row.name);
  },
};
