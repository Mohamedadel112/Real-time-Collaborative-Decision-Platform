# Explainable Weight System
**Production-Ready Architecture Document**

This document outlines an enterprise-grade "Explainable Weight System" design built for transparency and accountability on the **NestJS, Prisma, and Redis** stack.

---

## 1. Feature Overview

**What is Explainable Weight?**  
In traditional algorithmic platforms (like TikTok algorithms or Black-Box credit scoring), users supply inputs but never understand exactly how their outputs are scaled. An Explainable Weight System flips this by calculating a user's decision influence through a deterministic math algorithm and instantly exposing the **exact breakdown of those variables** transparently back to the user via telemetry.

**Why it improves Trust and UX:**  
Meritocracy causes friction if users don't understand the rules. If User A discovers their vote weight is `1.0` while User B hits `6.5`, the system relies on explainability to prevent accusations of platform bias. It provides positive-reinforcement UX: explicitly telling the user *"You got +2.0 because you correctly predicted standard deviation in Finance last week"* perfectly gamifies learning and rewards platform loyalty.

---

## 2. Weight Breakdown System

The final integer of a user's vote is decoupled into precise mathematical increments built around User, Decision, and Historical context.

*   **Base Weight:** The structural default (e.g. `1.0`) ensuring every human has democratic standing.
*   **Trusted User Bonus:** A flat numerical grant given specifically to users who bypassed the organic funnel via Admin Invite (`+2.0`).
*   **Warm Start Bonus:** A temporary handicap granted to extremely new users inside their first 100 platform votes to ensure their voice breaks through heavy algorithmic veterans (`+1.0`).
*   **Skill Match Bonus:** Evaluates the `Decision.tag` against the user's highest `UserSkill` model array (`+2.0`).
*   **Reputation Score:** A purely logarithmic extrapolation of their total positive platform interaction (`+Math.log10(X)`).
*   **Accuracy Bonus:** Extrapolating continuous high-streak win-rates on recent proposals.

---

## 3. Data Structure Design

We must strictly catalog this data structure within **Prisma** to generate immutable audits for historical data exploration.

```prisma
model Vote {
  id           String   @id @default(uuid())
  userId       String
  decisionId   String
  optionId     String
  finalWeight  Float
  
  // This explicitly guarantees historical traceability
  weightBreakdown WeightBreakdown? 

  createdAt    DateTime @default(now())

  user         User     @relation(fields: [userId], references: [id])
  decision     Decision @relation(fields: [decisionId], references: [id])
}

model WeightBreakdown {
  id               String   @id @default(uuid())
  voteId           String   @unique
  base             Float
  trustedBonus     Float
  warmStartBonus   Float
  skillBonus       Float
  reputationBonus  Float
  accuracyBonus    Float
  
  vote             Vote     @relation(fields: [voteId], references: [id], onDelete: Cascade)
}
```

---

## 4. Calculation Logic (The Engine)

The mathematics engine shouldn't just compute a primitive number; it should build a telemetry object representing the user's specific context snapshot payload.

```typescript
export interface ExplanationPayload {
  totalWeight: number;
  breakdown: {
    base: number;
    trustedBonus: number;
    warmStartBonus: number;
    skillBonus: number;
    reputationBonus: number;
    accuracyBonus: number;
  };
  messages: string[]; // Front-end ready strings
}
```

---

## 5. Example Output Array

The system natively bridges backend numerical math directly to UI string constants, returning payloads like:

```json
{
  "totalWeight": 6.0,
  "breakdown": {
    "base": 1.0,
    "trustedBonus": 2.0,
    "warmStartBonus": 1.0,
    "skillBonus": 2.0,
    "reputationBonus": 0.0,
    "accuracyBonus": 0.0
  },
  "messages": [
    "Your weight = 6",
    "+1 Base",
    "+2 Trusted User",
    "+1 Warm Start",
    "+2 Skill Match"
  ]
}
```

---

## 6. NestJS Implementation

The `WeightService` represents the single source of truth for extracting these algorithms.

