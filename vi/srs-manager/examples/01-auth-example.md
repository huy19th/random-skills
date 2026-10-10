# Auth — Software Requirements

Prefix ID: `REQ-AUTH-*`

---

### REQ-AUTH-003: Đăng nhập bằng email/password

**Status:** Implemented
**Implementation:** `src/auth/login.service.ts → loginWithPassword()`
**Tests:** `tests/auth/login.spec.ts`

**As a** user
**I want** đăng nhập bằng email và mật khẩu
**So that** tôi truy cập được dashboard cá nhân

**Acceptance Criteria:**
- [x] Sai mật khẩu 5 lần liên tiếp → khóa tài khoản 15 phút
- [x] Password tối thiểu 8 ký tự, có ít nhất 1 số
- [x] Trả JWT token khi đăng nhập thành công

**Notes:** Phụ thuộc REQ-AUTH-004 (lockout policy).

---

### REQ-AUTH-004: Khóa tài khoản sau nhiều lần đăng nhập sai

**Status:** Implemented
**Implementation:** `src/auth/lockout.guard.ts → checkLockoutStatus()`
**Tests:** `tests/auth/lockout.spec.ts`

**As a** hệ thống
**I want** tự động khóa tài khoản sau 5 lần sai mật khẩu
**So that** hạn chế tấn công brute-force

**Acceptance Criteria:**
- [x] Đếm số lần sai trong cửa sổ 10 phút
- [x] Khóa 15 phút, có thông báo cho user qua email

**Notes:** —
