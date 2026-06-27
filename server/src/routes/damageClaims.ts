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


router.use(protect);


router.route('/my-claims')
  .get(getMyClaims);


router.route('/')
  .post(authorize('vendor', 'admin'), createDamageClaim);

router.route('/vendor-claims')
  .get(authorize('vendor', 'admin'), getVendorClaims);


router.route('/admin-claims')
  .get(authorize('admin'), getAdminClaims);

router.route('/:id/status')
  .put(authorize('admin'), updateDamageClaimStatus);

export default router;
