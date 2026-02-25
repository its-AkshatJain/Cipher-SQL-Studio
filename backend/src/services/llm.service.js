import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class LLMService {
  async getHint(question, schema, currentQuery) {
    try {
      const model = genAI.getGenerativeModel({ model: 'models/gemini-2.0-flash' });

      const schemaText = Object.entries(schema || {})
        .map(([table, cols]) => {
          const colList = Array.isArray(cols)
            ? cols.map(c => `${c.name} (${c.type})`).join(', ')
            : JSON.stringify(cols);
          return `Table "${table}": ${colList}`;
        })
        .join('\n');

      const prompt = `You are a helpful SQL tutor assisting a student in an interactive SQL learning platform called CipherSQL Studio.

ASSIGNMENT QUESTION:
${question}

DATABASE SCHEMA:
${schemaText}

STUDENT'S CURRENT QUERY:
${currentQuery?.trim() || '(no query written yet)'}

Your task: Give ONE concise hint (max 2 sentences) that nudges the student in the right direction WITHOUT revealing the answer.
- If the query is empty or barely started, hint about which table/clause to start with.
- If the query is partially correct, point out the specific issue (wrong column, missing clause, etc.).
- Be specific to THIS question and schema — do not give generic advice.
- Do NOT write any SQL code.
- Respond with only the hint text, no preamble.`;

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      return text || 'Check your WHERE clause and make sure you are selecting the correct columns.';
    } catch (error) {
      console.error('[LLM] Hint generation failed:', error.message);
      return 'Check your WHERE clause carefully — make sure the filter value matches exactly what is stored in the database.';
    }
  }
}

export default new LLMService();
