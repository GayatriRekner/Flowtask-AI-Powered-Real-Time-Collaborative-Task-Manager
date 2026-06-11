import { useState } from "react"
import { loginUser } from "../services/authService"
import { useNavigate } from "react-router-dom"

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --white: #ffffff;
    --bg: #f9fafb;
    --border: #e5e7eb;
    --border-light: #f3f4f6;
    --text-primary: #0f172a;
    --text-secondary: #64748b;
    --text-muted: #94a3b8;
    --accent: #2563eb;
    --accent-light: #eff6ff;
    --accent-hover: #1d4ed8;
    --accent-mid: #bfdbfe;
    --font: 'Geist', 'DM Sans', system-ui, sans-serif;
  }

  body {
    font-family: var(--font);
    background: var(--bg);
  }

  .login-root {
    min-height: 100vh;
    display: flex;
    font-family: var(--font);
    background: var(--bg);
  }

  /* ── Left panel ── */
  .login-left {
    display: none;
    width: 44%;
    flex-shrink: 0;
    background: var(--accent);
    padding: 48px 52px;
    flex-direction: column;
    justify-content: space-between;
    position: relative;
    overflow: hidden;
  }

  @media (min-width: 1024px) {
    .login-left { display: flex; }
  }

  /* Geometric decorations */
  .login-left::before {
    content: '';
    position: absolute;
    width: 420px;
    height: 420px;
    border-radius: 50%;
    border: 1px solid rgba(255,255,255,0.08);
    top: -140px;
    right: -140px;
  }

  .login-left::after {
    content: '';
    position: absolute;
    width: 280px;
    height: 280px;
    border-radius: 50%;
    border: 1px solid rgba(255,255,255,0.06);
    bottom: -80px;
    left: -60px;
  }

  .left-circle-sm {
    position: absolute;
    width: 160px;
    height: 160px;
    border-radius: 50%;
    border: 1px solid rgba(255,255,255,0.07);
    bottom: 160px;
    right: -40px;
  }

  .left-grid {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
    background-size: 40px 40px;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 10px;
    position: relative;
    z-index: 1;
  }

  .brand-mark {
    width: 32px;
    height: 32px;
    background: rgba(255,255,255,0.15);
    border: 1px solid rgba(255,255,255,0.25);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .brand-mark span {
    font-size: 14px;
    font-weight: 600;
    color: white;
  }

  .brand-name {
    font-size: 15px;
    font-weight: 600;
    color: white;
    letter-spacing: -0.3px;
  }

  .left-body {
    position: relative;
    z-index: 1;
  }

  .left-eyebrow {
    font-size: 10.5px;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.55);
    margin-bottom: 18px;
  }

  .left-headline {
    font-size: 44px;
    font-weight: 300;
    line-height: 1.1;
    color: white;
    letter-spacing: -1.5px;
    margin-bottom: 20px;
  }

  .left-headline strong {
    font-weight: 600;
    display: block;
  }

  .left-desc {
    font-size: 14px;
    font-weight: 300;
    color: rgba(255,255,255,0.65);
    line-height: 1.75;
    max-width: 290px;
    margin-bottom: 36px;
  }

  .feature-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .feature-item {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 13px;
    color: rgba(255,255,255,0.8);
  }

  .feature-check {
    width: 20px;
    height: 20px;
    background: rgba(255,255,255,0.15);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .left-footer {
    position: relative;
    z-index: 1;
  }

  .avatar-row {
    display: flex;
    margin-bottom: 12px;
  }

  .avatar-bubble {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 2px solid var(--accent);
    background: rgba(255,255,255,0.2);
    color: white;
    font-size: 11px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .avatar-bubble + .avatar-bubble { margin-left: -8px; }

  .proof-text {
    font-size: 13px;
    font-weight: 500;
    color: white;
    margin-bottom: 2px;
  }

  .proof-sub {
    font-size: 12px;
    color: rgba(255,255,255,0.5);
    font-weight: 300;
  }

  /* ── Right panel ── */
  .login-right {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 24px;
    background: var(--white);
  }

  .login-card {
    width: 100%;
    max-width: 380px;
  }

  .card-eyebrow {
    font-size: 10.5px;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--accent);
    margin-bottom: 8px;
  }

  .card-title {
    font-size: 28px;
    font-weight: 600;
    color: var(--text-primary);
    letter-spacing: -0.8px;
    margin-bottom: 6px;
  }

  .card-subtitle {
    font-size: 13.5px;
    color: var(--text-muted);
    font-weight: 400;
    margin-bottom: 34px;
    line-height: 1.5;
  }

  /* ── Form ── */
  .field {
    margin-bottom: 18px;
  }

  .field-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 7px;
  }

  .field-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-secondary);
  }

  .forgot-link {
    font-size: 12px;
    color: var(--accent);
    text-decoration: none;
    font-weight: 500;
  }

  .forgot-link:hover { text-decoration: underline; }

  .field-input {
    width: 100%;
    padding: 11px 14px;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 9px;
    font-family: var(--font);
    font-size: 14px;
    color: var(--text-primary);
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
  }

  .field-input::placeholder { color: var(--text-muted); }

  .field-input:focus {
    border-color: var(--accent-mid);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.09);
    background: var(--white);
  }

  .submit-btn {
    width: 100%;
    padding: 12px;
    background: var(--accent);
    color: white;
    border: none;
    border-radius: 9px;
    font-family: var(--font);
    font-size: 14px;
    font-weight: 500;
    letter-spacing: 0.01em;
    cursor: pointer;
    transition: background 0.12s, opacity 0.12s;
    margin-top: 6px;
  }

  .submit-btn:hover:not(:disabled) { background: var(--accent-hover); }
  .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

  .divider {
    display: flex;
    align-items: center;
    gap: 14px;
    margin: 22px 0;
  }

  .divider-line {
    flex: 1;
    height: 1px;
    background: var(--border);
  }

  .divider-label {
    font-size: 11.5px;
    color: var(--text-muted);
    letter-spacing: 0.06em;
    font-weight: 500;
  }

  .google-btn {
    width: 100%;
    padding: 11px;
    background: var(--white);
    color: var(--text-secondary);
    border: 1px solid var(--border);
    border-radius: 9px;
    font-family: var(--font);
    font-size: 13.5px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 9px;
    transition: border-color 0.12s, background 0.12s, color 0.12s;
  }

  .google-btn:hover {
    border-color: var(--accent-mid);
    background: var(--accent-light);
    color: var(--accent);
  }

  .signup-row {
    text-align: center;
    margin-top: 24px;
    font-size: 13px;
    color: var(--text-muted);
  }

  .signup-link {
    color: var(--accent);
    font-weight: 500;
    text-decoration: none;
  }

  .signup-link:hover { text-decoration: underline; }

  /* ── Spinner ── */
  @keyframes spin { to { transform: rotate(360deg); } }
  .spinner {
    width: 14px; height: 14px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    display: inline-block;
    vertical-align: middle;
    margin-right: 8px;
  }

  /* ── Fade in ── */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .login-card { animation: fadeUp 0.3s ease both; }
