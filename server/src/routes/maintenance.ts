import { Router } from 'express';
import {
  createRequest,
  getMyRequests,
  getVendorRequests,
  getAdminRequests,
  getRequestDetails,
  updateRequestStatus,
  addComment
} from '../controllers/maintenance';
import { protect, authorize } from '../middleware/auth';

const router = Router();

// Secure all routes
router.use(protect);

router.post('/', createRequest);
router.get('/my-requests', getMyRequests);

// Vendor & Admin restricted tickets queues
router.get('/vendor-requests', authorize('vendor', 'admin'), getVendorRequests);
router.get('/admin-requests', authorize('admin'), getAdminRequests);

// Single ticket detail view and updates
router.route('/:id')
  .get(getRequestDetails);

router.put('/:id/status', updateRequestStatus);
router.post('/:id/comments', addComment);

export default router;
