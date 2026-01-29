import { Request, Response } from 'express';
import { memberModel } from '../models/member.model';

export const memberController = {
  async getAllMembers(req: Request, res: Response) {
    try {
      const members = await memberModel.findAll();
      res.json(members);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching members', error });
    }
  },

  async getMemberById(req: Request, res: Response) {
    try {
      const member = await memberModel.findById(req.params.id as string);
      if (member) {
        res.json(member);
      } else {
        res.status(404).json({ message: 'Member not found' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Error fetching member', error });
    }
  },

  async createMember(req: Request, res: Response) {
    try {
      const newMember = await memberModel.create(req.body);
      res.status(201).json(newMember);
    } catch (error: any) {
      if (error?.message?.includes('already exists')) {
        res.status(409).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Error creating member', error });
      }
    }
  },

  async updateMember(req: Request, res: Response) {
    try {
      const updatedMember = await memberModel.update(req.params.id as string, req.body);
      if (updatedMember) {
        res.json(updatedMember);
      } else {
        res.status(404).json({ message: 'Member not found' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Error updating member', error });
    }
  },

  async deleteMember(req: Request, res: Response) {
    try {
      await memberModel.remove(req.params.id as string);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Error deleting member', error });
    }
  }
};
