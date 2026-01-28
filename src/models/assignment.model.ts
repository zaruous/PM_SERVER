import pool from '../database/db';
import { Assignment } from '../types';
import { generateId } from '../utils/helpers';

export const assignmentModel = {
  async findAll(): Promise<Assignment[]> {
    const [rows] = await pool.query('SELECT * FROM assignments');
    const assignments = rows as any[];
    // The monthly_weights are stored as JSON strings in the DB
    return assignments.map(a => ({
        ...a,
        monthly_weights: typeof a.monthly_weights === 'string' ? JSON.parse(a.monthly_weights) : a.monthly_weights
    }));
  },

  async findById(id: string): Promise<Assignment | null> {
    const [rows] = await pool.query('SELECT * FROM assignments WHERE id = ?', [id]);
    const assignments = rows as any[];
    if (assignments.length === 0) {
        return null;
    }
    const assignment = assignments[0];
    return {
        ...assignment,
        monthly_weights: typeof assignment.monthly_weights === 'string' 
            ? JSON.parse(assignment.monthly_weights) 
            : assignment.monthly_weights
    };
  },

  async create(assignment: Omit<Assignment, 'id'>): Promise<Assignment> {
    const newAssignment = { 
        id: generateId(), 
        ...assignment,
        monthly_weights: JSON.stringify(assignment.monthly_weights || {})
    };
    await pool.query('INSERT INTO assignments SET ?', newAssignment);
    return { ...newAssignment, monthly_weights: assignment.monthly_weights };
  },

  async update(id: string, assignment: Partial<Assignment>): Promise<Assignment | null> {
    const updateData: { [key: string]: any } = { ...assignment };

    if (assignment.monthly_weights) {
        updateData.monthly_weights = JSON.stringify(assignment.monthly_weights);
    }

    await pool.query('UPDATE assignments SET ? WHERE id = ?', [updateData, id]);
    return this.findById(id);
  },

  async remove(id: string): Promise<void> {
    await pool.query('DELETE FROM assignments WHERE id = ?', [id]);
  }
};
