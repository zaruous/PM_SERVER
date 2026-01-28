import { Request, Response } from 'express';
import { assignmentModel } from '../models/assignment.model';

export const assignmentController = {
  async getAllAssignments(req: Request, res: Response) {
    try {
      const assignments = await assignmentModel.findAll();
      res.json(assignments);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching assignments', error });
    }
  },

  async getAssignmentById(req: Request, res: Response) {
    try {
      const assignment = await assignmentModel.findById(req.params.id as string);
      if (assignment) {
        res.json(assignment);
      } else {
        res.status(404).json({ message: 'Assignment not found' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Error fetching assignment', error });
    }
  },

  async createAssignment(req: Request, res: Response) {
    try {
      const newAssignment = await assignmentModel.create(req.body);
      res.status(201).json(newAssignment);
    } catch (error) {
      res.status(500).json({ message: 'Error creating assignment', error });
    }
  },

  async updateAssignment(req: Request, res: Response) {
    try {
      const updatedAssignment = await assignmentModel.update(req.params.id as string, req.body);
      if (updatedAssignment) {
        res.json(updatedAssignment);
      } else {
        res.status(404).json({ message: 'Assignment not found' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Error updating assignment', error });
    }
  },

  async deleteAssignment(req: Request, res: Response) {
    try {
      await assignmentModel.remove(req.params.id as string);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Error deleting assignment', error });
    }
  }
};
