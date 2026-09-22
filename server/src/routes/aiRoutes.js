import express from 'express';
import { predictRentalPrice } from '../utils/aiPricePredictor.js';

const router = express.Router();

// @desc    Get AI/ML Predictive Pricing recommendation
// @route   POST /api/ai/predict-price
// @access  Public / Protected
router.post('/predict-price', (req, res) => {
  try {
    const {
      category,
      title,
      taskType,
      pricingUnit,
      state,
      district,
      workforceType,
      workerCount,
      specializedTasks
    } = req.body;

    const prediction = predictRentalPrice({
      category,
      title,
      taskType,
      pricingUnit,
      state,
      district,
      workforceType,
      workerCount,
      specializedTasks
    });

    return res.json(prediction);
  } catch (error) {
    console.error('[AIPricingRoute] Error predicting price:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to compute AI price prediction'
    });
  }
});

export default router;
