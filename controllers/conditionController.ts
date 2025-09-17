import { Request, Response, NextFunction } from 'express';
const Condition = require('../models/conditionModel');
const factory = require('./handlerFactory');

// Basic CRUD operations for Conditions using handlerFactory
exports.getAllConditions = factory.getAll(Condition);
exports.getCondition = factory.getOne(Condition);
exports.createCondition = factory.createOne(Condition);
exports.updateCondition = factory.updateOne(Condition);
exports.deleteCondition = factory.deleteOne(Condition);

// Get conditions by system
exports.getConditionsBySystem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { systemSlug } = req.params;
    const System = require('../models/systemModel');
    
    const system = await System.findOne({ slug: systemSlug });
    if (!system) {
      return res.status(404).json({
        status: 'fail',
        message: 'No system found with that slug'
      });
    }

    const conditions = await Condition.find({ system: system._id })
      .select('-__v')
      .sort({ severity: 1, name: 1 });

    res.status(200).json({
      status: 'success',
      results: conditions.length,
      data: {
        conditions
      }
    });
  } catch (err) {
    next(err);
  }
};
