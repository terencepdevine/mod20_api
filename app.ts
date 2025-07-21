const sanitizeHtml = require('sanitize-html');
const express = require('express');

import path from 'path';
import { Request, Response, NextFunction } from 'express';

const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const systemRouter = require('./routes/systemRoutes');
const roleRouter = require('./routes/roleRoutes');
const raceRouter = require('./routes/raceRoutes');
const abilityRouter = require('./routes/abilityRoutes');
const skillRouter = require('./routes/skillRoutes');
const traitRouter = require('./routes/traitRoutes');
const armorTaxonomyRouter = require('./routes/armorTaxonomyRoutes');
const weaponTaxonomyRouter = require('./routes/weaponTaxonomyRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// Set security HTTP headers
app.use(helmet());
app.use(cors());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization whitelist
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.body.introduction) {
    req.body.introduction = sanitizeHtml(req.body.introduction, {
      allowedTags: [
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'p',
        'b',
        'i',
        'strong',
        'em',
        'blockquote',
        'ul',
        'ol',
        'li'
      ],
      allowedAttributes: {}
    });
  }
  next();
});

// Serving static files
app.use(express.static(`${__dirname}/public`));

// Routes
app.use('/api/v1/systems', systemRouter);
app.use('/api/v1/roles', roleRouter);
app.use('/api/v1/races', raceRouter);
app.use('/api/v1/abilities', abilityRouter);
app.use('/api/v1/skills', skillRouter);
app.use('/api/v1/traits', traitRouter);
app.use('/api/v1/armorTaxonomy', armorTaxonomyRouter);
app.use('/api/v1/weaponTaxonomy', weaponTaxonomyRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

export default app;
