# Admin Invite System
**Production-Ready Architecture Document**

This document details the complete design and backend flow for a robust "Admin Invite System". It enables administrators to securely onboard external professionals as "Trusted Users" directly into the collaborative decision platform using **NestJS, Prisma, and Redis**.

---

## 1. Feature Overview

**What is the Admin Invite System?**  
The Admin Invite System is a secure, token-driven gateway that allows platform administrators to bypass organic reputation grinding for verified third-party professionals. It handles token generation, email distribution, and lifecycle tracking (Pending → Accepted → Expired).

**Integration with User Roles:**  
By default, new sign-ups are labeled `USER` and have a voting weight of `1.0`. 
If a user registers through a cryptographically signed Admin Invite Token, they are automatically bootstrapped as a `TRUSTED_USER`. This flags them in the database (`isInvitedByAdmin: true`), granting them immediate warm-start influence bonuses so they can safely break ties and enforce expert consensus immediately.

---

## 2. Admin Profile Settings

The UI dashboard where Admins orchestrate the invitation lifecycle.

**Core Capabilities:**
1. **Invite Input:** Form accepting either an Email address or mapping to an existing Username.
2. **Dynamic Dashboard:** A datagrid displaying all previously issued invites with color-coded statuses.
3. **Status Tracking:**
    *   🟡 **Pending:** Token active, awaiting user registration.
    *   🟢 **Accepted:** User completed registration; links directly to their newly created User profile.
    *   🔴 **Expired:** 72-hour window lapsed. Allows Admin to click "Resend".
4. **Limits & Quotas:** The UI clearly tracks the Admin's quota (e.g., "3 of 5 invites remaining this week").

---

## 3. Invitation Flow

1. **Initiation:** The Admin clicks "Generate Invite" for `expert@university.edu`.
2. **Generation:** The NestJS backend generates a secure UUID token and creates an `Invite` record in PostgreSQL.
3. **Distribution:** An email is dispatched containing a magic link: `https://platform.com/register?token=abc-123`.
4. **Validation:** The external user clicks the link. The frontend reads the `?token=` parameter and pings the NestJS backend to verify it hasn't expired.
5. **Consumption:** The user fills out their password and registers. The NestJS `AuthService` consumes the token, creates the User with `isInvitedByAdmin = true`, sets the Invite status to `ACCEPTED`, and completes the transaction.

---

## 4. Prisma Schema Design

To guarantee referential integrity and tracking, we need an `Invite` table explicitly storing the lifecycle context.

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
}

enum InviteStatus {
  PENDING
  ACCEPTED
  EXPIRED
}

model Invite {
  id          String       @id @default(uuid())
  email       String
  token       String       @unique
  invitedById String
  status      InviteStatus @default(PENDING)
  expiresAt   DateTime
  createdAt   DateTime     @default(now())
  acceptedAt  DateTime?    // Filled when User registers

  invitedBy   User         @relation("AdminInvites", fields: [invitedById], references: [id])

  @@index([token])
  @@index([email])
}

