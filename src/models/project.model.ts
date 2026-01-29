import pool from '../database/db';
import { Project } from '../types';
import { generateId } from '../utils/helpers';

export const projectModel = {
  async findAll(): Promise<Project[]> {
    const { rows } = await pool.query('SELECT * FROM projects');
    return rows;
  },

  async findById(id: string): Promise<Project | null> {
    const { rows } = await pool.query('SELECT * FROM projects WHERE id = $1', [id]);
    return rows.length > 0 ? rows[0] : null;
  },

  async create(project: Omit<Project, 'id'>): Promise<Project> {
    const newProject: Project = { id: generateId(), ...project };
    const { name, code, client, type, order_amount, start_date, end_date, status } = newProject;
    await pool.query(
      'INSERT INTO projects (id, name, code, client, type, order_amount, start_date, end_date, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
      [newProject.id, name, code, client, type, order_amount, start_date, end_date, status]
    );
    return newProject;
  },

  async update(id: string, project: Partial<Project>): Promise<Project | null> {
    const queryParts: string[] = [];
    const values: any[] = [];
    let valueCounter = 1;

    for (const [key, value] of Object.entries(project)) {
      queryParts.push(`${key} = $${valueCounter}`);
      values.push(value);
      valueCounter++;
    }

    if (queryParts.length > 0) {
      const queryString = `UPDATE projects SET ${queryParts.join(', ')} WHERE id = $${valueCounter}`;
      values.push(id);
      await pool.query(queryString, values);
    }
    
    return this.findById(id);
  },

  async remove(id: string): Promise<void> {
    await pool.query('DELETE FROM projects WHERE id = $1', [id]);
  }
};
