import { Agent, Topic, SurveyQuestion, Guardrails } from '@/types';

export const agents: Agent[] = [
  { id: 'agent-1', name: 'Alex', description: 'High empathy, low cognitive complexity' },
  { id: 'agent-2', name: 'Morgan', description: 'High empathy, medium cognitive complexity' },
  { id: 'agent-3', name: 'Jordan', description: 'High empathy, high cognitive complexity' },
  { id: 'agent-4', name: 'Casey', description: 'Medium empathy, low cognitive complexity' },
  { id: 'agent-5', name: 'Riley', description: 'Medium empathy, medium cognitive complexity' },
  { id: 'agent-6', name: 'Quinn', description: 'Medium empathy, high cognitive complexity' },
  { id: 'agent-7', name: 'Taylor', description: 'Low empathy, low cognitive complexity' },
  { id: 'agent-8', name: 'Avery', description: 'Low empathy, medium cognitive complexity' },
  { id: 'agent-9', name: 'Parker', description: 'Low empathy, high cognitive complexity' },
];

export const topics: Topic[] = [
  { id: 'topic-1', title: 'Order Status Inquiry', description: 'Customer asking about their order delivery status', policyText: 'Provide tracking information when available. Offer estimated delivery dates. Escalate if order is delayed more than 5 business days.', order: 1 },
  { id: 'topic-2', title: 'Product Return Request', description: 'Customer wants to return a purchased item', policyText: 'Returns accepted within 30 days with receipt. Items must be unused and in original packaging. Offer store credit or refund.', order: 2 },
  { id: 'topic-3', title: 'Billing Dispute', description: 'Customer questions a charge on their account', policyText: 'Verify customer identity before discussing billing. Review transaction history. Issue credit if error confirmed.', order: 3 },
  { id: 'topic-4', title: 'Technical Support', description: 'Customer experiencing product issues', policyText: 'Follow troubleshooting guide step by step. Document all attempted solutions. Offer replacement if under warranty.', order: 4 },
  { id: 'topic-5', title: 'Account Access Issue', description: 'Customer cannot log into their account', policyText: 'Verify identity through security questions. Reset password via secure link. Enable two-factor authentication.', order: 5 },
  { id: 'topic-6', title: 'Subscription Cancellation', description: 'Customer wants to cancel their subscription', policyText: 'Understand reason for cancellation. Offer retention incentives if applicable. Process cancellation immediately upon confirmation.', order: 6 },
  { id: 'topic-7', title: 'Product Recommendation', description: 'Customer seeking product advice', policyText: 'Ask clarifying questions about needs. Recommend based on customer preferences. Highlight current promotions.', order: 7 },
  { id: 'topic-8', title: 'Shipping Address Change', description: 'Customer needs to update delivery address', policyText: 'Changes only before shipment. Verify new address format. Confirm update via email.', order: 8 },
  { id: 'topic-9', title: 'Warranty Claim', description: 'Customer filing a warranty claim', policyText: 'Verify purchase date and warranty status. Document issue with photos if possible. Arrange replacement or repair.', order: 9 },
  { id: 'topic-10', title: 'Price Match Request', description: 'Customer found lower price elsewhere', policyText: 'Match verified competitor prices within 14 days. Must be identical item. Exclude clearance and marketplace sellers.', order: 10 },
  { id: 'topic-11', title: 'Gift Card Balance', description: 'Customer checking gift card balance', policyText: 'Provide balance after card verification. Explain expiration policies. Offer to apply to current order.', order: 11 },
  { id: 'topic-12', title: 'Damaged Item Report', description: 'Customer received damaged goods', policyText: 'Express concern and apologize. Request photos of damage. Offer immediate replacement or refund.', order: 12 },
  { id: 'topic-13', title: 'Membership Benefits', description: 'Customer inquiring about loyalty program', policyText: 'Explain tier benefits clearly. Show current points balance. Highlight upcoming promotions for members.', order: 13 },
  { id: 'topic-14', title: 'Order Modification', description: 'Customer wants to change order details', policyText: 'Modifications only before processing. May require order cancellation and reorder. Waive fees for our errors.', order: 14 },
  { id: 'topic-15', title: 'Store Location Hours', description: 'Customer asking about store information', policyText: 'Provide accurate hours and location. Mention holiday schedule changes. Offer online alternatives.', order: 15 },
  { id: 'topic-16', title: 'Payment Method Update', description: 'Customer updating payment information', policyText: 'Secure verification required. Guide through self-service option. Never ask for full card numbers.', order: 16 },
  { id: 'topic-17', title: 'Promotional Code Issue', description: 'Customer code not working', policyText: 'Verify code validity and restrictions. Apply manually if system error. Offer alternative if expired.', order: 17 },
  { id: 'topic-18', title: 'Product Availability', description: 'Customer checking stock status', policyText: 'Provide real-time inventory info. Offer waitlist for out-of-stock. Suggest similar alternatives.', order: 18 },
  { id: 'topic-19', title: 'Complaint Escalation', description: 'Customer requesting manager', policyText: 'Listen actively to concerns. Attempt resolution first. Escalate promptly if requested.', order: 19 },
  { id: 'topic-20', title: 'Feedback Submission', description: 'Customer providing service feedback', policyText: 'Thank customer for feedback. Document all comments. Follow up on actionable items.', order: 20 },
];