model User {
  id               String   @id @default(uuid())
  email            String   @unique
  passwordHash     String
  role             String   @default("USER") // Or Enum
  isInvitedByAdmin Boolean  @default(false)
  invitedById      String?

  adminInvites     Invite[] @relation("AdminInvites")
}
```

---

## 5. Backend Logic (NestJS)

The `InviteService` handles the core orchestration. 

**Methods Breakdown:**
*   `createInvite(adminId, email)`: Validates quotas, generates a cryptographic UUIDv4 token, calculates `expiresAt` (+72 hours), and inserts the row.
*   `validateInviteToken(token)`: Confirms the token exists, is `PENDING`, and `Time.now < expiresAt`.
*   `acceptInvite(token, userPayload)`: Called during the final registration step. It performs a Prisma `$transaction` that simultaneously creates the `User` and marks the `Invite` as `ACCEPTED`.

**Connecting to Registration:**  
The standard `/auth/register` endpoint is modified to accept an optional `inviteToken` body parameter. If present, it routes into the `acceptInvite()` pipeline instead of standard onboarding.

---

## 6. Security & Anti-Abuse (Critical)

1. **Cryptographic Uniqueness:** Tokens are generated using the `crypto` or `uuid` libraries natively to prevent brute-forcing. 
2. **Time-Limits:** Tokens strictly enforce a 72-hour `expiresAt` window. A backend CRON job automatically shifts untriggered tickets to `EXPIRED`.
3. **Hard Quotas:** Before generating an invite, the system checks `COUNT(Invite) WHERE invitedById = adminId AND createdAt > 7_days_ago`. If it exceeds 5, the API halts.
4. **Audit Logs:** The database tracks exactly *which* admin brought in the Trusted User. If a Trusted User turns malicious, the platform can automatically query and review the judgment of the sourcing Admin.

---

## 7. Redis Cache & Limits

1. **Invite Validation Caching:**  
   When a user clicks an invite link, the frontend repeatedly mounts/validates the token. We store valid tokens in standard Redis (`SET token:${uuid} VALID EX 3600`) upon creation. `validateInviteToken` hits Redis in sub-millisecond time instead of taxing Postgres.
2. **Rate Limiting Admin Distribution:**  
   To prevent compromised Admin accounts from spamming 10,000 emails, NestJS Throttler via Redis prevents >10 `/invite/create` requests per minute per IP.
3. **Brute Force Protection:**  
   If an attacker rapid-fires registration requests with guessed `?token=` parameters, Redis blocks them after 5 invalid attempts (`HINCRBY brute:${ip}`).

---

## 8. Edge Cases

- **Invite Expired:** If a user registers at 72 hours and 1 minute, the API throws `400 Token Expired`. Admins must manually use a "Resend" button to reissue.
- **Email Already Registered:** If the email passed to `createInvite()` already exists in the `User` database, the API immediately halts with `409 Conflict` (you cannot invite someone who is already here).
- **Token Reused:** Due to PostgreSQL `$transactions`, the instant the registration commits, the token flips to `ACCEPTED`. A parallel race-condition request 1 millisecond later will read `ACCEPTED` and fail.
- **Admin Abuse:** Centralized logging flags Admins who issue 100% of their quota every week.

---

## 9. UI & UX

**Admin Dashboard perspective:**
- A simple input field `Enter Email Address` side-by-side with a large `Send Trusted Invitation` button.
- A beautiful table rendering:  
  `[jane@stanford.edu] | [Pending] | [Expires in 42h] | [Copy Link / Resend]`

**User Flow perspective:**
- Jane opens her inbox: *"You've been invited to join the Jurist Panel."*
- Clicks the link, opening `https://app.com/signup?token=xxx`.
- The frontend extracts the token. A small green Toast notification appears: *"Trusted Profile verified. Complete registration."*
- Jane enters her password. She enters the dashboard automatically branded as a High-Influence Trusted User.

---

## 10. Core Code Examples

### Controller:
```typescript
@Controller('admin/invites')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('ADMIN')
export class InviteController {
  constructor(private readonly inviteService: InviteService) {}

  @Post()
  async createInvite(@CurrentUser() admin: User, @Body('email') email: string) {
    return this.inviteService.createInvite(admin.id, email);
  }

  @Get()
  async getAdminInvites(@CurrentUser() admin: User) {
    return this.inviteService.getInvitesByAdmin(admin.id);
  }
}
```

### Service Logic with Constraints:
```typescript
import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class InviteService {
  constructor(private prisma: PrismaService) {}

  async createInvite(adminId: string, email: string) {
    // 1. Check if user already exists
    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) throw new ConflictException('User already registered.');

    // 2. Prevent spam (Quota enforcement: max 5 pending per admin)
    const openInvites = await this.prisma.invite.count({
      where: { invitedById: adminId, status: 'PENDING' }
    });
    if (openInvites >= 5) throw new BadRequestException('Open invite quota exceeded.');

    // 3. Generate token & expiration (72 hours)
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000);

    // 4. Fire to Database
    return this.prisma.invite.create({
      data: { email, token, expiresAt, invitedById: adminId }
    });
  }

  async acceptInvite(token: string, userData: any) {
    const invite = await this.prisma.invite.findUnique({ where: { token } });

    if (!invite || invite.status !== 'PENDING' || invite.expiresAt < new Date()) {
      throw new BadRequestException('Token invalid or expired.');
    }

    // Process Transaction Guaranteeing Safety
    return this.prisma.$transaction(async (tx) => {
      // 1. Mark invite accepted
      await tx.invite.update({
        where: { id: invite.id },
        data: { status: 'ACCEPTED', acceptedAt: new Date() }
      });

      // 2. Create Trusted User organically
      return tx.user.create({
        data: {
          ...userData,
          email: invite.email, // Force lock to invited email
          role: 'USER', 
          isInvitedByAdmin: true,
          invitedById: invite.invitedById,
        }
      });
    });
  }
}
```
