# Production-Ready User Weight System Design Document

This document outlines the architecture, data modeling, and underlying systems for an enterprise-grade real-time User Weight System built with **NestJS, Prisma, and Redis**.

---

## 1. System Overview

### Purpose
The **User Weight System** dynamically assigns a mathematical value (weight) to individual votes in a collaborative decision-making platform. Unlike simple 1-person = 1-vote systems (which are vulnerable to Sybil attacks and uneducated majorities), a weighted system ensures that highly skilled, reputable, and proven experts have more influence on specific domains than brand new or historically incorrect participants. 

### Why is this better?
By utilizing this engine, you shift from simple popularity-driven polling to **meritocratic consensus**. A user who historically predicts correct outcomes in the "Finance" domain will cast a vote that counts as 5.0, while a new user's vote counts as 1.0. This guarantees high-quality terminal decisions in complex, real-world rooms.

---

## 2. Architecture Design

The architecture is event-driven and segmented into independent NestJS modules.

### Modules Breakdown
* **`AuthModule`**: Secures WebSocket connections and validates JWTs before any Real-Time vote processing can occur.
* **`UserModule`**: Maintains the golden source of truth for Reputation scores, roles, and domain skill tags.
* **`DecisionModule`**: Manages the lifecycle of a chamber's decisions (Open, Closed, Validated) and tallies aggregate voting power.
* **`VoteModule`**: Purely handles the ingestion of incoming votes, orchestrating Redis locks, and interacting with the `WeightModule`.
* **`WeightModule`**: The proprietary isolated math engine that consumes User profiles and Decision context to output a final `WeightMultiplier`.
* **`WebsocketGateway`**: The edge layer connecting thousands of clients to internal NestJS Pub/Sub.

### Data Flow
1. **Client** connects to WebSocket Gateway and emits `castVote`.
2. **Gateway** verifies JWT and passes the payload to `VoteService`.
3. **VoteService** acquires a **Redis Distributed Lock** (`lock:vote:{userId}:{decisionId}`) to prevent rapid double-clicks.
4. **WeightService** evaluates the user object (pulled from Redis Cache) against the decision domain and generates the deterministic `voteWeight`.
5. **VoteService** writes the vote and applies the weight transactionally to PostgreSQL via **Prisma**.
6. **VoteService** publishes an event to **Redis Pub/Sub** (`topic:decision:{decisionId}:updated`).
7. **Gateway** (across all scaled instances) hears the Pub/Sub update and broadcasts the live aggregated totals back to all subscribed clients.

---

## 3. Prisma Data Model

Here is the schema built for speed and referential integrity.

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
}

// Employs strict Role Enums for baseline multipliers
enum Role {
  USER
  EXPERT
  ADMIN
}

model User {
  id             String   @id @default(uuid())
  role           Role     @default(USER)
  reputation     Float    @default(1.0)
  correctVotes   Int      @default(0)
  skillTags      String[] // e.g. ["FINANCE", "ENGINEERING"] 
  
  votes          Vote[]
  
  @@index([reputation(sort: Desc)]) // Fast queries for leaderboards
}

model Room {
  id        String     @id @default(uuid())
  name      String
  decisions Decision[]
}

model Decision {
  id          String   @id @default(uuid())
  roomId      String
  title       String
  domainTag   String?  // The domain to match against User skillTags
  createdAt   DateTime @default(now())
  
  room        Room     @relation(fields: [roomId], references: [id])
  options     Option[]
  votes       Vote[]

  @@index([roomId])
}

model Option {
  id            String   @id @default(uuid())
  decisionId    String
  label         String
  totalWeight   Float    @default(0) // Aggregation cache
  
  decision      Decision @relation(fields: [decisionId], references: [id])
  votes         Vote[]
}

model Vote {
  id           String   @id @default(uuid())
  userId       String
  decisionId   String
  optionId     String
  weightApplied Float   // The exact weight snapshot at time of voting
  createdAt    DateTime @default(now())

  user         User     @relation(fields: [userId], references: [id])
  decision     Decision @relation(fields: [decisionId], references: [id])
  option       Option   @relation(fields: [optionId], references: [id])

  // Composite constraints strictly preventing double voting
  @@unique([userId, decisionId])
  @@index([decisionId])
}
```

---

## 4. Weight Calculation Engine

The mathematical heart of the platform.

### Dynamic Formulas
* **Baseline (Role)**: Users = 1.0, Experts = 2.0.
* **Reputation Scaling**: Logarithmic addition based on their successful past (`Math.log10(user.reputation) * 0.5`).
* **Context Multiplier**: If `Decision.domainTag` exists inside `User.skillTags`, weight increases by +1.5x.
* **Time Decay**: Early-adopters of a decision get a slight multiplier (e.g. 1.1x) to incentivize speedy quorum, dropping over time.

### Code Snippet: WeightService
```typescript
import { Injectable } from '@nestjs/common';
import { User, Decision } from '@prisma/client';