export const aiLiteracySurveyQuestions: SurveyQuestion[] = [
  { id: 'lit-1', text: 'I understand how AI-powered chatbots process and generate responses.', category: 'Technical Understanding' },
  { id: 'lit-2', text: 'I can identify when I am interacting with an AI versus a human agent.', category: 'Recognition' },
  { id: 'lit-3', text: 'I am aware of the limitations of AI in customer service contexts.', category: 'Awareness' },
  { id: 'lit-4', text: 'I feel comfortable using AI-powered customer service tools.', category: 'Comfort' },
  { id: 'lit-5', text: 'I believe AI can provide accurate information for customer service inquiries.', category: 'Trust' },
  { id: 'lit-6', text: 'I understand that AI systems learn from data and may reflect biases.', category: 'Critical Awareness' },
  { id: 'lit-7', text: 'I can effectively communicate my needs to an AI chatbot.', category: 'Self-Efficacy' },
  { id: 'lit-8', text: 'I am familiar with how companies use AI to improve customer experiences.', category: 'Industry Knowledge' },
];

export const postTopicSurveyQuestions: SurveyQuestion[] = [
  { id: 'post-1', text: 'The agent understood my questions and concerns.', category: 'Understanding' },
  { id: 'post-2', text: 'The agent provided helpful and relevant information.', category: 'Helpfulness' },
  { id: 'post-3', text: 'The agent communicated in a clear and understandable way.', category: 'Clarity' },
  { id: 'post-4', text: 'The agent showed empathy towards my situation.', category: 'Empathy' },
  { id: 'post-5', text: 'I felt the agent was professional throughout the conversation.', category: 'Professionalism' },
  { id: 'post-6', text: 'The agent resolved my issue to my satisfaction.', category: 'Resolution' },
  { id: 'post-7', text: 'I would interact with this agent again for future inquiries.', category: 'Future Intent' },
  { id: 'post-8', text: 'The response time during the conversation was acceptable.', category: 'Efficiency' },
  { id: 'post-9', text: 'The agent provided accurate information.', category: 'Accuracy' },
  { id: 'post-10', text: 'I felt comfortable sharing my concerns with the agent.', category: 'Comfort' },
  { id: 'post-11', text: 'The agent anticipated my needs before I expressed them.', category: 'Proactivity' },
  { id: 'post-12', text: 'The conversation felt natural and human-like.', category: 'Naturalness' },
  { id: 'post-13', text: 'The agent handled any confusion or misunderstanding well.', category: 'Error Handling' },
  { id: 'post-14', text: 'I trust the information provided by the agent.', category: 'Trust' },
  { id: 'post-15', text: 'The overall experience met my expectations.', category: 'Satisfaction' },
  { id: 'post-16', text: 'I would recommend this service to others.', category: 'Recommendation' },
];

export const globalGuardrails: Guardrails = {
  id: 'guardrails-1',
  title: 'Global Service Guardrails',
  content: `
## Communication Standards
- Maintain professional and respectful tone at all times
- Use clear, jargon-free language accessible to all customers
- Acknowledge customer emotions and frustrations appropriately

## Data Privacy
- Never request sensitive information (SSN, full credit card numbers)
- Verify customer identity before discussing account details
- Inform customers when conversations may be recorded

## Escalation Protocol
- Escalate immediately for legal threats or safety concerns
- Transfer to human agent when requested by customer
- Document all escalation reasons for quality improvement

## Response Guidelines
- Aim for resolution within the conversation when possible
- Provide clear next steps and expected timelines
- Follow up on unresolved issues within 24 hours
  `.trim(),
};

export const mockAgentResponses: string[] = [
  "Thank you for reaching out. I'd be happy to help you with that.",
  "I understand your concern. Let me look into this for you.",
  "I appreciate your patience while I review your account.",
  "That's a great question. Here's what I can tell you...",
  "I want to make sure I understand correctly. You're asking about...",
  "I apologize for any inconvenience this may have caused.",
  "Let me see what options we have available for you.",
  "I've found the information you need. Here's what I can share...",
  "Is there anything else I can help you with today?",
  "Thank you for bringing this to our attention.",
];