```typescript
@Injectable()
export class WeightService {
  calculateWeight(user: User, userSkill: UserSkill, decision: Decision): ExplanationPayload {
    const payload: ExplanationPayload = {
      totalWeight: 1.0, // Base
      breakdown: { base: 1.0, trustedBonus: 0, warmStartBonus: 0, skillBonus: 0, reputationBonus: 0, accuracyBonus: 0 },
      messages: ['+1.0 Base Contribution']
    };

    // 1. Trusted User
    if (user.isInvitedByAdmin) {
      payload.breakdown.trustedBonus = 2.0;
      payload.messages.push('+2.0 Trusted User Verification');
    }

    // 2. Warm Start
    if (user.totalVotesCast < 100) {
      payload.breakdown.warmStartBonus = 1.0;
      payload.messages.push('+1.0 New User Warm-Start Boost');
    }

    // 3. Skill Matching
    if (decision.tag && userSkill?.skillTag === decision.tag) {
      payload.breakdown.skillBonus = 2.0;
      payload.messages.push('+2.0 Area of Expertise Match');
    }

    // 4. Reputation Logarithm
    if (user.reputation > 50) {
      const repLog = Number((Math.log10(user.reputation) * 0.5).toFixed(2));
      payload.breakdown.reputationBonus = repLog;
      payload.messages.push(`+${repLog} Reputation Bonus`);
    }

    // Aggregate Array Total
    payload.totalWeight = Object.values(payload.breakdown).reduce((sum, val) => sum + val, 0);
    
    return payload;
  }
}
```

---

## 7. Storage Strategy

**Hybrid Storage Approach (Recommended Production Path):**  
*   **Volatile Phase (On-The-Fly):** When a user merely opens a browser tab viewing a decision, the frontend pings `GET /decisions/:id/my-projected-weight`. This executes the math purely on-the-fly and drops it instantly to avoid useless DB writes. 
*   **Immutable Phase (Post-DB):** The precise millisecond the user clicks "Cast Vote", the backend locks the exact mathematical breakdown payload occurring at that localized timestamp and permanently stores it mapping to the explicit `Vote` row using Prisma relational inserts (`WeightBreakdown`), protecting it against future role decays.

---

## 8. Real-Time Integration

If a user gets spontaneously promoted to Expert natively via the asynchronous midnight Cron jobs, or their accuracy jumps passing a threshold, they shouldn't experience "stale data".
The `WebSocketGateway` handles dynamic refreshing updates:

1. **Vote Casting:** Standard procedure. Client emits `vote` → Transaction creates records → Success emitted back.
2. **Exposing Weight Live:** Because the WebSocket stream is persistent, NestJS caches the user's `WeightBreakdown` footprint in **Redis Cache**.
3. **Pushed Changes:** If a user is promoted, an observer pattern publishes `redis.publish('user:weightShift', data)`.

---

## 9. Advanced Features

* **Evolution Explainer:** In the Profile section, log exact thresholds mapping to role logic: `"You are currently 5 decisions away from unlocking the EXPERT tier in the MEDICAL domain."`
* **Leaderboards:** Chart out specific influence profiles, highlighting the users commanding the highest relative algorithmic multipliers (`Top 5% Highest Rep Users`).
* **Contribution History Breakdown:** Reconstruct old votes rendering a timeline displaying mathematically exactly how a user built influence throughout a 12-month period based purely on their extracted `Breakdown` graphs.

---

## 10. Anti-Abuse Logic

* **Fake Account Warm Starts Boost Suppression:** Sybil attacks rely on generating thousands of new accounts instantly to abuse the `+1.0 Warm Start`. Weight Caps restrict maximum concurrent influence pooling by untrusted IP/devices.
* **Normalize Peak Influence:** Regardless of algorithmic calculations creating an impossibly high multiplier (e.g. massive reputation whales calculating to `85.0x` mathematically), the service strictly enforces a `Math.min(totalWeight, 15.0)` ceiling explicitly communicating the cap downward.

---

## 11. UI/UX Considerations

* **Explainer Tooltips:** Never force math down a standard user's throat visually. Instead, display an elegant integer next to their vote button. Hovering their cursor triggers an absolute-positioned React Tooltip exploding the math downward line-by-line via the `messages` array returned by NestJS.
* **Influence Dashboard:** Build a radar-chart or spider-chart diagram utilizing Lucide Icons overlaying exactly which tags and skills provide the user their greatest global impact multipliers natively on the `Analytics` page.

---

## 12. Full Network Execution Map

```typescript
@SubscribeMessage('castVote')
async handleVote(client: Socket, payload: { decisionId; optionId }) {
  const userId = client.data.user.id;

  try {
    // 1. Math computation & string generation occurs
    const computation = this.weightService.calculateWeight(user, userSkill, decision);
    
    // 2. We commit both the final Integer & the Explicit Mathematical Tracking object
    await this.prisma.vote.create({
      data: {
        userId,
        decisionId,
        optionId,
        finalWeight: computation.totalWeight,
        weightBreakdown: {
          create: computation.breakdown
        }
      }
    });
    
    // 3. UI sees explicit tracking output directly injected through WS confirmation packet
    return { status: 'VOTE_SECURED', explanation: computation.messages };
  } catch(e) {
    throw new WsException('Vote Failed');
  }
}
```
