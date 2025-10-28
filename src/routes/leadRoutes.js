import express from 'express';
import { getAllLeads, getLeadStats, getLeadsByStatus, getLeadById, createLead, updateLead, deleteLead } from '../controller/leadController.js';
// import { verifyToken } from '../middleware/Auth.js';

const router = express.Router();

// Lead routes
router.get('/',  getAllLeads);
router.get('/stats', getLeadStats);
router.get('/status/:status',  getLeadsByStatus);
router.get('/:id',  getLeadById);
router.post('/',  createLead);

router.patch('/:id',  updateLead);
router.delete('/:id',deleteLead);

export default router;