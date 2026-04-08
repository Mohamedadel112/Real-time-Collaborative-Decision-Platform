# 📄 Product Requirements Document (PRD)

## 🧠 Product Name

**Real-Time Collaborative Decision Platform**

---

# 🎯 Objective

Build a real-time collaborative system that enables users to make group decisions using:

* Weighted voting
* Real-time updates (WebSocket)
* Reputation & trust system
* No AI dependency (pure backend logic)

---

# 👥 User Roles

| Role         | Description                                |
| ------------ | ------------------------------------------ |
| Guest        | New user with no reputation                |
| User         | Regular participant                        |
| Trusted User | Invited by Admin (higher initial trust)    |
| Expert       | High-performing user with domain expertise |
| Admin        | Room owner / moderator                     |

---

# 🧩 Core Features

## 1. Rooms

* Create rooms
* Join / leave rooms
* Real-time presence tracking

## 2. Decisions

* Create decisions inside rooms
* Multiple selectable options

## 3. Voting System

* One vote per user per decision
* Dynamic weight calculation

## 4. Real-Time Updates

* Live updates using WebSocket

## 5. Reputation System

* Users gain/lose reputation based on decision accuracy

---

# 🧠 Weight Calculation

```
weight = base(role)
       + trusted_bonus
       + warm_start
       + skill_match
       + participation_bonus
       + verification_bonus
```

---

# 🧪 Use Cases (Scenarios)

## Scenario 1: Software Team Decision

* Team votes on using NestJS vs Express
* Experts have higher influence

## Scenario 2: Corporate Decision

* Employees vote on internal policy
* Admin validates outcome

## Scenario 3: Education

* Students vote on answers
* System evaluates correctness via consensus

## Scenario 4: Community Poll

* Users vote on events
* Peer validation ensures fairness

---

# 🔄 System Flow

1. User joins room
2. WebSocket connection established
3. Decision is displayed
4. User submits vote
5. Weight is calculated
6. Redis updates state
7. Decision engine recalculates results
8. Broadcast updates to all users

---

# 🧠 Decision Validation

## Confidence-Based

```
confidence = winning_weight / total_weight
```

* > 70% → Valid
* 50–70% → Weak
* < 50% → Invalid

---

## Manual Validation

* Admin selects correct decision after voting

---

## Peer Review

* Users validate decision correctness post-voting

---

## Hybrid Model

* Combine:

  * Weighted voting
  * Confidence score
  * Manual validation (optional)
  * Peer review (optional)

---

# 🧠 Trusted User Logic

* If user is invited by Admin:

```
isInvitedByAdmin = true → +2 weight
```

---

# 🧠 Expert Promotion

## Conditions

```
reputation > 100
accuracy > 70%
votesCount > 50
```

## Notes

* Domain-based expertise
* Dynamic (can be downgraded)

---

# ⚠️ Edge Cases & Solutions

## 1. New User with No Reputation

* Solution: Warm start + bonuses

## 2. Spam / Fake Accounts

* Solution: Redis rate limiting + verification

## 3. Duplicate Voting

* Solution: DB unique constraint + Redis locks

## 4. Race Conditions

* Solution: Atomic operations in Redis

## 5. Expert Bias

* Solution: Weight cap + normalization

## 6. Weak Decision

* Solution: Re-vote or manual validation

## 7. User Disconnect

* Solution: Reconnect logic + Redis session

## 8. Admin Abuse

* Solution: Invite limits + audit logs

---

# 🏗️ Architecture

* Backend: NestJS
* Database: PostgreSQL (Prisma)
* Cache & Messaging: Redis
* Real-time: WebSocket
* Containerization: Docker

---

# 🎨 Design Patterns

* Strategy Pattern (Weight calculation)
* Observer Pattern (WebSocket updates)
* Pub/Sub Pattern (Redis)
* State Pattern (User roles)
* Repository Pattern (Prisma)

---

# ✅ Functional Requirements

* Create and manage rooms
* Create decisions with options
* Allow weighted voting
* Real-time updates
* Reputation tracking
* Decision validation

---

# 🚀 Non-Functional Requirements

* Low latency (<100ms)
* High scalability
* Fault tolerance
* Security (JWT + rate limiting)

---

# 💡 Future Enhancements

* Analytics dashboard
* Explainable decision system
* Gamification (badges, rewards)

---

# 🛠️ Technologies

* NestJS
* Prisma ORM
* PostgreSQL
* Redis
* WebSocket
* Docker

---

# 🧱 NestJS Modules Structure

## 🔹 Core Modules

### CommonModule

* helpers
* utils
* constants

### ConfigModule

* env variables
* app config

### DatabaseModule

* PrismaService
* DB connection

### RedisModule

* Redis client
* pub/sub
* locks
* rate limiting

---

## 🧠 Auth Module

### AuthModule

* AuthService
* JwtStrategy
* WsGuard

---

## 👤 User Module

### UserModule

* UserService
* UserRepository
* ReputationService

---

## 🏠 Room Module

### RoomModule

* RoomService
* RoomGateway

---

## 🧠 Decision Module

### DecisionModule

* DecisionService
* DecisionRepository

---

## 🗳️ Voting Module

### VotingModule

* VotingService
* VoteRepository

---

## 🧠 Weight Module

### WeightModule

* WeightService
* RoleStrategy
* ReputationStrategy
* TrustedStrategy
* SkillStrategy

---

## 🧠 Decision Engine Module

### DecisionEngineModule

* DecisionEngineService

---

## 📊 Reputation Module

### ReputationModule

* ReputationService
* PromotionService

---

## ⚡ Gateway Module

### GatewayModule

* WebSocket Gateway

---

## 🔔 Event Module

### EventModule

* EventEmitter

---

# 🔗 Module Relationships

```
Gateway
  ↓
VotingModule ───→ WeightModule
  ↓                  ↓
DecisionEngine ←────┘
  ↓
ReputationModule
  ↓
UserModule
```

---

# 📂 Project Structure

```
src/
│
├── common/
├── config/
├── database/
├── redis/
│
├── auth/
├── users/
├── rooms/
├── decisions/
├── voting/
├── weight/
├── decision-engine/
├── reputation/
│
├── gateway/
└── main.ts
```

---

# 🔥 Summary

This system is:

* Real-time
* Scalable
* Intelligent (without AI)
* Production-ready architecture

It demonstrates strong backend engineering skills including:

* Distributed systems
* Event-driven architecture
* Advanced business logic
