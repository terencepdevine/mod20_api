"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sanitizeHtml = require('sanitize-html');
const express = require('express');
const path_1 = __importDefault(require("path"));
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
const toolTaxonomyRouter = require('./routes/toolTaxonomyRoutes');
const userRouter = require('./routes/userRoutes');
const imageRouter = require('./routes/imageRoutes');
const pdfRouter = require('./routes/pdfRoutes');
const app = express();
// Set security HTTP headers
app.use(helmet());
// CORS configuration - allow credentials from frontend
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
// Development logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}
// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use('/public', express.static(path_1.default.join(__dirname, 'public')));
// Data sanitization against NoSQL query injection
app.use(mongoSanitize());
// Data sanitization whitelist
app.use((req, res, next) => {
    const sanitizeOptions = {
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
            'li',
            'a'
        ],
        allowedAttributes: {
            'a': ['href', 'target', 'rel']
        }
    };
    if (req.body.introduction) {
        req.body.introduction = sanitizeHtml(req.body.introduction, sanitizeOptions);
    }
    if (req.body.description) {
        req.body.description = sanitizeHtml(req.body.description, sanitizeOptions);
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
app.use('/api/v1/toolTaxonomy', toolTaxonomyRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/images', imageRouter);
app.use('/api/v1/pdfs', pdfRouter);
app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});
app.use(globalErrorHandler);
exports.default = app;
