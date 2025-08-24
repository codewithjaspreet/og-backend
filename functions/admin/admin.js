
// Admin operations for Organized Gym management system
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { gymInputSchema } from '../schema/gym_schema.js';
import { gymPlansInputSchema } from '../schema/gym_plans_schema.js';

// Constants
const COLLECTIONS = {
  GYMS: 'gym',
  GYM_PLANS: 'gym_plans',
  USERS: 'users'
};



const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
};

const handleErrorResponse = (res, error, context = '') => {
  // Handle validation errors
  if (error?.issues && Array.isArray(error.issues)) {
    const details = error.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    }));
    
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      status: false,
      error: 'ValidationError',
      message: 'Invalid request payload',
      details,
    });
  }

  // Log error for debugging
  console.error(`Error in ${context}:`, {
    message: error.message,
    stack: error.stack,
    code: error.code
  });

  // Handle Firebase Auth errors
  if (error.code && error.code.startsWith('auth/')) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      status: false,
      error: 'AuthenticationError',
      message: error.message,
    });
  }

  // Generic server error
  return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    status: false,
    error: error?.code || 'InternalServerError',
    message: error?.message || `Failed to ${context}`,
  });
};
// Main Controller Functions

/**
 * Add a new gym to the system
 */
const addGym = async (req, res) => {
  try {
    const gymCollection = getFirestore().collection(COLLECTIONS.GYMS);
    const validatedData = gymInputSchema.parse(req.body ?? {});

    const gymDocument = await gymCollection.add({
      ...validatedData,
      created_at: FieldValue.serverTimestamp(),
      updated_at: FieldValue.serverTimestamp(),
    });


    return res.status(HTTP_STATUS.CREATED).json({
      status: true,
      message: 'Gym added successfully',
      gym_id: gymDocument.id,
    });

  } catch (error) {
    return handleErrorResponse(res, error, 'add gym');
  }
};

/**
 * Add gym plans to the system
 */
const addGymPlans = async (req, res) => {
  try {
    const gymPlansCollection = getFirestore().collection(COLLECTIONS.GYM_PLANS);
    const validatedData = gymPlansInputSchema.parse(req.body ?? {});

    const gymPlansDocument = await gymPlansCollection.add({
      ...validatedData,
      created_at: FieldValue.serverTimestamp(),
      updated_at: FieldValue.serverTimestamp(),
    });


    return res.status(HTTP_STATUS.CREATED).json({
      status: true,
      message: 'Gym plans added successfully',
      gym_plans_id: gymPlansDocument.id,
    });

  } catch (error) {
    return handleErrorResponse(res, error, 'add gym plans');
  }
};



export {
  addGym,
  addGymPlans
};