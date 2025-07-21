import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReview extends Document {
  review: string;
  rating: number;
  createdAt: Date;
  tour: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
}

export interface IReviewModel extends Model<IReview> {
  calcAverageRatings(tourId: mongoose.Types.ObjectId): Promise<void>;
}

const reviewSchema = new Schema<IReview>(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty!']
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    tour: {
      type: Schema.Types.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour.']
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user']
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function(this: any, next: () => void) {
  this.populate({
    path: 'user',
    select: 'name photo'
  });
  next();
});

reviewSchema.statics.calcAverageRatings = async function(tourId: mongoose.Types.ObjectId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId }
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);

  const Tour = mongoose.model('Tour');
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5
    });
  }
};

reviewSchema.post('save', function(this: IReview) {
  (this.constructor as IReviewModel).calcAverageRatings(this.tour);
});

reviewSchema.pre(/^findOneAnd/, async function(this: any, next: () => void) {
  this.r = await this.findOne();
  next();
});

reviewSchema.post(/^findOneAnd/, async function(this: any) {
  await this.r.constructor.calcAverageRatings(this.r.tour);
});

const Review: IReviewModel = mongoose.model<IReview, IReviewModel>('Review', reviewSchema);

export default Review;