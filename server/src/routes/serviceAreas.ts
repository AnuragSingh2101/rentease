import { Router } from 'express';
import {
  getServiceAreas,
  createServiceArea,
  updateServiceArea,
  deleteServiceArea
} from '../controllers/serviceAreas';
import { protect, authorize } from '../middleware/auth';

const router = Router();


router.route('/')
  .get(getServiceAreas);


router.use(protect);
router.use(authorize('admin'));

router.route('/')
  .post(createServiceArea);

router.route('/:id')
  .put(updateServiceArea)
  .delete(deleteServiceArea);

export default router;
