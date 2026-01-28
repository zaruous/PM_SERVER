import { Request, Response } from 'express';
import { projectModel } from '../models/project.model';

export const projectController = {
  async getAllProjects(req: Request, res: Response) {
    try {
      const projects = await projectModel.findAll();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching projects', error });
    }
  },

  async getProjectById(req: Request, res: Response) {
    try {
      const project = await projectModel.findById(req.params.id as string);
      if (project) {
        res.json(project);
      } else {
        res.status(404).json({ message: 'Project not found' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Error fetching project', error });
    }
  },

  async createProject(req: Request, res: Response) {
    try {
      const newProject = await projectModel.create(req.body);
      res.status(201).json(newProject);
    } catch (error) {
      res.status(500).json({ message: 'Error creating project', error });
    }
  },

  async updateProject(req: Request, res: Response) {
    try {
      const updatedProject = await projectModel.update(req.params.id as string, req.body);
      if (updatedProject) {
        res.json(updatedProject);
      } else {
        res.status(404).json({ message: 'Project not found' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Error updating project', error });
    }
  },

  async deleteProject(req: Request, res: Response) {
    try {
      await projectModel.remove(req.params.id as string);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Error deleting project', error });
    }
  }
};
