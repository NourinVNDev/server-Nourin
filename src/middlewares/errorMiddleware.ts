import { Request, Response, NextFunction } from 'express';

export const errorMiddleware = (
  err: Error, 
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  // Log error details to the console
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console.error(err.stack);

  // Determine status code (default to 500)
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  // Send a JSON response with error details
  res.status(statusCode).json({
    message: err.message || 'Something went wrong!',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }), // Include stack trace in development
  });
};

