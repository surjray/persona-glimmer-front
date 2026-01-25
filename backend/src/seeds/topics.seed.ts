import { query } from '../config/database';

// 20 Research Topics for Customer Service Chat Platform
const topics = [
  {
    id: 1,
    title: 'Order Status Inquiry',
    stimulus_text: 'You placed an order 5 days ago and haven\'t received a shipping confirmation yet. You\'re concerned about the delivery status and want to know when you can expect your items to arrive.',
    topic_specific_policy: 'Provide tracking information when available. Offer estimated delivery dates based on order processing time. If order is delayed more than 5 business days, escalate to shipping department. Always confirm order number before providing status updates.',
    order_index: 1,
  },
  {
    id: 2,
    title: 'Product Return Request',
    stimulus_text: 'You purchased an item two weeks ago but it doesn\'t meet your expectations. You want to return it and get your money back. The item is still in its original packaging and you have your receipt.',
    topic_specific_policy: 'Returns accepted within 30 days with receipt. Items must be unused and in original packaging. Offer store credit or refund based on customer preference. Provide return shipping label if applicable. Explain return process clearly.',
    order_index: 2,
  },
  {
    id: 3,
    title: 'Billing Dispute',
    stimulus_text: 'You noticed an unexpected charge on your credit card statement from this company. You don\'t recognize the transaction and want to understand what it\'s for and potentially get it refunded.',
    topic_specific_policy: 'Verify customer identity before discussing billing details. Review transaction history carefully. If error is confirmed, issue credit immediately. If charge is legitimate, explain clearly what it was for. Always be transparent about billing.',
    order_index: 3,
  },
  {
    id: 4,
    title: 'Technical Support',
    stimulus_text: 'You recently purchased a product and are having trouble getting it to work properly. You\'ve tried following the instructions but something isn\'t working as expected. You need help troubleshooting the issue.',
    topic_specific_policy: 'Follow troubleshooting guide step by step. Document all attempted solutions. Be patient and thorough. If issue persists after troubleshooting, offer replacement if under warranty. Escalate to technical specialist if needed.',
    order_index: 4,
  },
  {
    id: 5,
    title: 'Account Access Issue',
    stimulus_text: 'You\'re trying to log into your account but can\'t remember your password. You\'ve tried resetting it but haven\'t received the email. You need to regain access to your account to check your order history.',
    topic_specific_policy: 'Verify identity through security questions or email verification. Reset password via secure link. Enable two-factor authentication if available. Guide customer through self-service password reset process. Never share password over chat.',
    order_index: 5,
  },
  {
    id: 6,
    title: 'Subscription Cancellation',
    stimulus_text: 'You\'ve been subscribed to a service for several months but no longer need it. You want to cancel your subscription and make sure you won\'t be charged again. You\'re also wondering if you can get a refund for the current billing period.',
    topic_specific_policy: 'Understand reason for cancellation. Offer retention incentives if applicable (discount, pause subscription). Process cancellation immediately upon confirmation. Confirm cancellation in writing. Explain refund policy for current period.',
    order_index: 6,
  },
  {
    id: 7,
    title: 'Product Recommendation',
    stimulus_text: 'You\'re looking to purchase a product but aren\'t sure which option would be best for your needs. You have specific requirements and want expert advice to help you make the right choice.',
    topic_specific_policy: 'Ask clarifying questions about customer needs and preferences. Recommend products based on stated requirements. Highlight current promotions or discounts. Compare options if multiple products fit needs. Never push unnecessary upsells.',
    order_index: 7,
  },
  {
    id: 8,
    title: 'Shipping Address Change',
    stimulus_text: 'You just realized you entered the wrong shipping address when placing your order. The order hasn\'t shipped yet, and you need to update it to the correct address before it\'s too late.',
    topic_specific_policy: 'Address changes only allowed before shipment. Verify new address format and completeness. Confirm update via email. If order already shipped, explain options (redirect, return to sender). Double-check address before confirming change.',
    order_index: 8,
  },
  {
    id: 9,
    title: 'Warranty Claim',
    stimulus_text: 'A product you purchased 8 months ago has stopped working. It should still be under warranty. You want to file a claim and either get it repaired or replaced. You have your purchase receipt and the product serial number.',
    topic_specific_policy: 'Verify purchase date and warranty status. Document issue thoroughly. Request photos of damage if applicable. Arrange replacement or repair based on warranty terms. Explain warranty process and timeline. Provide return shipping if needed.',
    order_index: 9,
  },
  {
    id: 10,
    title: 'Price Match Request',
    stimulus_text: 'You found the same product you\'re interested in for a lower price at another retailer. You\'d prefer to buy from this company but want to know if they can match the competitor\'s price.',
    topic_specific_policy: 'Match verified competitor prices within 14 days of purchase. Must be identical item from authorized retailer. Exclude clearance items, marketplace sellers, and limited-time promotions. Verify competitor price before matching. Process price adjustment if eligible.',
    order_index: 10,
  },
  {
    id: 11,
    title: 'Gift Card Balance',
    stimulus_text: 'You received a gift card as a present and want to check how much balance is remaining on it. You\'re also planning to use it for your next purchase and want to know if there are any expiration dates or restrictions.',
    topic_specific_policy: 'Provide balance after card verification (card number or PIN). Explain expiration policies clearly. Offer to apply balance to current order if customer wants. Explain any restrictions on gift card usage. Help with card activation if needed.',
    order_index: 11,
  },
  {
    id: 12,
    title: 'Damaged Item Report',
    stimulus_text: 'You received your order today but one of the items arrived damaged. The packaging was torn and the product inside is broken. You need to report this and get a replacement or refund.',
    topic_specific_policy: 'Express concern and apologize for inconvenience. Request photos of damage and packaging. Offer immediate replacement or full refund. Provide prepaid return label. Expedite replacement shipping. Document issue for quality improvement.',
    order_index: 12,
  },
  {
    id: 13,
    title: 'Membership Benefits',
    stimulus_text: 'You\'re a member of the loyalty program but aren\'t sure what benefits you\'re entitled to. You want to know your current points balance, what rewards you can redeem, and if there are any special member-only promotions.',
    topic_specific_policy: 'Explain tier benefits clearly based on membership level. Show current points balance and expiration dates. Highlight upcoming promotions for members. Explain how to earn and redeem points. Offer to help with redemption if interested.',
    order_index: 13,
  },
  {
    id: 14,
    title: 'Order Modification',
    stimulus_text: 'You placed an order an hour ago but just realized you selected the wrong size/color. You want to modify the order before it gets processed. You\'re also willing to cancel and reorder if that\'s easier.',
    topic_specific_policy: 'Modifications only allowed before order processing begins. May require order cancellation and reorder. Waive any fees if modification is our error. Explain options clearly. Process change immediately if possible. Confirm modification via email.',
    order_index: 14,
  },
  {
    id: 15,
    title: 'Store Location Hours',
    stimulus_text: 'You\'re planning to visit a physical store location this weekend and want to confirm their hours. You also want to know if they have a specific product in stock at that location before making the trip.',
    topic_specific_policy: 'Provide accurate hours and location details. Mention holiday schedule changes if applicable. Check inventory for specific location if possible. Offer online alternatives if product unavailable. Provide store contact information. Confirm directions if needed.',
    order_index: 15,
  },
  {
    id: 16,
    title: 'Payment Method Update',
    stimulus_text: 'Your credit card expired and you received a new one. You need to update your payment method on file so your subscription and future orders don\'t get declined. You want to make sure the update is secure.',
    topic_specific_policy: 'Secure verification required before updating payment info. Guide through self-service option in account settings. Never ask for full card numbers over chat. Explain security measures. Confirm update was successful. Update all active subscriptions if applicable.',
    order_index: 16,
  },
  {
    id: 17,
    title: 'Promotional Code Issue',
    stimulus_text: 'You have a promotional code that should give you 20% off, but when you try to apply it at checkout, it says the code is invalid or expired. You want to know why it\'s not working and if you can still use it.',
    topic_specific_policy: 'Verify code validity and check restrictions (expiration, minimum purchase, product exclusions). Apply code manually if system error. Offer alternative promotion if code expired. Explain why code didn\'t work. Provide working alternative if possible.',
    order_index: 17,
  },
  {
    id: 18,
    title: 'Product Availability',
    stimulus_text: 'You\'re interested in purchasing a specific product but want to check if it\'s currently in stock. If it\'s out of stock, you want to know when it will be available again or if you can be notified when it\'s back.',
    topic_specific_policy: 'Provide real-time inventory information if available. Offer waitlist or back-in-stock notifications for out-of-stock items. Suggest similar alternatives if product unavailable. Estimate restock dates if known. Help with pre-orders if applicable.',
    order_index: 18,
  },
  {
    id: 19,
    title: 'Complaint Escalation',
    stimulus_text: 'You\'ve had a frustrating experience with a previous interaction and feel your concern wasn\'t properly addressed. You want to speak with a manager or supervisor to have your issue resolved satisfactorily.',
    topic_specific_policy: 'Listen actively to customer concerns without being defensive. Attempt resolution first before escalating. Acknowledge frustration and apologize. Escalate promptly if customer requests or if issue requires higher authority. Ensure follow-up after escalation.',
    order_index: 19,
  },
  {
    id: 20,
    title: 'Feedback Submission',
    stimulus_text: 'You recently had a positive experience with customer service and want to share your feedback. You also have a suggestion for how the company could improve their service or products based on your experience.',
    topic_specific_policy: 'Thank customer sincerely for taking time to provide feedback. Document all comments for review. Acknowledge specific positive points mentioned. Take suggestions seriously and explain how feedback is used. Offer to follow up if customer wants updates on their suggestions.',
    order_index: 20,
  },
];

export async function seedTopics() {
  console.log('Seeding topics...');

  for (const topic of topics) {
    await query(
      `INSERT INTO topics (id, title, stimulus_text, topic_specific_policy, order_index)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO UPDATE SET
         title = EXCLUDED.title,
         stimulus_text = EXCLUDED.stimulus_text,
         topic_specific_policy = EXCLUDED.topic_specific_policy,
         order_index = EXCLUDED.order_index,
         updated_at = NOW()`,
      [
        topic.id,
        topic.title,
        topic.stimulus_text,
        topic.topic_specific_policy,
        topic.order_index,
      ]
    );
  }

  console.log('✓ Topics seeded successfully');
  console.log('✓ 20 research topics loaded with stimulus text and policies');
}
