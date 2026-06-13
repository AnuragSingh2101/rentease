import { Router } from 'express';
import {
  createDamageClaim,
  updateDamageClaimStatus,
  getMyClaims,
  getVendorClaims,
  getAdminClaims
} from '../controllers/damageClaims';
import { protect, authorize } from '../middleware/auth';

const router = Router();

// Secure all routes
router.use(protect);

// Customer endpoints
router.route('/my-claims')
  .get(getMyClaims);

// Vendor endpoints
router.route('/')
  .post(authorize('vendor', 'admin'), createDamageClaim);

router.route('/vendor-claims')
  .get(authorize('vendor', 'admin'), getVendorClaims);

// Admin-only endpoints
router.route('/admin-claims')
  .get(authorize('admin'), getAdminClaims);

router.route('/:id/status')
  .put(authorize('admin'), updateDamageClaimStatus);

export default router;