`

const FEATURES = [
  "Real-time task collaboration",
  "Kanban boards & sprints",
]

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
  e.preventDefault()
  setLoading(true)
  try {
    const data = await loginUser(email, password)
    if (!data.access_token) {
      alert("Invalid email or password")
      return
    }
    localStorage.setItem("token", data.access_token)
    window.dispatchEvent(new CustomEvent("auth_change", { detail: "token_set" }))
    navigate("/dashboard")
  } catch (error) {
    alert("Invalid email or password")
  } finally {
    setLoading(false)
  }
}
  return (
    <>
      <style>{styles}</style>
      <div className="login-root">

        {/* ── Left panel ── */}
        <div className="login-left">
          <div className="left-grid" />
          <div className="left-circle-sm" />

          {/* Brand */}
          <div className="brand">
            <div className="brand-mark"><span>F</span></div>
            <span className="brand-name">Flowtask</span>
          </div>

          {/* Headline */}
          <div className="left-body">
            <p className="left-eyebrow">Collaborative workspace</p>
            <h1 className="left-headline">
              Work that
              <strong>flows together.</strong>
            </h1>
            <p className="left-desc">
              A focused space for your team to plan, track, and build — without the noise.
            </p>
            <div className="feature-list">
              {FEATURES.map(f => (
                <div key={f} className="feature-item">
                  <div className="feature-check">
                    <svg width="10" height="10" fill="none" stroke="white" strokeWidth="2.2" viewBox="0 0 24 24">
                      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  {f}
                </div>
              ))}
            </div>
          </div>

          {/* Social proof */}
          <div className="left-footer">
            <div className="avatar-row">
              {["R","S","M","K"].map(l => (
                <div key={l} className="avatar-bubble">{l}</div>
              ))}
            </div>
            <p className="proof-text">2,400+ teams</p>
            <p className="proof-sub">already in flow</p>
          </div>
        </div>

        {/* ── Right panel ── */}
        <div className="login-right">
          <div className="login-card">
            <p className="card-eyebrow">Welcome back</p>
            <h2 className="card-title">Sign in</h2>
            <p className="card-subtitle">Continue where you left off.</p>

            <form onSubmit={handleLogin}>
              <div className="field">
                <label className="field-label">Email</label>
                <input
                  className="field-input"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="field">
                <div className="field-row">
                  <label className="field-label">Password</label>
                </div>
                <input
                  className="field-input"
                  type="password"
                  placeholder="••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button className="submit-btn" type="submit" disabled={loading}>
                {loading && <span className="spinner" />}
                {loading ? "Signing in…" : "Sign in to workspace"}
              </button>
            </form>

            <div className="divider">
              <div className="divider-line" />
              <span className="divider-label">or</span>
              <div className="divider-line" />
            </div>

            <p className="signup-row">
              New to Flowtask?{" "}
              <a href="/register" className="signup-link">Create an account</a>
            </p>
          </div>
        </div>

      </div>
    </>
  )
}
