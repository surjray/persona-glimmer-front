import { query } from '../config/database';

// 10 Policy Pairs × 2 Scenarios = 20 Research Topics
// Each pair has: Utilitarian (U) - Functional Loss, Hedonic (H) - Experiential Loss

const topics = [
  // ========== PAIR 1: FOOD DELIVERY 🍔 ==========
  {
    id: 1,
    title: 'Missing Food Item',
    domain: 'Food Delivery',
    scenario_type: 'utilitarian',
    policy_pair_id: 1,
    stimulus_text: `You ordered dinner for yourself and your family through a food delivery app. When the order arrived, you noticed that the main entrée—a large chicken shawarma platter that was meant to feed three people—was completely missing from the bag. The sides and drinks were there, but without the main dish, no one has enough to eat. You're hungry, your family is waiting, and you need this resolved.`,
    initial_customer_message: `Hi, I just received my food delivery order and the main dish is completely missing. My order number is #FD-847291. The chicken shawarma platter that was supposed to feed my whole family isn't in the bag. We're all hungry and waiting. Can you help?`,
    topic_specific_policy: `POLICY: Handling Missing Items in Food Delivery

AGENT WORKFLOW:
1. Identify the customer's issue type: Missing item(s)
2. Request only essential information: Order reference, Affected item(s), Description of the issue
3. Categorize severity: High (entrée missing - cannot feed family)
4. Select resolution: Full refund OR Redelivery of missing item (customer choice)

RESOLUTION FOCUS:
- Prioritize getting food to the customer quickly
- Offer either redelivery of the missing item or full refund so they can order elsewhere
- Speed matters - family is hungry and waiting

ESCALATION TRIGGERS:
- Tampering, broken seals, or foreign objects reported
- Allergens missing or incorrect substitutions
- Food reported as undercooked, spoiled, or causing illness
- Repeated complaint from customer
- Customer requests action beyond authorization`,
    order_index: 1,
  },
  {
    id: 2,
    title: 'Messy Food Presentation',
    domain: 'Food Delivery',
    scenario_type: 'hedonic',
    policy_pair_id: 1,
    stimulus_text: `You ordered a special meal from your favorite restaurant through a delivery app to celebrate a small personal milestone. When you opened the containers, the food was a complete mess—sauces had spilled everywhere, the presentation was ruined, toppings were scattered, and containers were crushed. Everything is technically edible, but the experience you were looking forward to is completely spoiled.`,
    initial_customer_message: `Hi, I just received my food order and it's a total mess. I ordered this for a special occasion, but everything is spilled and crushed. The containers leaked everywhere and the food looks terrible. Order #FD-923156. I know it's probably still edible but this really ruined what was supposed to be a nice moment. Can you help?`,
    topic_specific_policy: `POLICY: Handling Poorly Presented Items in Food Delivery

AGENT WORKFLOW:
1. Identify the customer's issue type: Messy presentation affecting experience
2. Request only essential information: Order reference, Description of the issue
3. Categorize severity: Medium (messy but edible - experiential loss)
4. Select resolution: Partial refund OR Account credit

RESOLUTION FOCUS:
- Acknowledge the emotional disappointment - this was a special occasion
- The food is functional but the anticipated enjoyment is destroyed
- Offer credit or partial refund to make up for the ruined experience, not just functional loss
- Validate feelings about the special moment being spoiled

ESCALATION TRIGGERS:
- Tampering, broken seals, or foreign objects reported
- Food reported as undercooked, spoiled, or causing illness
- Repeated complaint from customer
- Customer requests action beyond authorization`,
    order_index: 2,
  },

  // ========== PAIR 2: RIDE-HAILING 🚗 ==========
  {
    id: 3,
    title: 'Inefficient Route Delay',
    domain: 'Ride-Hailing',
    scenario_type: 'utilitarian',
    policy_pair_id: 2,
    stimulus_text: `You booked a ride to get to an important job interview on time. The driver took an unnecessarily long route, ignoring the GPS suggestions and going through side streets. What should have been a 20-minute ride took 40 minutes, and you arrived 10 minutes late to your interview. You're upset about the wasted time and the potential impact on your opportunity.`,
    initial_customer_message: `Hi, I need to report a problem with my ride. Trip ID #RH-55829. I had an important job interview and the driver took a completely inefficient route. A 20-minute trip took 40 minutes and I was late to my interview. The driver ignored the GPS and went through random side streets. This may have cost me a job opportunity. What can you do about this?`,
    topic_specific_policy: `POLICY: Handling Route Inefficiency in Ride-Hailing

AGENT WORKFLOW:
1. Determine complaint is about Functional loss (inefficient route causing delay)
2. Collect basic details: Trip ID, arrival time impact, description of concern
3. Classify severity: High (significant delay, missed high-stakes appointment)
4. Offer resolution: Full fare refund PLUS additional credit given high stakes

RESOLUTION FOCUS:
- Acknowledge the concrete harm (lateness, potential job impact)
- This is measurable, practical harm to customer's goals
- Offer fare refund and consider additional credit given the high stakes
- Time wasted has real-world consequences

ESCALATION TRIGGERS:
- Threatening, discriminatory, or aggressive behavior from driver
- Rider feeling unsafe or requesting formal follow-up
- Delay resulting in missed high-stakes appointment (flight, interview)
- Repeated issues with same driver`,
    order_index: 3,
  },
  {
    id: 4,
    title: 'Uncomfortable Ride Experience',
    domain: 'Ride-Hailing',
    scenario_type: 'hedonic',
    policy_pair_id: 2,
    stimulus_text: `You took a ride to meet friends for dinner. The driver was playing loud music you didn't enjoy, made several personal phone calls during the trip, and the car had an unpleasant smell. You arrived on time, but the entire ride was uncomfortable and stressful. What should have been a relaxing trip left you feeling tense and annoyed before your evening out.`,
    initial_customer_message: `Hi, I want to report a very uncomfortable ride experience. Trip ID #RH-67234. The driver had loud music blasting, made personal calls the whole time, and the car smelled bad. I got to my destination on time but the whole experience was really unpleasant and stressful. I was meeting friends and arrived feeling tense instead of relaxed. Is there anything you can do?`,
    topic_specific_policy: `POLICY: Handling Uncomfortable Ride Experiences

AGENT WORKFLOW:
1. Determine complaint is about Experiential loss (uncomfortable interaction, arrived on time)
2. Collect basic details: Trip ID, description of discomfort
3. Classify severity: Medium (clear discomfort but no functional failure)
4. Offer resolution: Partial refund OR account credit

RESOLUTION FOCUS:
- Validate the discomfort even though arrival was on time
- No functional failure but the experience was unpleasant
- Emotional stress before a social event matters
- Offer credit or partial refund acknowledging the poor experience

ESCALATION TRIGGERS:
- Threatening, discriminatory, or aggressive behavior from driver
- Rider feeling unsafe or requesting formal follow-up
- Harassment, physical contact, or intoxicated driving
- Customer requests formal complaint`,
    order_index: 4,
  },

  // ========== PAIR 3: AIRLINE ✈️ ==========
  {
    id: 5,
    title: 'Dietary Meal Not Provided',
    domain: 'Airline',
    scenario_type: 'utilitarian',
    policy_pair_id: 3,
    stimulus_text: `You pre-ordered a special vegetarian meal for your 8-hour international flight because you have dietary restrictions. When meal service came, the flight attendants said they had no record of your request and all vegetarian options were gone. You couldn't eat the regular meals due to your dietary needs and had to go hungry for the remainder of a very long flight.`,
    initial_customer_message: `Hi, I need help with a serious issue from my flight. Flight #AL-892, seat 24C. I pre-ordered a vegetarian meal because I have dietary restrictions, but when meal service came, they said there was no record of it and no vegetarian options left. I couldn't eat anything on an 8-hour flight. I went hungry the entire time. This was really difficult. Can you help?`,
    topic_specific_policy: `POLICY: Handling Dietary Meal Requirements Not Met

AGENT WORKFLOW:
1. Establish the missing meal was for medical/dietary requirement (Functional loss)
2. Gather details: Flight number/date, Meal type ordered, Alternative food access during flight
3. Classify severity: High (dietary/medical restriction unmet, extended fasting)
4. Offer resolution: Full meal refund PLUS additional compensation for discomfort

RESOLUTION FOCUS:
- Take seriously—this is a failure with physical consequences
- Customer could not eat due to dietary restrictions
- Physical discomfort and health implications over a long flight
- Full meal refund plus additional compensation for the discomfort
- Consider escalation to ensure it doesn't recur

ESCALATION TRIGGERS:
- Passenger reports illness or significant health impact
- Medical, allergy-sensitive, or religious dietary restrictions unmet
- Pattern of repeated non-fulfillment on same route
- Customer demands formal documentation`,
    order_index: 5,
  },
  {
    id: 6,
    title: 'Premium Meal Disappointment',
    domain: 'Airline',
    scenario_type: 'hedonic',
    policy_pair_id: 3,
    stimulus_text: `You paid extra for a premium meal upgrade on your flight, expecting a special dining experience. When the meal arrived, it was cold, the portions were smaller than advertised, and the quality was far below what was shown in the menu photos. Other food options were available, but you didn't get the premium experience you paid for and were looking forward to.`,
    initial_customer_message: `Hi, I'm disappointed with the premium meal I paid extra for on my flight. Flight #AL-445, seat 12A. I upgraded specifically for the dining experience shown in the menu, but what I got was cold, tiny portions, and nothing like the photos. I could eat other food, but I paid for something special and didn't get it at all. This really took away from my flight experience. What can be done?`,
    topic_specific_policy: `POLICY: Handling Premium Meal Disappointment

AGENT WORKFLOW:
1. Establish the missing meal was to enhance experience (Experiential loss)
2. Gather details: Flight number/date, Meal type ordered, Whether meal was paid
3. Classify severity: Medium (paid meal not served as expected, no medical concern)
4. Offer resolution: Full premium meal refund PLUS travel credit or miles

RESOLUTION FOCUS:
- Customer could still eat (other options available)
- But didn't get the enhanced experience they paid for
- This is disappointment, not necessity
- Refund the premium meal upgrade cost
- Offer additional credit or miles as goodwill

ESCALATION TRIGGERS:
- Pattern of repeated non-fulfillment on same route
- Customer demands formal documentation
- Legal or regulatory request tied to airline service`,
    order_index: 6,
  },

  // ========== PAIR 4: HOTEL 🏨 ==========
  {
    id: 7,
    title: 'Room Not Ready - Work Impact',
    domain: 'Hotel',
    scenario_type: 'utilitarian',
    policy_pair_id: 4,
    stimulus_text: `You arrived at your hotel for a business trip after a long flight and needed to prepare for an important presentation the next morning. Despite booking an early check-in, your room wasn't ready for over 2 hours. You couldn't access your luggage to change or set up your laptop to work. The delay significantly cut into your preparation time for a critical business meeting.`,
    initial_customer_message: `Hi, I had a really frustrating experience at check-in. Reservation #HT-29384. I booked and paid for early check-in because I had an important business presentation to prepare for. I arrived after a long flight, but my room wasn't ready for over 2 hours. I couldn't change clothes, couldn't work on my laptop, lost critical preparation time. This was a business trip and the delay really impacted my work. What can you do?`,
    topic_specific_policy: `POLICY: Handling Room Not Ready - Work Impact

AGENT WORKFLOW:
1. Determine guest experienced Functional loss (delay interfered with work preparation)
2. Collect context: Scheduled vs. actual check-in time, Duration of delay, Guest plans impacted
3. Classify severity: High (90+ min, missed key work preparation)
4. Offer resolution: Refund early check-in fee, credit toward future stay, room upgrade

RESOLUTION FOCUS:
- Acknowledge the professional impact
- Lost critical work preparation time is concrete harm
- Couldn't perform necessary tasks for important meeting
- Refund early check-in fee
- Offer credit toward future stay
- Consider upgrade for current or future booking

ESCALATION TRIGGERS:
- Guest missed a formal event or work obligation due to delay
- Guest has accessibility, health, or childcare needs unmet by delay
- Guest expresses emotional distress or demands formal follow-up
- Multiple delays across same property`,
    order_index: 7,
  },
  {
    id: 8,
    title: 'Room Not Ready - Vacation Start',
    domain: 'Hotel',
    scenario_type: 'hedonic',
    policy_pair_id: 4,
    stimulus_text: `You arrived at a resort hotel to start your long-awaited vacation. You were excited to begin relaxing, but your room wasn't ready for over 2 hours despite your scheduled check-in time. You had to wait in the lobby with your luggage, unable to start enjoying the amenities or unwind after your journey. The delay put a damper on the start of your vacation.`,
    initial_customer_message: `Hi, I'm really disappointed with how my vacation started. Reservation #HT-38571. I'd been looking forward to this trip for months, but when I arrived, my room wasn't ready for over 2 hours. I just sat in the lobby with my bags, couldn't relax, couldn't use the pool, couldn't start my vacation. I was so excited and the whole beginning of my trip was just waiting around. This really affected my mood. Can you help?`,
    topic_specific_policy: `POLICY: Handling Room Not Ready - Vacation Impact

AGENT WORKFLOW:
1. Determine guest experienced Experiential loss (felt unwelcome, disappointed)
2. Collect context: Duration of delay, Guest expectations for vacation start
3. Classify severity: High (90+ min, significant emotional disappointment)
4. Offer resolution: Amenity credits (spa, dining), room upgrade, loyalty points

RESOLUTION FOCUS:
- Validate the emotional disappointment
- No work impact but vacation excitement deflated
- The anticipated relaxation and joy was delayed and diminished
- Offer amenity credits (spa, dining)
- Room upgrade if available
- Loyalty points to restore goodwill

ESCALATION TRIGGERS:
- Guest expresses emotional distress or demands formal follow-up
- Guest is VIP or loyalty-tier member with elevated expectations
- Multiple delays across same property`,
    order_index: 8,
  },

  // ========== PAIR 5: RETAIL 📦 ==========
  {
    id: 9,
    title: 'Damaged Item - Unusable',
    domain: 'Retail',
    scenario_type: 'utilitarian',
    policy_pair_id: 5,
    stimulus_text: `You ordered a laptop stand for your home office to improve your work setup. When the package arrived, the stand was badly bent and cracked—completely unusable. You needed this for daily work and now have to wait for a replacement while continuing to work with poor ergonomics. The damage makes the product completely non-functional for its intended purpose.`,
    initial_customer_message: `Hi, I received a damaged product that I can't use at all. Order #RT-73829. I ordered a laptop stand for my home office—I need it for work every day. It arrived badly bent and cracked, completely unusable. I can't even set it up. I need this for my daily work setup and now I'm stuck waiting without it. Can you help resolve this?`,
    topic_specific_policy: `POLICY: Handling Damaged Products - Unusable

AGENT WORKFLOW:
1. Confirm item is unusable for its intended purpose (Functional loss)
2. Request details: Order number, Item name, Description of damage
3. Classify severity: High (unusable, ongoing work impact)
4. Offer resolution: Priority replacement shipping OR immediate refund

RESOLUTION FOCUS:
- Item cannot perform its intended function at all
- Customer has ongoing work impact while waiting for resolution
- Speed matters - priority replacement shipping or immediate refund
- The customer has an ongoing functional need

ESCALATION TRIGGERS:
- Customer received multiple damaged items in one order
- Item is high-value or limited edition
- Safety concern (exposed wires, leaking contents)
- Package tampering suspected`,
    order_index: 9,
  },
  {
    id: 10,
    title: 'Damaged Item - Gift Ruined',
    domain: 'Retail',
    scenario_type: 'hedonic',
    policy_pair_id: 5,
    stimulus_text: `You ordered a decorative item as a birthday gift for a close friend. When you opened the package to wrap it, you found the item had scratches, dents, and the beautiful packaging was crushed. The item technically still works as decor, but the damaged appearance makes it unsuitable as a gift. The birthday is tomorrow and you don't have time to get a replacement.`,
    initial_customer_message: `Hi, I'm really upset about an order I received. Order #RT-84921. I bought a decorative piece as a birthday gift for my best friend. I opened it to wrap it tonight and it's all scratched and dented, and the nice packaging is crushed. It technically works but I can't give this as a gift looking like this. The birthday is tomorrow and now I don't know what to do. This was supposed to be special. Can you help?`,
    topic_specific_policy: `POLICY: Handling Damaged Products - Gift/Special Use

AGENT WORKFLOW:
1. Confirm item is usable but appearance affected (Experiential loss for gifting)
2. Request details: Order number, Description of damage, Gift occasion
3. Classify severity: Special (gift with appearance-based value, time pressure)
4. Offer resolution: Expedited replacement if possible, full refund, additional store credit

RESOLUTION FOCUS:
- Item functions but appearance is compromised for gift-giving
- Emotional stress about time pressure and disappointing a friend
- Acknowledge the emotional stakes
- Offer expedited replacement if possible
- Full refund regardless
- Additional store credit for the stress and ruined gifting moment

ESCALATION TRIGGERS:
- Customer indicates emotional distress (missed gifting moment)
- Item is high-value or limited edition
- Time pressure for special occasion`,
    order_index: 10,
  },

  // ========== PAIR 6: SUBSCRIPTION 💳 ==========
  {
    id: 11,
    title: 'Incorrect Charge - Financial Impact',
    domain: 'Subscription',
    scenario_type: 'utilitarian',
    policy_pair_id: 6,
    stimulus_text: `You canceled your subscription service two months ago, but you just noticed you've been charged for both months since then. The unexpected charges caused your account to overdraft, resulting in additional bank fees. You now have to spend time disputing charges and dealing with your bank, all because of billing that should have stopped.`,
    initial_customer_message: `Hi, I have a serious billing issue. Account #SB-48291. I canceled my subscription two months ago but I just saw I've been charged for both months anyway. These charges caused my bank account to overdraft and I got hit with fees. I need these charges reversed and I need help with the overdraft fees this caused. I did everything right to cancel and now I'm dealing with this mess. Please help.`,
    topic_specific_policy: `POLICY: Handling Incorrect Charges - Financial Impact

AGENT WORKFLOW:
1. Determine the charge created Functional loss (financial disruption, overdraft fees)
2. Confirm details: Account ID, Date and amount of charges, Whether customer canceled
3. Classify severity: High (customer disputed with bank, financial stress)
4. Offer resolution: Full refund of both charges, reimburse overdraft fees, documentation

RESOLUTION FOCUS:
- Concrete financial harm—overdraft fees, time spent resolving
- Cascading practical consequences from billing error
- Immediate full refund of both charges
- Reimburse overdraft fees caused by the error
- Provide documentation if needed for bank dispute

ESCALATION TRIGGERS:
- Customer reports overdraft, bank dispute, or financial penalty
- Refund not visible after promised timeframe
- Repeated incorrect charges across multiple cycles
- Customer requests formal investigation or legal documentation`,
    order_index: 11,
  },
  {
    id: 12,
    title: 'Incorrect Charge - Trust Broken',
    domain: 'Subscription',
    scenario_type: 'hedonic',
    policy_pair_id: 6,
    stimulus_text: `You've been a loyal subscriber for years and always trusted the company with your payment information. You just discovered an unexpected charge on your account—a premium tier upgrade you never authorized. While the amount isn't huge, seeing unauthorized charges from a company you trusted has made you question whether your payment information is safe.`,
    initial_customer_message: `Hi, I'm really concerned about something I just noticed. Account #SB-55632. I've been a loyal customer for years, but I just saw a charge for a premium upgrade I never authorized. It's not a huge amount, but I never agreed to this. I've always trusted your company with my payment info and now I'm worried. Has my account been compromised? Why am I being charged for things I didn't sign up for? This has really shaken my trust. Can you help?`,
    topic_specific_policy: `POLICY: Handling Incorrect Charges - Trust Impact

AGENT WORKFLOW:
1. Determine the charge created Emotional loss (frustration, mistrust, brand dissatisfaction)
2. Confirm details: Account ID, Date and amount of charge, Customer loyalty history
3. Classify severity: Emotional (loss of trust, loyalty concerns)
4. Offer resolution: Immediate refund, explanation, security reassurance, goodwill credit

RESOLUTION FOCUS:
- No major financial harm but significant trust damage
- Customer is questioning security, loyalty being tested
- Address the trust issue directly
- Refund immediately
- Explain what happened
- Reassure about account security
- Offer goodwill credit to rebuild the relationship

ESCALATION TRIGGERS:
- System error suspected (unauthorized upgrade)
- Customer requests formal investigation
- Repeated incorrect charges`,
    order_index: 12,
  },

  // ========== PAIR 7: TELECOM 📡 ==========
  {
    id: 13,
    title: 'Outage - Work Disruption',
    domain: 'Telecom',
    scenario_type: 'utilitarian',
    policy_pair_id: 7,
    stimulus_text: `You work from home and had critical client meetings and deadlines today. Your internet went out this morning and has been down for 6 hours. You've missed important video calls, couldn't submit time-sensitive deliverables, and had to drive to a coffee shop to send essential emails. Your work productivity and professional reputation have been significantly impacted.`,
    initial_customer_message: `Hi, I urgently need help. Account #TC-19283. I work from home and my internet has been down for 6 hours on a critical work day. I've missed important client video calls, couldn't submit time-sensitive work, had to drive somewhere else just to send urgent emails. This is seriously impacting my job and my reputation with clients. When will service be restored and what compensation can you provide for this disruption?`,
    topic_specific_policy: `POLICY: Handling Internet Outage - Work Disruption

AGENT WORKFLOW:
1. Determine the outage disrupted work tasks (Functional loss)
2. Ask: Duration and time range of outage, Impact on work, Whether issue is resolved
3. Classify severity: Critical (urgent deadlines, work penalty)
4. Offer resolution: Significant credit beyond pro-rated amount, expedite resolution

RESOLUTION FOCUS:
- Direct professional impact—missed meetings, missed deadlines
- Reputation damage with clients is concrete work harm
- Treat as high priority
- Significant credit beyond pro-rated amount given the professional impact
- Expedite resolution and provide case reference

ESCALATION TRIGGERS:
- Customer suffered financial or academic penalty due to outage
- Customer reports repeated outages within short timeframe
- Safety concerns related to smart home or medical equipment affected
- Area shows multiple complaints`,
    order_index: 13,
  },
  {
    id: 14,
    title: 'Outage - Weekend Ruined',
    domain: 'Telecom',
    scenario_type: 'hedonic',
    policy_pair_id: 7,
    stimulus_text: `You had plans for a relaxing weekend at home—streaming movies, video calling with long-distance family, and playing online games with friends. Your internet went out Saturday morning and has been down all weekend. Your planned staycation has been ruined and you've been unable to connect with family and friends as intended.`,
    initial_customer_message: `Hi, I'm really frustrated. Account #TC-28374. My internet went out Saturday morning and it's been down all weekend. I had plans to stream movies, video chat with family who live far away, and play games with friends online. My whole relaxing weekend is ruined. I've been sitting here unable to do any of the things I was looking forward to. This was supposed to be my time to unwind and connect with people. What's going on and what can you do about this?`,
    topic_specific_policy: `POLICY: Handling Internet Outage - Personal Time Disruption

AGENT WORKFLOW:
1. Determine the outage disrupted personal downtime (Experiential loss)
2. Ask: Duration and time range of outage, Impact on personal plans
3. Classify severity: Medium (affected streaming/browsing, personal disappointment)
4. Offer resolution: Pro-rated credit PLUS goodwill credit

RESOLUTION FOCUS:
- No work impact but leisure time and social connections disrupted
- Emotional disappointment about lost relaxation time
- Validate the ruined weekend
- Pro-rated credit plus goodwill credit
- Acknowledge the personal impact of lost leisure time and family connection

ESCALATION TRIGGERS:
- Customer reports repeated outages within short timeframe
- Customer requests formal complaint or service downgrade`,
    order_index: 14,
  },

  // ========== PAIR 8: EVENTS 🎫 ==========
  {
    id: 15,
    title: 'Event Cancellation - Travel Wasted',
    domain: 'Events',
    scenario_type: 'utilitarian',
    policy_pair_id: 8,
    stimulus_text: `You bought tickets to a professional conference in another city that was important for your career development. You also booked non-refundable flights and a hotel. The conference was just canceled with little notice, and while you'll get ticket refunds, you're stuck with hundreds of dollars in travel costs you can't recover. The trip is now pointless.`,
    initial_customer_message: `Hi, I need help with a canceled event. Order #EV-73829. I had tickets to a professional conference that was just canceled. I understand I'll get the ticket refund, but I also booked non-refundable flights and hotel specifically for this event. I'm out hundreds of dollars in travel costs for a trip that's now pointless. This conference was important for my career. Is there anything you can do about my travel losses or offer any additional compensation?`,
    topic_specific_policy: `POLICY: Handling Event Cancellation - Travel Costs

AGENT WORKFLOW:
1. Determine the cancellation disrupted travel plans (Functional loss - financial)
2. Gather information: Event name/date, Ticket reference, Whether travel was affected
3. Classify severity: High (nonrefundable travel, financial loss beyond ticket)
4. Offer resolution: Full ticket refund, explore travel recovery, significant credit

RESOLUTION FOCUS:
- Concrete financial loss beyond the ticket
- Wasted money on travel that can't be recovered
- Process ticket refund quickly
- Explore if any partnership with travel providers allows partial recovery
- Offer significant credit toward future events given the financial loss

ESCALATION TRIGGERS:
- Customer incurred financial loss beyond ticket cost
- Refund not processed within published timeframe
- Customer requests legal/press escalation or formal review`,
    order_index: 15,
  },
  {
    id: 16,
    title: 'Event Cancellation - Special Occasion Lost',
    domain: 'Events',
    scenario_type: 'hedonic',
    policy_pair_id: 8,
    stimulus_text: `You bought tickets to a concert by your favorite artist as a birthday gift to yourself—an artist you've wanted to see live for over a decade. The concert was just canceled with no rescheduled date announced. You're devastated because this was a bucket-list experience you'd been counting down to for months.`,
    initial_customer_message: `Hi, I'm heartbroken about this. Order #EV-84723. I had tickets to see my absolute favorite artist—I've wanted to see them live for over 10 years. I bought these tickets as a birthday gift to myself and have been counting down for months. Now it's canceled with no new date. I know I'll get a refund but I don't care about the money, I care about the experience I've been dreaming about. This was supposed to be so special. Is there anything you can do? Any news about rescheduling?`,
    topic_specific_policy: `POLICY: Handling Event Cancellation - Emotional Impact

AGENT WORKFLOW:
1. Determine the cancellation created emotional disappointment (Experiential loss)
2. Gather information: Event significance, Whether this was a special occasion
3. Classify severity: Emotional (significant personal meaning, bucket-list experience)
4. Offer resolution: Full refund, priority notification for reschedule, credit, genuine empathy

RESOLUTION FOCUS:
- Money will be refunded but the irreplaceable experience is gone
- Deep emotional disappointment about a long-held dream
- Acknowledge the deep emotional loss—this isn't just about money
- Offer priority notification for rescheduled dates
- Credit toward other events
- Express genuine empathy for the lost experience

ESCALATION TRIGGERS:
- Cancellation affected special event (proposal, birthday, graduation)
- Customer requests formal review
- Discrepancy between organizer policy and customer experience`,
    order_index: 16,
  },

  // ========== PAIR 9: BANKING 🏦 ==========
  {
    id: 17,
    title: 'Transaction Error - Bill Unpaid',
    domain: 'Banking',
    scenario_type: 'utilitarian',
    policy_pair_id: 9,
    stimulus_text: `You scheduled an automatic payment for your rent through your bank's bill pay service. The payment failed to process due to a system error on the bank's end, and now your rent is late. Your landlord has charged you a late fee, and you're worried this could affect your rental history. You need this resolved and documented immediately.`,
    initial_customer_message: `Hi, I have an urgent issue. Account #BK-39281. I scheduled my rent payment through your bill pay system, but it failed due to an error on your end—not insufficient funds, a system error. Now my rent is late, my landlord charged me a late fee, and I'm worried about my rental history. I need this fixed immediately, I need the late fee covered, and I need documentation showing this was the bank's error. Please help.`,
    topic_specific_policy: `POLICY: Handling Transaction Errors - Practical Impact

AGENT WORKFLOW:
1. Determine the concern is outcome-based (payment failure, fees) - Functional loss
2. Confirm details: Date and type of transaction, Downstream effects (fees, penalties)
3. Classify severity: High (fees, bounced payment, potential reputational harm)
4. Offer resolution: Cover late fee, provide documentation, process payment now

RESOLUTION FOCUS:
- Concrete harm—late fee incurred, potential rental history damage
- The bank's error caused real-world financial consequences
- Acknowledge the bank's responsibility
- Cover the late fee
- Provide documentation for the landlord
- Ensure the payment goes through now

ESCALATION TRIGGERS:
- Customer reports repeated transaction errors
- Affected payment involves legal, tax, or loan obligation
- Customer reports loss of access to funds or livelihood
- Customer requests formal investigation or documentation for third parties`,
    order_index: 17,
  },
  {
    id: 18,
    title: 'Transaction Error - Anxiety and Distrust',
    domain: 'Banking',
    scenario_type: 'hedonic',
    policy_pair_id: 9,
    stimulus_text: `You noticed a transaction on your account that you don't recognize—a charge you definitely didn't make. While the amount isn't large, seeing unknown transactions has made you anxious about your account security. You trusted this bank with your money and now you're worried about what else might be wrong with your account.`,
    initial_customer_message: `Hi, I'm worried about my account. Account #BK-47293. I just noticed a transaction I definitely didn't make. It's not a huge amount, but I have no idea what it is or how it got there. I'm really anxious now—is my account compromised? What else might be wrong that I haven't noticed? I've trusted this bank for years and now I don't know if my money is safe. Can you help me understand what happened and make sure my account is secure?`,
    topic_specific_policy: `POLICY: Handling Transaction Errors - Trust and Security Concerns

AGENT WORKFLOW:
1. Determine the concern is perception-based (anxiety, trust loss) - Experiential loss
2. Confirm details: Date and type of transaction, Customer's emotional state
3. Classify severity: Emotional (anxiety, distrust, fear)
4. Offer resolution: Investigate transaction, explain, review account, reassure about security

RESOLUTION FOCUS:
- No major financial harm but significant anxiety and trust damage
- Fear about security, questioning the relationship
- Address the anxiety directly
- Investigate the transaction
- Explain what happened
- Review account for other anomalies
- Reassure about security measures in place

ESCALATION TRIGGERS:
- Potential fraud or unauthorized access suspected
- Customer expresses loss of access to funds
- Customer requests formal investigation`,
    order_index: 18,
  },

  // ========== PAIR 10: E-COMMERCE 🛒 ==========
  {
    id: 19,
    title: 'Wrong Item - Can\'t Use',
    domain: 'E-commerce',
    scenario_type: 'utilitarian',
    policy_pair_id: 10,
    stimulus_text: `You ordered a specific phone case model that fits your new phone. When the package arrived, it contained a completely different case that doesn't fit your phone at all. You needed the case for protection before traveling next week, and now you have a useless product and no protection for your device.`,
    initial_customer_message: `Hi, I received the wrong item. Order #EC-58392. I ordered a phone case specifically for my phone model because I'm traveling next week and need to protect my new phone. What arrived is a completely different case that doesn't fit my phone at all—it's for a different model entirely. Now I have a useless product and my phone is unprotected. I need the correct case before my trip. How do we fix this quickly?`,
    topic_specific_policy: `POLICY: Handling Wrong Item Delivered - Unusable

AGENT WORKFLOW:
1. Determine the wrong item impacted usage plans (Functional loss)
2. Request details: Order number, Intended item, Description of received item
3. Classify severity: High (urgent use disrupted, time-sensitive)
4. Offer resolution: Ship correct item immediately with expedited delivery

RESOLUTION FOCUS:
- Received item cannot serve its intended purpose at all
- Time-sensitive need unmet (traveling next week)
- Priority: Get the correct item shipped immediately with expedited delivery
- Provide prepaid return label for wrong item or let customer keep it

ESCALATION TRIGGERS:
- Customer received wrong item more than once
- Wrong item delivered in high-value or urgent order
- Issue involves fraud risk, tampering, or shipping partner error`,
    order_index: 19,
  },
  {
    id: 20,
    title: 'Wrong Item - Trust Shaken',
    domain: 'E-commerce',
    scenario_type: 'hedonic',
    policy_pair_id: 10,
    stimulus_text: `You ordered a limited-edition collectible item you've been searching for—something with personal sentimental value. When you eagerly opened the package, it contained a completely different, ordinary item. You're not just disappointed; you're questioning whether the listing was legitimate and whether you can trust this platform for special purchases.`,
    initial_customer_message: `Hi, I'm really upset about what I received. Order #EC-67481. I ordered a limited-edition collectible that I've been searching for—it has real sentimental meaning to me. I was so excited when it arrived. But when I opened it, it was completely wrong—just some ordinary item, not what was advertised at all. Was the listing even real? I trusted this platform for something special and now I feel deceived. This wasn't just any purchase to me. Can you help me understand what happened?`,
    topic_specific_policy: `POLICY: Handling Wrong Item Delivered - Trust Impact

AGENT WORKFLOW:
1. Determine the wrong item impacted trust in the brand (Experiential loss)
2. Request details: Order number, Expected item significance, Received item
3. Classify severity: Experiential (disappointment, trust loss, platform confidence)
4. Offer resolution: Investigate listing, full refund, significant goodwill credit

RESOLUTION FOCUS:
- Not just disappointment but questioning trust in the platform
- Was this a scam? Can they trust future purchases?
- Address the trust issue head-on
- Investigate the listing legitimacy
- Provide explanation
- Full refund
- Significant goodwill credit
- Restore confidence that the platform is trustworthy

ESCALATION TRIGGERS:
- Customer received wrong item more than once
- Customer is loyalty/VIP tier member
- Issue involves fraud risk, tampering
- Customer demands formal follow-up or legal documentation`,
    order_index: 20,
  },
];