@Injectable()
export class WeightService {
  calculateWeight(user: User, decision: Decision): number {
    let weight = 1.0;

    // 1. Role Base
    if (user.role === 'EXPERT') weight += 1.0;
    if (user.role === 'ADMIN') weight += 2.0;

    // 2. Reputation Scaling 
    // Uses log to yield diminishing returns for massive rep
    const repBonus = Math.max(0, Math.log10(Math.max(1, user.reputation)) * 0.5);
    weight += repBonus;

    // 3. Contextual Domain Expertise
    if (decision.domainTag && user.skillTags.includes(decision.domainTag)) {
      weight *= 1.5; 
    }

    // 4. Time Bonus (Early Voters)
    const hoursSinceCreation = 
      (new Date().getTime() - decision.createdAt.getTime()) / (1000 * 60 * 60);
    if (hoursSinceCreation < 1) {
      weight *= 1.1; // 10% premium for voting within the first hour
    }

    return Number(weight.toFixed(3));
  }
}
```

---

## 5. Real-Time Flow & Gateway

The NestJS `WebSocketGateway` allows clients to seamlessly connect.
To maintain high responsiveness:
1. **Join Chamber**: Emits `joinRoom(roomId)`. Socket joins a Socket.IO room (synced across nodes via `@nestjs/platform-socket.io` Redis Adapter).
2. **Submit**: Client emits `castVote({ optionId, decisionId })`. 
3. **Broadcast**: Following a successful DB transaction, backend emits `decisionUpdate`. All clients in `roomId` receive the new `totalWeight` via Socket.io.

---

## 6. Redis Usage (Critical Intrastructure)

A collaborative platform falls apart under load without Redis.

1. **User Caching (`GET user:profile:{id}`)**: 
   Every vote requires calculating User weight. Polling PostgreSQL 10,000 times a minute for User data is catastrophic. We cache user objects in Redis with a 5-minute TTL.
2. **Distributed Locking (`SETNX lock:vote:{userId}:{decisionId}`)**: 
   Malicious actors script clients to fire 100 WebSocket messages concurrently. A race condition bypasses PostgreSQL `@@unique`. Creating a Redis Lock with a `3000ms px` expiration instantly blocks duplicate processing streams before they hit the DB.
3. **Pub/Sub Notifications**:
   Used via the native Socket.io Redis Adapter to fire updates to users connected to instance B when a vote happens on instance A.

---

## 7. Edge Cases Handled

* **New Users**: Reputation defaults to `1.0`. `Math.log10(1) = 0`, producing a safe baseline modifier.
* **Tie Breaking**: If two options share identical weight, resolving logic should fall back to either: *Highest number of distinct votes* or *Who reached the weight threshold first* (`createdAt` on votes).
* **Double Clicking**: Completely neutralized via the Redis `SETNX` lock layer inside the `castVote` service pipeline.

---

## 8. Anti-Cheat & Integrity Systems

1. **Reputation Decay**: Over time, dormant users lose reputation if they don't participate, preventing legacy accounts from manipulating votes.
2. **IP / Device Fingerprinting Header Tracking**: Block syndicates creating 1,000 fake "1.0 weight" users to override a single 15.0 Expert.
3. **Soft-Validation**: If an Expert votes differently than 98% of the platform on a trivial matter, the anomaly detector flags the decision for Admin review.

---

## 9. Scaling Strategy

As you expand to handle 10,000+ concurrent clients:
* **Stateless Nodes**: Deploy the NestJS app behind an AWS ALB or Kubernetes NGINX Ingress using a shared Redis cluster. Connect WebSockets via raw transports rather than lingering handshakes.
* **Database Pooling**: Utilize Prisma Accelerate or PgBouncer to manage connection pools to Postgres. 
* **Write Deferrals (Advanced)**: During insane traffic spikes (e.g. 5,000 votes in 5 seconds on one decision), instead of inserting directly into Prisma, shove the votes into a Redis Queue (`rpush`), then let a background NestJS Cron worker dequeue and batch insert `createMany` into Postgres every 1 second.

---

## 10. Core Code Examples

### Distributed Locking inside VoteService
```typescript
import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class VoteService {
  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly prisma: PrismaService,
    private readonly weightService: WeightService,
  ) {}

  async castVote(userId: string, decisionId: string, optionId: string) {
    const lockKey = `lock:vote:${userId}:${decisionId}`;
    
    // Acquire Lock (fails if already locked, expires after 3s to prevent deadlocks)
    const acquired = await this.redis.set(lockKey, 'locked', 'PX', 3000, 'NX');
    if (!acquired) {
      throw new ConflictException('Vote currently processing.');
    }

    try {
      // 1. Fetch User (prefer Redis cache)
      const cached = await this.redis.get(`user:${userId}`);
      const user = cached ? JSON.parse(cached) : await this.prisma.user.findUnique({ where: { id: userId }});
      
      const decision = await this.prisma.decision.findUnique({ where: { id: decisionId }});

      // 2. Math Engine
      const calculatedWeight = this.weightService.calculateWeight(user, decision);

      // 3. Transactional Safety for Postgres
      return await this.prisma.$transaction(async (tx) => {
        const vote = await tx.vote.create({
          data: { userId, decisionId, optionId, weightApplied: calculatedWeight },
        });

        const option = await tx.option.update({
          where: { id: optionId },
          data: { totalWeight: { increment: calculatedWeight }},
        });

        return option;
      });
    } finally {
      // 4. Release Lock safely
      await this.redis.del(lockKey);
    }
  }
}
```

---

## 11. Advanced Features (V2 Roadmap)

* **Explainable Votes**: Attach an `influenceBreakdown` JSON field to the Vote model storing exactly *why* a user was granted 4.5 weight (e.g., `{ base: 1.0, roleBonus: 2.0, domainBonus: 1.5 }`).
* **Influence Dashboard**: Generate global charts calculating "Most Influential Expert of the Month."
* **Event Sourcing Audit Trail**: Track every reputation adjustment via an `AuditLog` table ensuring 100% transparency.

---

## 12. Best Practices Followed

* **Single Responsibility Principle**: The `WeightService` only runs math. It does not touch the Database.
* **Idempotency**: Providing network resiliency by ensuring the exact same vote submitted identically handles conflicts flawlessly through Unique constraints and Locks.
* **Separation of Concerns**: Caching architecture lives in services specifically handling I/O, allowing pure logic testing of the algorithm via Jest.
