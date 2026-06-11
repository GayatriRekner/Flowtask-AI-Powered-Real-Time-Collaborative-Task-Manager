import { useState } from "react"
import { useNavigate } from "react-router-dom"
import API from "../api/axios"

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
    --success: #10b981;
    --danger: #ef4444;
    --font: 'Geist', 'DM Sans', system-ui, sans-serif;
  }

  body { font-family: var(--font); background: var(--bg); }

  .reg-root {
    min-height: 100vh;
    display: flex;
    font-family: var(--font);
    background: var(--bg);
  }

  /* ── Left panel ── */
  .reg-left {
    display: none;
    width: 44%;
    flex-shrink: 0;
    background: var(--text-primary);
    padding: 48px 52px;
    flex-direction: column;
    justify-content: space-between;
    position: relative;
    overflow: hidden;
  }
  @media (min-width: 1024px) { .reg-left { display: flex; } }

  /* Grid overlay */
  .reg-left-grid {
    position: absolute; inset: 0;
    background-image:
      linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
    background-size: 40px 40px;
  }

  /* Decorative circles */
  .reg-circle-lg {
    position: absolute;
    width: 380px; height: 380px; border-radius: 50%;
    border: 1px solid rgba(255,255,255,0.06);
    top: -100px; right: -120px;
  }
  .reg-circle-md {
    position: absolute;
    width: 220px; height: 220px; border-radius: 50%;
    border: 1px solid rgba(255,255,255,0.05);
    bottom: 80px; left: -60px;
  }
  .reg-circle-sm {
    position: absolute;
    width: 120px; height: 120px; border-radius: 50%;
    background: rgba(37,99,235,0.12);
    bottom: -30px; right: 60px;
  }

  /* Brand */
  .reg-brand {
    display: flex; align-items: center; gap: 10px;
    position: relative; z-index: 1;
  }
  .reg-brand-mark {
    width: 32px; height: 32px; background: var(--accent);
    border-radius: 8px; display: flex;
    align-items: center; justify-content: center;
  }
  .reg-brand-mark span { font-size: 14px; font-weight: 600; color: white; }
  .reg-brand-name {
    font-size: 15px; font-weight: 600; color: white; letter-spacing: -0.3px;
  }

  /* Steps */
  .reg-steps {
    position: relative; z-index: 1;
  }
  .reg-eyebrow {
    font-size: 10.5px; font-weight: 600; letter-spacing: 0.14em;
    text-transform: uppercase; color: rgba(255,255,255,0.4);
    margin-bottom: 18px;
  }
  .reg-headline {
    font-size: 40px; font-weight: 300; line-height: 1.1;
    color: white; letter-spacing: -1.5px; margin-bottom: 14px;
  }
  .reg-headline strong { font-weight: 600; display: block; }
  .reg-desc {
    font-size: 14px; font-weight: 300;
    color: rgba(255,255,255,0.5); line-height: 1.75;
    max-width: 290px; margin-bottom: 40px;
  }

  .step-list { display: flex; flex-direction: column; gap: 0; }
  .step-item {
    display: flex; gap: 16px; align-items: flex-start;
    padding: 16px 0;
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }
  .step-item:last-child { border-bottom: none; }
  .step-num {
    width: 26px; height: 26px; border-radius: 50%;
    background: rgba(37,99,235,0.25); border: 1px solid rgba(37,99,235,0.4);
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 600; color: #93c5fd;
    flex-shrink: 0; margin-top: 1px;
  }
  .step-label {
    font-size: 13.5px; font-weight: 500; color: rgba(255,255,255,0.85);
    margin-bottom: 2px;
  }
  .step-desc { font-size: 12px; color: rgba(255,255,255,0.38); line-height: 1.5; }

  /* Footer trust */
  .reg-left-footer {
    position: relative; z-index: 1;
    display: flex; align-items: center; gap: 10px;
  }
  .shield-icon {
    width: 32px; height: 32px; border-radius: 8px;
    background: rgba(16,185,129,0.15); border: 1px solid rgba(16,185,129,0.25);
    display: flex; align-items: center; justify-content: center; color: #34d399;
  }
  .trust-text { font-size: 12px; color: rgba(255,255,255,0.38); line-height: 1.5; }
  .trust-text strong { color: rgba(255,255,255,0.65); font-weight: 500; }

  /* ── Right panel ── */
  .reg-right {
    flex: 1; display: flex; align-items: center;
    justify-content: center; padding: 40px 24px;
    background: var(--white);
  }

  .reg-card {
    width: 100%; max-width: 380px;
    animation: fadeUp .3s ease both;
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .card-eyebrow {
    font-size: 10.5px; font-weight: 600; letter-spacing: 0.14em;
    text-transform: uppercase; color: var(--accent); margin-bottom: 8px;
  }
  .card-title {
    font-size: 28px; font-weight: 600; color: var(--text-primary);
    letter-spacing: -0.8px; margin-bottom: 6px;
  }
  .card-subtitle {
    font-size: 13.5px; color: var(--text-muted);
    font-weight: 400; margin-bottom: 32px; line-height: 1.5;
  }

  /* ── Fields ── */
  .field { margin-bottom: 16px; }
  .field-label {
    display: block; font-size: 11px; font-weight: 600;
    letter-spacing: 0.08em; text-transform: uppercase;
    color: var(--text-secondary); margin-bottom: 7px;
  }
  .field-input-wrap { position: relative; }
  .field-icon {
    position: absolute; left: 12px; top: 50%;
    transform: translateY(-50%); color: var(--text-muted);
    pointer-events: none; display: flex;
  }
  .field-input {
    width: 100%; padding: 11px 14px 11px 38px;
    background: var(--bg); border: 1px solid var(--border);
    border-radius: 9px; font-family: var(--font);
    font-size: 14px; color: var(--text-primary); outline: none;
    transition: border-color .15s, box-shadow .15s;
  }
  .field-input::placeholder { color: var(--text-muted); }
  .field-input:focus {
    border-color: var(--accent-mid);
    box-shadow: 0 0 0 3px rgba(37,99,235,.09);
    background: var(--white);
  }
  .field-input.error {
    border-color: #fca5a5;
    box-shadow: 0 0 0 3px rgba(239,68,68,.08);
  }
  .field-error {
    font-size: 11.5px; color: var(--danger);
    margin-top: 5px; font-weight: 500;
  }

  /* Password strength */
  .pw-strength { margin-top: 8px; }
  .pw-strength-bars {
    display: flex; gap: 4px; margin-bottom: 5px;
  }
  .pw-bar {
    flex: 1; height: 3px; border-radius: 99px;
    background: var(--border); transition: background .3s;
  }
  .pw-bar.weak   { background: var(--danger); }
  .pw-bar.medium { background: #f59e0b; }
  .pw-bar.strong { background: var(--success); }
  .pw-strength-label {
    font-size: 11px; font-weight: 500;
  }
  .pw-strength-label.weak   { color: var(--danger); }
  .pw-strength-label.medium { color: #f59e0b; }
  .pw-strength-label.strong { color: var(--success); }

  /* ── Submit ── */
  .submit-btn {
    width: 100%; padding: 12px;
    background: var(--accent); color: white; border: none;
    border-radius: 9px; font-family: var(--font);
    font-size: 14px; font-weight: 500; letter-spacing: 0.01em;
    cursor: pointer; transition: background .12s, opacity .12s;
    margin-top: 8px; display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .submit-btn:hover:not(:disabled) { background: var(--accent-hover); }
  .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

  @keyframes spin { to { transform: rotate(360deg); } }
  .spinner {
    width: 14px; height: 14px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: white; border-radius: 50%;
    animation: spin .7s linear infinite;
  }

  /* ── Divider ── */
  .divider {
    display: flex; align-items: center; gap: 14px; margin: 22px 0;
  }
  .divider-line { flex: 1; height: 1px; background: var(--border); }
  .divider-label { font-size: 11.5px; color: var(--text-muted); letter-spacing: 0.06em; font-weight: 500; }

  /* ── Google btn ── */
  .google-btn {
    width: 100%; padding: 11px;
    background: var(--white); color: var(--text-secondary);
    border: 1px solid var(--border); border-radius: 9px;
    font-family: var(--font); font-size: 13.5px; font-weight: 500;
    cursor: pointer; display: flex; align-items: center;
    justify-content: center; gap: 9px;
    transition: border-color .12s, background .12s, color .12s;
  }
  .google-btn:hover {
    border-color: var(--accent-mid);
    background: var(--accent-light); color: var(--accent);
  }

  /* ── Login link ── */
  .login-row {
    text-align: center; margin-top: 24px;
    font-size: 13px; color: var(--text-muted);
  }
  .login-link {
    color: var(--accent); font-weight: 500; text-decoration: none;
  }
  .login-link:hover { text-decoration: underline; }

  /* ── Terms ── */
  .terms-text {
    font-size: 11.5px; color: var(--text-muted);
    text-align: center; margin-top: 16px; line-height: 1.6;
  }
  .terms-text a { color: var(--text-secondary); text-decoration: underline; }
`

const STEPS = [
  { label: "Create your account",    desc: "Set up your name, email, and a secure password." },
  { label: "Set up your workspace",  desc: "Create your first workspace and invite teammates." },
  { label: "Start collaborating",    desc: "Build boards, add tasks, and track progress together." },
]

function getPasswordStrength(pw) {
  if (!pw) return null
  let score = 0
  if (pw.length >= 8)                  score++
  if (/[A-Z]/.test(pw))               score++
  if (/[0-9]/.test(pw))               score++
  if (/[^A-Za-z0-9]/.test(pw))        score++
  if (score <= 1) return "weak"
  if (score <= 2) return "medium"
  return "strong"
}

export default function Register() {
  const [name, setName]         = useState("")
  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading]   = useState(false)
  const [errors, setErrors]     = useState({})
  const navigate = useNavigate()

  const validate = () => {
    const e = {}
    if (!name.trim())          e.name     = "Name is required"
    if (!email.includes("@"))  e.email    = "Enter a valid email address"
    if (password.length < 6)   e.password = "Password must be at least 6 characters"
    return e
  }

  const handleRegister = async (ev) => {
    ev.preventDefault()
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setErrors({})
    setLoading(true)
    try {
      await API.post("/register", { name, email, password })
      navigate("/")
    } catch (err) {
      console.log(err)
      setErrors({ global: "Registration failed. This email may already be in use." })
    } finally {
      setLoading(false)
    }
  }

  const strength = getPasswordStrength(password)

  return (
    <>
      <style>{styles}</style>
      <div className="reg-root">

        {/* ── Left panel ── */}
        <div className="reg-left">
          <div className="reg-left-grid" />
          <div className="reg-circle-lg" />
          <div className="reg-circle-md" />
          <div className="reg-circle-sm" />

          <div className="reg-brand">
            <div className="reg-brand-mark"><span>F</span></div>
            <span className="reg-brand-name">Flowtask</span>
          </div>

          <div className="reg-steps">
            <p className="reg-eyebrow">Get started in 3 steps</p>
            <h1 className="reg-headline">
              Your team's
              <strong>workflow starts here.</strong>
            </h1>
            <p className="reg-desc">
              Join thousands of teams who plan, track, and ship together — all in one place.
            </p>
            <div className="step-list">
              {STEPS.map((s, i) => (
                <div key={i} className="step-item">
                  <div className="step-num">{i + 1}</div>
                  <div>
                    <div className="step-label">{s.label}</div>
                    <div className="step-desc">{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="reg-left-footer">
            <div className="shield-icon">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="trust-text">
              <strong>Your data is safe.</strong><br/>
              256-bit encryption. No spam. Ever.
            </p>
          </div>
        </div>

        {/* ── Right panel ── */}
        <div className="reg-right">
          <div className="reg-card">
            <p className="card-eyebrow">Create account</p>
            <h2 className="card-title">Join Flowtask</h2>
            <p className="card-subtitle">Set up your account in under a minute.</p>

            {errors.global && (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 9, padding: "10px 14px", marginBottom: 18, fontSize: 13, color: "#ef4444", fontWeight: 500 }}>
                {errors.global}
              </div>
            )}

            <form onSubmit={handleRegister}>
              {/* Name */}
              <div className="field">
                <label className="field-label">Full name</label>
                <div className="field-input-wrap">
                  <span className="field-icon">
                    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                      <circle cx="12" cy="8" r="4"/>
                      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round"/>
                    </svg>
                  </span>
                  <input
                    className={`field-input${errors.name ? " error" : ""}`}
                    type="text"
                    placeholder="Jane Smith"
                    value={name}
                    onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: "" })) }}
                    autoComplete="name"
                  />
                </div>
                {errors.name && <p className="field-error">{errors.name}</p>}
              </div>

              {/* Email */}
              <div className="field">
                <label className="field-label">Email address</label>
                <div className="field-input-wrap">
                  <span className="field-icon">
                    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                      <path d="M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2z"/>
                      <path d="M2 8l10 7 10-7" strokeLinecap="round"/>
                    </svg>
                  </span>
                  <input
                    className={`field-input${errors.email ? " error" : ""}`}
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: "" })) }}
                    autoComplete="email"
                  />
                </div>
                {errors.email && <p className="field-error">{errors.email}</p>}
              </div>

              {/* Password */}
              <div className="field">
                <label className="field-label">Password</label>
                <div className="field-input-wrap">
                  <span className="field-icon">
                    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                      <rect x="3" y="11" width="18" height="11" rx="2"/>
                      <path d="M7 11V7a5 5 0 0110 0v4" strokeLinecap="round"/>
                    </svg>
                  </span>
                  <input
                    className={`field-input${errors.password ? " error" : ""}`}
                    type="password"
                    placeholder="Min. 6 characters"
                    value={password}
                    onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: "" })) }}
                    autoComplete="new-password"
                  />
                </div>
                {errors.password && <p className="field-error">{errors.password}</p>}

                {/* Password strength meter */}
                {password && (
                  <div className="pw-strength">
                    <div className="pw-strength-bars">
                      {[0, 1, 2, 3].map(i => (
                        <div
                          key={i}
                          className={`pw-bar${
                            strength === "weak"   && i < 1 ? " weak"   :
                            strength === "medium" && i < 3 ? " medium" :
                            strength === "strong" && i < 4 ? " strong" : ""
                          }`}
                        />
                      ))}
                    </div>
                    <span className={`pw-strength-label ${strength}`}>
                      {strength === "weak" && "Weak password"}
                      {strength === "medium" && "Medium strength"}
                      {strength === "strong" && "Strong password"}
                    </span>
                  </div>
                )}
              </div>

              <button className="submit-btn" type="submit" disabled={loading}>
                {loading ? <span className="spinner" /> : (
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                    <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" strokeLinecap="round"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M19 8l2 2-4 4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
                {loading ? "Creating account…" : "Create account"}
              </button>
            </form>

            <div className="divider">
              <div className="divider-line" />
              <span className="divider-label">or</span>
              <div className="divider-line" />
            </div>

            
            <p className="login-row">
              Already have an account?{" "}
              <a href="/" className="login-link">Sign in</a>
            </p>

            <p className="terms-text">
              By creating an account, you agree to our{" "}
              <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
            </p>
          </div>
        </div>

      </div>
    </>
  )
}
