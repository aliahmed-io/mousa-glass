# Public Administrator-Access Query Reassessment

## Scope and result

The shared storefront shell was reviewed to determine whether it introduces an avoidable administrator-access request on public Home and Shop routes. **No code change was retained.** The current query configuration already avoids the extra administrator-access request for unauthenticated visitors, which is the state used by published public Lighthouse audits.

| Component | Public-route behavior | Finding | Decision |
| --- | --- | --- | --- |
| `useAuth()` | Requests the current OAuth session so the public header can accurately show sign-in, account, orders, and logout controls. | This account-state query supports visible shell behavior and is not an administrator check. | Retain. |
| `useAdminAccess()` | Calls `auth.adminAccess` only when `auth.user` exists and the user does not already have the `admin` role. | For an unauthenticated public visitor, `enabled` is false, so the administrator request is not issued. | Retain. |
| `StoreLayout` navigation | Adds the administrator navigation item only after the hook returns authorized access. | Moving the decision to the client route tree would not reduce unauthenticated startup work and could create misleading UI state. | Retain. |
| Server `adminProcedure` | Enforces role or signed, user-bound temporary administrator authorization. | Client-side deferral cannot replace server authorization. | Preserve as the security boundary. |

## Evidence-based decision

The reviewed hook explicitly gates `auth.adminAccess` with `Boolean(auth.user) && !roleAdmin`. Consequently, an anonymous public audit cannot benefit from deferring that request: it is already absent. The remaining `auth.me` request is intentionally shared with the public shell because it controls the account-related header and navigation state. Removing it would trade a small account-state request for degraded or incorrect signed-in navigation and would not address the published first-load bundle, stylesheet, or managed server-response findings.

The application therefore retains the existing hook composition. This decision preserves an accurate Arabic RTL account experience and centralized server enforcement while keeping the published Core Web Vitals and server-response gate open for future evidence-backed work.
