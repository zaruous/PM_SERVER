import { Request, Response } from 'express';
import { positionLevelModel } from '../models/position.model';

export const positionLevelController = {
  async getAllPositionLevels(req: Request, res: Response) {
    try {
      const positions = await positionLevelModel.findAll();
      res.json(positions);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching position levels', error });
    }
  },
};
