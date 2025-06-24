# ✅ SafeTalk Backend Implementation Checklist (MVP Phase 1)

---

## 📦 **1. Supabase Setup**

* [ ] Create Supabase project
* [ ] Enable Email/Password authentication
* [ ] Enable Row-Level Security (RLS) globally
* [ ] Set up Firebase Cloud Messaging (FCM) project for push notifications

---

## 🗃️ **2. Database Schema Creation**

* [ ] Create `users` table
  ⤷ Fields: `id`, `email`, `full_name`, `invite_code`, `partner_id`
  ⤷ Add unique constraint on `invite_code`

* [ ] Create `connections` table
  ⤷ Fields: `user_a_id`, `user_b_id`, `created_at`

* [ ] Create `questions` table
  ⤷ Fields: `id`, `asker_id`, `partner_id`, `question_text`, `created_at`, `status`, `red_flag_detected`

* [ ] Create `reflections` table
  ⤷ Fields: `id`, `question_id`, `type`, `content`, `created_at`

* [ ] Create `insights` table
  ⤷ Fields: `id`, `question_id`, `emotional_summary`, `contextual_summary`, `suggested_action`, `created_at`

* [ ] Create `red_flags` table
  ⤷ Fields: `id`, `question_id`, `trigger_phrase`, `who_triggered`, `timestamp`, `action_taken`

* [ ] Create `push_tokens` table
  ⤷ Fields: `user_id`, `device_token`

---

## 🔐 **3. Row-Level Security (RLS)**

* [ ] Set RLS on `users`: users can only read/write their own row
* [ ] Set RLS on `questions`: only asker or partner can access
* [ ] Set RLS on `reflections`: only linked users (asker or partner)
* [ ] Set RLS on `insights`: only asker
* [ ] Set RLS on `push_tokens`: only owner can write/delete
* [ ] Set RLS on `red_flags`: only visible to internal admin scope (or invisible by default)

---

## 🧩 **4. Invite Code System**

* [ ] Generate random `invite_code` on user signup (e.g., `SAFE-UXA7`)
* [ ] Create Edge Function: `connect_partner()`
  ⤷ Input: user\_id, partner\_invite\_code
  ⤷ Link both users and create entry in `connections`
  ⤷ Validate that neither user is already connected

---

## 💬 **5. GPT-Driven Edge Functions**

* [ ] Create Edge Function: `clarify_intent()`
  ⤷ Input: `question_text`, `asker_id`
  ⤷ Use GPT to extract emotional context
  ⤷ Save result to `reflections` (type = `asker`)

* [ ] Create Edge Function: `partner_reflection()`
  ⤷ Input: `question_id`, `partner_id`
  ⤷ Use GPT to guide therapist-style conversation with partner
  ⤷ Save to `reflections` (type = `partner`)

* [ ] Create Edge Function: `generate_insight()`
  ⤷ Combine asker + partner reflections
  ⤷ Generate: emotional summary, context, action
  ⤷ Save to `insights`

---

## 🚨 **6. Red Flag Detection**

* [ ] Create shared static keyword list (e.g., "afraid", "hit", "control", "unsafe")
* [ ] Create Edge Function: `check_red_flags()`
  ⤷ Run on every message segment in `clarify_intent()` and `partner_reflection()`
  ⤷ If match found:
  ⤷  - Set `red_flag_detected = true` in `questions`
  ⤷  - Insert into `red_flags`
  ⤷  - Trigger frontend response to halt conversation and show help resources

---

## 🔔 **7. Push Notifications**

* [ ] Store device FCM token to `push_tokens` on app launch
* [ ] On new partner question → send push notification to partner
* [ ] On insight ready → send notification to asker
* [ ] Create Edge Function or Firebase callable to trigger FCM send

---

## 🧪 **8. Final Testing & Launch Readiness**

* [ ] Test full user flow:

  * Signup → Get invite code → Connect to partner
  * Ask question → Clarify intent
  * Partner reflection → AI insight generation → Delivery
* [ ] Simulate red flag phrase → confirm proper detection and safety screen
* [ ] Verify push notifications across both roles (asker & partner)
* [ ] Set GPT rate limits (e.g., max 3 questions/day/user)
* [ ] Enable Supabase logs and monitoring
* [ ] Prepare for soft launch testing with 5–10 pairs

---