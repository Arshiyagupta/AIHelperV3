# 📚 SafeTalk MVP – Database Design (Supabase)

This schema is designed to support the SafeTalk MVP app, where romantic partners can ask emotionally sensitive questions about each other, have the AI explore with the other partner in a therapist-like conversation, and receive insights back. It also includes safety features like red flag detection, invite-code-based account linking, and secure chat history storage.

---

## 🧑‍🤝‍🧑 `users`

**Purpose:**
Stores all user accounts and their metadata. Each user is assigned a unique invite code upon sign-up, and they can manually connect to their romantic partner using that code.

**Fields:**

* `id` (UUID, Primary Key): Supabase user ID
* `email` (text): Email used for login
* `full_name` (text): User's display name
* `invite_code` (text, unique): Auto-generated code used to link with a partner
* `partner_id` (UUID, FK → users.id, nullable): The ID of the connected partner

**Key Relationships:**

* One-to-one relationship with another user via `partner_id`

---

## 🔗 `connections`

**Purpose:**
Captures metadata about the connection between two users. This is created when a user enters a valid invite code, establishing a mutual link.

**Fields:**

* `id` (UUID, Primary Key)
* `user_a_id` (UUID, FK → users.id)
* `user_b_id` (UUID, FK → users.id)
* `created_at` (timestamp): Date the connection was created

**Key Relationships:**

* Each connection is a pair of users, used to audit or review linked history

---

## ❓ `questions`

**Purpose:**
Stores each emotional or relational question submitted by a user. This is the anchor entity for the entire flow — reflections, AI interactions, and insights all attach to this.

**Fields:**

* `id` (UUID, Primary Key)
* `asker_id` (UUID, FK → users.id): The user who asked the question
* `partner_id` (UUID, FK → users.id): The intended recipient of the exploration
* `question_text` (text): The actual question
* `created_at` (timestamp)
* `status` (enum): `pending`, `processing`, `answered`, `rejected`, `red_flag`
* `red_flag_detected` (boolean): True if a safety issue was flagged

**Key Relationships:**

* Linked to `users` (asker and partner)
* One-to-many with `reflections`, `insights`, `red_flags`

---

## 🧠 `reflections`

**Purpose:**
Stores the individual AI chat transcript (structured or plain text) for either the asking partner or the responding partner. Used for contextual recall and insight generation.

**Fields:**

* `id` (UUID, Primary Key)
* `question_id` (UUID, FK → questions.id)
* `type` (enum): `asker` or `partner`
* `content` (jsonb or long text): Structured representation of the conversation
* `created_at` (timestamp)

**Key Relationships:**

* Many reflections belong to one `question`

---

## 💡 `insights`

**Purpose:**
Contains the final AI-generated output after combining both partner reflections. Includes the emotional summary, context, and recommended action.

**Fields:**

* `id` (UUID, Primary Key)
* `question_id` (UUID, FK → questions.id)
* `emotional_summary` (text): Summary of the partner's emotional state
* `contextual_summary` (text): Background and contributing factors
* `suggested_action` (text): Specific advice, phrased in a relationally supportive way
* `created_at` (timestamp)

**Key Relationships:**

* One-to-one relationship with each `question`

---

## 🚨 `red_flags`

**Purpose:**
Logs any red flags (e.g., mentions of abuse or serious safety risks) detected in conversations. This allows the system to halt the flow and redirect users to support.

**Fields:**

* `id` (UUID, Primary Key)
* `question_id` (UUID, FK → questions.id)
* `trigger_phrase` (text): The phrase or keyword that triggered the flag
* `who_triggered` (enum): `asker` or `partner`
* `timestamp` (timestamp)
* `action_taken` (text): What was shown to the user (e.g., "helpline provided")

**Key Relationships:**

* Tied to a single `question`

---

## 📲 `push_tokens`

**Purpose:**
Stores the FCM device tokens needed to send push notifications to individual users.

**Fields:**

* `user_id` (UUID, FK → users.id)
* `device_token` (text)

**Key Relationships:**

* Each user can have multiple device tokens (e.g., for different devices)

---

## 🔐 Security Notes

* Every table has **Row-Level Security (RLS)** enabled.
* Users can **only access their own data**, and only see `questions` or `reflections` where they are either the `asker_id` or `partner_id`.

---