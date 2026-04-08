import OpenAI from 'openai';
import { createIssue } from './github';

export interface IssueAgentInput {
   type: 'report' | 'suggestion';
   content: string;
   command?: string;
   upvotes?: number;
   downvotes?: number;
}

export interface IssueAgentResult {
   created: boolean;
   issueUrl?: string;
   reason?: string;
}

interface LlmDecision {
   createIssue: boolean;
   reason: string;
   title: string;
   body: string;
   highPriority: boolean;
}

const client = new OpenAI({
   apiKey: process.env.DEEPSEEK_API_KEY,
   baseURL: 'https://api.deepseek.com',
});

const SYSTEM_PROMPT = `You are a triage assistant for a Discord bot project called Mariwano.
Your job is to evaluate user-submitted feedback and decide whether it warrants creating a GitHub issue.

Set "createIssue" to false when the content is:
- Too vague or ambiguous to act on
- Off-topic or unrelated to the bot
- A duplicate concept already likely tracked
- Not actionable for a developer

When you do create an issue, write a clear, developer-friendly title and body in English.
The body should include all relevant context: what happened, what was expected, and any metadata provided.

Always respond with valid JSON matching exactly this schema:
{
  "createIssue": boolean,
  "reason": string,
  "title": string,
  "body": string,
  "highPriority": boolean
}`;

function buildUserMessage(input: IssueAgentInput): string {
   const lines: string[] = [`Feedback type: ${input.type}`];

   if (input.command) lines.push(`Affected command: /${input.command}`);
   lines.push(`Content: ${input.content}`);
   if (input.upvotes !== undefined) lines.push(`Upvotes: ${input.upvotes}`);
   if (input.downvotes !== undefined) lines.push(`Downvotes: ${input.downvotes}`);

   return lines.join('\n');
}

function buildLabels(input: IssueAgentInput, highPriority: boolean): string[] {
   const labels = input.type === 'report' ? ['bug', 'ai:report'] : ['enhancement', 'ai:suggestion'];
   if (highPriority) labels.push('high-priority');
   return labels;
}

export async function runIssueAgent(input: IssueAgentInput): Promise<IssueAgentResult> {
   try {
      const response = await client.chat.completions.create({
         model: 'deepseek-chat',
         response_format: { type: 'json_object' },
         messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: buildUserMessage(input) },
         ],
      });

      const raw = response.choices[0]?.message?.content;
      if (!raw) return { created: false, reason: 'Empty response from LLM.' };

      const decision = JSON.parse(raw) as LlmDecision;

      if (!decision.createIssue) return { created: false, reason: decision.reason };

      const labels = buildLabels(input, decision.highPriority);
      const issueUrl = await createIssue(decision.title, decision.body, labels);

      return { created: true, issueUrl, reason: decision.reason };
   } catch (error) {
      console.error(`Issue agent error: ${error}`);
      return { created: false, reason: `Agent failed: ${error}` };
   }
}
