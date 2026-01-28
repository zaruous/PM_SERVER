import pool from '../database/db';
import { Project } from '../types';
import { generateId } from '../utils/helpers';

export const projectModel = {
  async findAll(): Promise<Project[]> {
    const [rows] = await pool.query('SELECT * FROM projects');
    return rows as Project[];
  },

  async findById(id: string): Promise<Project | null> {
    const [rows] = await pool.query('SELECT * FROM projects WHERE id = ?', [id]);
    const projects = rows as Project[];
    return projects.length > 0 ? projects[0] : null;
  },

  async create(project: Omit<Project, 'id'>): Promise<Project> {
    const newProject = { id: generateId(), ...project };
    await pool.query('INSERT INTO projects SET ?', newProject);
    return newProject;
  },

  async update(id: string, project: Partial<Project>): Promise<Project | null> {
    await pool.query('UPDATE projects SET ? WHERE id = ?', [project, id]);
    return this.findById(id);
  },

  async remove(id: string): Promise<void> {
    await pool.query('DELETE FROM projects WHERE id = ?', [id]);
  }
};
