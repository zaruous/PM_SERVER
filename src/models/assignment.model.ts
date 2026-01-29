import pool from '../database/db';
import { Assignment } from '../types';
import { generateId } from '../utils/helpers';

export const assignmentModel = {
  async findAll(): Promise<Assignment[]> {
    const { rows } = await pool.query('SELECT * FROM assignments');
    return rows.map(a => ({
        ...a,
        monthly_weights: typeof a.monthly_weights === 'string' ? JSON.parse(a.monthly_weights) : a.monthly_weights
    }));
  },

  async findById(id: string): Promise<Assignment | null> {
    const { rows } = await pool.query('SELECT * FROM assignments WHERE id = $1', [id]);
    if (rows.length === 0) {
        return null;
    }
    const assignment = rows[0];
    return {
        ...assignment,
        monthly_weights: typeof assignment.monthly_weights === 'string' 
            ? JSON.parse(assignment.monthly_weights) 
            : assignment.monthly_weights
    };
  },

  async create(assignment: Omit<Assignment, 'id'>): Promise<Assignment> {
    const newAssignment: Assignment = { id: generateId(), ...assignment };
    const { id, project_id, member_id, member_name, role, start_date, end_date, input_ratio, monthly_weights } = newAssignment;

    await pool.query(
      'INSERT INTO assignments (id, project_id, member_id, member_name, role, start_date, end_date, input_ratio, monthly_weights) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
      [id, project_id, member_id, member_name, role, start_date, end_date, input_ratio, JSON.stringify(monthly_weights || {})]
    );
    // Restore the original monthly_weights object for the returned assignment
    newAssignment.monthly_weights = assignment.monthly_weights;
    return newAssignment;
  },

  async update(id: string, assignment: Partial<Assignment>): Promise<Assignment | null> {
    const queryParts: string[] = [];
    const values: any[] = [];
    let valueCounter = 1;

    const updateData = { ...assignment };
    if (updateData.monthly_weights) {
      updateData.monthly_weights = updateData.monthly_weights;
    }

    for (const [key, value] of Object.entries(updateData)) {
      queryParts.push(`${key} = $${valueCounter}`);
      values.push(value);
      valueCounter++;
    }

    if (queryParts.length > 0) {
      const queryString = `UPDATE assignments SET ${queryParts.join(', ')} WHERE id = $${valueCounter}`;
      values.push(id);
      await pool.query(queryString, values);
    }
    
    return this.findById(id);
  },

  async remove(id: string): Promise<void> {
    await pool.query('DELETE FROM assignments WHERE id = $1', [id]);
  }
};
