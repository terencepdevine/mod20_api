const Role = require('../models/roleModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

exports.getAllRoles = factory.getAll(Role);
// exports.getAllRoles = catchAsync(async (req, res, next) => {
//   res.status(200).json({
//     status: 'success'
//   });
// });

// exports.getRole = factory.getOne(Role);
exports.getRole = catchAsync(async (req, res, next) => {
  console.log(req.params);

  const query = await Role.findById(req.params.id);
  const doc = await query;
  if (!doc) return next(new AppError('No document found with that ID', 404));

  res.status(200).json({
    status: 'success',
    data: {
      breadcrumbs: {
        // section:
      },
      role: doc
    }
  });
});

exports.createRole = factory.createOne(Role);
exports.updateRole = factory.updateOne(Role);
exports.deleteRole = factory.deleteOne(Role);