export async function seedTopics() {
  console.log('Seeding research topics (10 Policy Pairs × 2 Scenarios)...');

  for (const topic of topics) {
    await query(
      `INSERT INTO topics (id, title, stimulus_text, topic_specific_policy, order_index, domain, scenario_type, policy_pair_id, initial_customer_message)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (id) DO UPDATE SET
         title = EXCLUDED.title,
         stimulus_text = EXCLUDED.stimulus_text,
         topic_specific_policy = EXCLUDED.topic_specific_policy,
         order_index = EXCLUDED.order_index,
         domain = EXCLUDED.domain,
         scenario_type = EXCLUDED.scenario_type,
         policy_pair_id = EXCLUDED.policy_pair_id,
         initial_customer_message = EXCLUDED.initial_customer_message,
         updated_at = NOW()`,
      [
        topic.id,
        topic.title,
        topic.stimulus_text,
        topic.topic_specific_policy,
        topic.order_index,
        topic.domain,
        topic.scenario_type,
        topic.policy_pair_id,
        topic.initial_customer_message,
      ]
    );
  }

  console.log('✓ Topics seeded successfully');
  console.log('✓ 20 research topics loaded (10 Utilitarian + 10 Hedonic)');
  console.log('  - Pair 1: Food Delivery (Missing Item / Messy Presentation)');
  console.log('  - Pair 2: Ride-Hailing (Route Delay / Uncomfortable Ride)');
  console.log('  - Pair 3: Airline (Dietary Meal / Premium Meal)');
  console.log('  - Pair 4: Hotel (Work Impact / Vacation Start)');
  console.log('  - Pair 5: Retail (Unusable Damage / Gift Ruined)');
  console.log('  - Pair 6: Subscription (Financial Impact / Trust Broken)');
  console.log('  - Pair 7: Telecom (Work Disruption / Weekend Ruined)');
  console.log('  - Pair 8: Events (Travel Wasted / Special Occasion Lost)');
  console.log('  - Pair 9: Banking (Bill Unpaid / Anxiety and Distrust)');
  console.log('  - Pair 10: E-commerce (Can\'t Use / Trust Shaken)');
}
