import express from 'express';
import QueryService from '../services/query.service.js';
import LLMService from '../services/llm.service.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { sql } = req.body;
    if (!sql) {
      return res.status(400).json({ success: false, message: 'SQL query is required' });
    }

    const result = await QueryService.executeQuery(sql);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/hint', async (req, res) => {
  try {
    const { question, schema, currentQuery } = req.body;
    const hint = await LLMService.getHint(question, schema, currentQuery);
    res.json({ success: true, hint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
