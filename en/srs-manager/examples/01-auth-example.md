# Auth — Software Requirements

Prefix ID: `REQ-AUTH-*`

---

### REQ-AUTH-003: Log in with email/password

**Status:** Implemented
**Implementation:** `src/auth/login.service.ts → loginWithPassword()`
**Tests:** `tests/auth/login.spec.ts`

**As a** user
**I want** to log in with my email and password
**So that** I can access my personal dashboard

**Acceptance Criteria:**
- [x] 5 consecutive wrong password attempts → lock the account for 15 minutes
- [x] Password must be at least 8 characters with at least 1 digit
- [x] Return a JWT token on successful login

**Notes:** Depends on REQ-AUTH-004 (lockout policy).

---

### REQ-AUTH-004: Lock account after repeated failed logins

**Status:** Implemented
**Implementation:** `src/auth/lockout.guard.ts → checkLockoutStatus()`
**Tests:** `tests/auth/lockout.spec.ts`

**As a** system
**I want** to automatically lock an account after 5 wrong password attempts
**So that** brute-force attacks are mitigated

**Acceptance Criteria:**
- [x] Count failed attempts within a 10-minute window
- [x] Lock for 15 minutes and notify the user by email

**Notes:** —
