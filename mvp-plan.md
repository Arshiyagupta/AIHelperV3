# ✅ **Product Overview** – 1-liner Vision

**A therapist-like mobile app for couples to ask emotional questions about each other, with AI gently uncovering insights from the partner and delivering thoughtful, emotionally-attuned answers that strengthen the relationship.**

---

## 🧩 **Finalized MVP Features** – Must-Haves for Phase 1

| Feature                    | Description                                                                                                    |
| -------------------------- | -------------------------------------------------------------------------------------------------------------- |
| **1. Ask a Question**      | Either partner can ask a freeform question about the other (e.g., "Why is she upset with me?").                |
| **2. Clarify Intent**      | AI engages the asking partner to uncover the deeper meaning behind their question.                             |
| **3. Partner Engagement**  | AI contacts the other partner with transparency, using therapist-style empathy to explore emotional responses. |
| **4. Insight Delivery**    | AI delivers multi-layered insights (emotion + context + action suggestion) back to the asker.                  |
| **5. Push Notifications**  | Asynchronous updates when a partner responds or when insights are ready.                                       |
| **6. Relationship Memory** | AI remembers relevant past emotional data to improve personalization (hidden from UI).                         |
| **7. Red Flag Detection**  | AI stops the conversation and refers to resources if signs of abuse or serious emotional harm are detected.    |

---

## 🛣️ **Detailed User Journey**

### 🔹 1. **Home Screen**

* CTA: "Ask About Your Partner"

### 🔹 2. **Ask a Question**

* User types a freeform emotional or relational question
* Example: "What gift would she really love this year?"

### 🔹 3. **Clarify Intent**

* AI asks questions like:

  * "What inspired this question?"
  * "What do you hope your partner feels?"
  * "Is this about closeness, guilt, reconnection?"
* User responds in 1–3 messages
* AI logs emotional context

### 🔹 4. **Partner Engagement**

* AI reaches out to the other partner with consent prompt:

  > "Your partner asked something important about your relationship. Would you like to talk?"
* If yes:

  * AI gently explores emotions:

    * "How have you been feeling recently?"
    * "Is there anything that's been weighing on you emotionally?"
* Conversation is therapeutic, reflective, and paced

### 🔹 5. **Red Flag Detection (Live in Background)**

* AI passively monitors both conversations
* If potential abuse or danger is detected:

  * Conversation is halted
  * User is shown resources (e.g., hotlines)
  * Partner is informed that the session was paused for safety
  * Logged discreetly for internal review (optional scope)

### 🔹 6. **Insight Delivery**

* AI returns to the asker with:

  * Emotional Insight
  * Contextual Framing
  * Optional Action Suggestion
* Example:

  > "She's not angry — she's overwhelmed and craving quality time. A small plan this weekend might mean a lot."

### 🔹 7. **Optional Follow-Up**

* AI offers:

  * Message composition help
  * Simple connection suggestions
  * Gentle reminder setting

### 🔹 8. **Invisible AI Memory Update**

* Emotional themes, patterns, and helpful phrases are saved privately to personalize future responses.

---

## ⚠️ **Edge Case Notes**

| Scenario                                        | Solution                                                                                                                                 |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Partner doesn't respond**                     | AI waits, then informs the asker that the partner isn't ready to respond yet. No assumptions made.                                       |
| **User asks hostile or manipulative questions** | AI reflects the emotional tone back and prompts introspection: "Is this a moment of frustration, or are you looking to understand?"      |
| **Partner refuses to talk**                     | AI thanks them and informs the asker: "They weren't ready to engage right now. That's okay."                                             |
| **One-sided usage (asymmetry)**                 | AI suggests gently that balance matters: "You've asked 5x this week. Would you like to invite your partner to try asking something too?" |
| **Red flag triggers**                           | Conversation paused, referral shown, partner informed safely, issue logged if needed.                                                    |

---

## 🧱 **Tech Stack + Monetization Plan**

### 🔧 **Tech Stack (MVP Phase 1)**

| Layer                  | Tools                                                        |
| ---------------------- | ------------------------------------------------------------ |
| **Frontend**           | Flutter (for iOS)                                            |
| **Backend**            | Supabase (Auth, Firestore, RLS)                              |
| **AI**                 | OpenAI GPT-4o API (for chat + therapist-like behavior)       |
| **Push Notifications** | Firebase Cloud Messaging                                     |
| **Payment (Phase 2)**  | Stripe (not needed for MVP if free)                          |
| **Security**           | Row-level security (Supabase), private user data access only |

---

### 💸 **Monetization Plan (Post-MVP)**

| Option                       | Description                                                                                                                              |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Freemium Model**           | Free core app + optional premium features like: personalized weekly reflections, deep insight bundles, or proactive reconnection nudges. |
| **One-Time "Unlock"**        | Pay once to unlock advanced relationship memory + guided actions.                                                                        |
| **Therapist Portal (B2B2C)** | Long-term: therapists can offer this tool to couples between sessions, earning passive income and enhancing client connection.           |
| **Gift Model**               | Partners can gift subscriptions to each other as relationship gestures.                                                                  |

---