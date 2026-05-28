import { useState } from "react";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";

import { auth } from "../firebase";
import { useNavigate, Link } from "react-router-dom";

const provider = new GoogleAuthProvider();

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      alert(error.message);
    }

    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);

      await signInWithPopup(auth, provider);

      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      alert(error.message);
    }

    setLoading(false);
  };

  return (
    <>
      <style>{`
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700;800&family=Share+Tech+Mono&display=swap');

*{
  margin:0;
  padding:0;
  box-sizing:border-box;
}

body{
  background:#02060d;
  overflow-x:hidden;
}

.pmn-login-root{
  min-height:100vh;
  min-height:100dvh;
  overflow:hidden;
  display:flex;
  justify-content:center;
  align-items:center;
  position:relative;
  background:
    radial-gradient(circle at top,#07253d 0%,#02060d 45%,#000 100%);
  font-family:'Orbitron',sans-serif;
}

.pmn-login-root::before{
  content:'';
  position:absolute;
  width:200%;
  height:200%;
  background:
    linear-gradient(rgba(0,255,255,.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,255,255,.04) 1px, transparent 1px);
  background-size:60px 60px;
  animation:gridMove 14s linear infinite;
  transform:perspective(900px) rotateX(75deg);
  transform-origin:center;
  bottom:-60%;
}

@keyframes gridMove{
  from{
    transform:perspective(900px) rotateX(75deg) translateY(0);
  }
  to{
    transform:perspective(900px) rotateX(75deg) translateY(60px);
  }
}

.pmn-login-root::after{
  content:'';
  position:absolute;
  inset:0;
  background-image:
    radial-gradient(circle,#00e5ff 1px,transparent 1px),
    radial-gradient(circle,#00e5ff 1px,transparent 1px),
    radial-gradient(circle,#ff006e 1px,transparent 1px);
  background-size:180px 180px;
  animation:particlesMove 18s linear infinite;
  opacity:.35;
}

@keyframes particlesMove{
  from{
    transform:translateY(0);
  }
  to{
    transform:translateY(-200px);
  }
}

.pmn-grid-bg{
  position:absolute;
  inset:0;
  overflow:hidden;
  opacity:.18;
  pointer-events:none;
}

.pmn-grid-bg::before{
  content:
  '010101010101010101010101010101010101010101010101010101010101';
  position:absolute;
  left:5%;
  top:-100%;
  color:#00d9ff;
  font-size:18px;
  letter-spacing:10px;
  writing-mode:vertical-rl;
  animation:binaryRain 7s linear infinite;
}

.pmn-grid-bg::after{
  content:
  '110010101010101001010101010101010101001010101010101010101010';
  position:absolute;
  right:8%;
  top:-120%;
  color:#00d9ff;
  font-size:16px;
  letter-spacing:10px;
  writing-mode:vertical-rl;
  animation:binaryRain2 9s linear infinite;
}

@keyframes binaryRain{
  from{transform:translateY(-100%);}
  to{transform:translateY(220%);}
}

@keyframes binaryRain2{
  from{transform:translateY(-100%);}
  to{transform:translateY(240%);}
}

.pmn-scan-line{
  position:absolute;
  width:100%;
  height:4px;
  background:
    linear-gradient(
      90deg,
      transparent,
      rgba(0,255,255,.2),
      #00f0ff,
      rgba(0,255,255,.2),
      transparent
    );
  box-shadow:
    0 0 20px #00f0ff,
    0 0 40px #00f0ff;
  animation:scanMove 4s linear infinite;
  z-index:1;
}

@keyframes scanMove{
  from{
    top:-10%;
  }
  to{
    top:110%;
  }
}

.pmn-card{
  position:relative;
  width:100%;
  max-width:460px;
  padding:40px 34px;
  border-radius:20px;
  overflow:hidden;
  background:
    linear-gradient(
      180deg,
      rgba(5,20,40,.92),
      rgba(0,5,15,.95)
    );
  border:1px solid rgba(0,255,255,.25);
  backdrop-filter:blur(14px);
  -webkit-backdrop-filter:blur(14px);
  transform:translateZ(0);
  will-change:transform;
  box-shadow:
    0 0 30px rgba(0,255,255,.15),
    0 0 80px rgba(0,255,255,.08),
    inset 0 0 20px rgba(0,255,255,.06);
  animation:cardFloat 5s ease-in-out infinite;
  z-index:10;
}

@keyframes cardFloat{
  0%{transform:translateY(0px);}
  50%{transform:translateY(-8px);}
  100%{transform:translateY(0px);}
}

.pmn-card::before{
  content:'';
  position:absolute;
  inset:-2px;
  border-radius:20px;
  padding:2px;
  background:
    linear-gradient(
      45deg,
      transparent,
      #00f0ff,
      #ff006e,
      #00f0ff,
      transparent
    );
  background-size:400%;
  animation:borderMove 8s linear infinite;
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite:xor;
  mask-composite:exclude;
}

@keyframes borderMove{
  0%{background-position:0%;}
  100%{background-position:400%;}
}

.pmn-corner{
  position:absolute;
  width:22px;
  height:22px;
  border:2px solid #00e5ff;
  filter:drop-shadow(0 0 10px #00e5ff);
  animation:cornerPulse 2s infinite alternate;
}

@keyframes cornerPulse{
  from{
    opacity:.5;
  }
  to{
    opacity:1;
  }
}

.pmn-corner-tl{
  top:10px;
  left:10px;
  border-right:none;
  border-bottom:none;
}

.pmn-corner-tr{
  top:10px;
  right:10px;
  border-left:none;
  border-bottom:none;
}

.pmn-corner-bl{
  bottom:10px;
  left:10px;
  border-right:none;
  border-top:none;
}

.pmn-corner-br{
  bottom:10px;
  right:10px;
  border-left:none;
  border-top:none;
}

.pmn-brand{
  display:flex;
  justify-content:center;
  align-items:center;
  gap:14px;
  margin-bottom:12px;
}

.pmn-shield{
  width:68px;
  height:68px;
  border-radius:18px;
  display:flex;
  justify-content:center;
  align-items:center;
  font-size:34px;
  color:#00f0ff;
  background:rgba(0,255,255,.08);
  border:1px solid rgba(0,255,255,.35);
  box-shadow:
    0 0 20px rgba(0,255,255,.5),
    inset 0 0 20px rgba(0,255,255,.2);
  animation:shieldPulse 2s infinite alternate;
}

@keyframes shieldPulse{
  from{
    transform:scale(1);
    box-shadow:
      0 0 20px rgba(0,255,255,.4);
  }
  to{
    transform:scale(1.06);
    box-shadow:
      0 0 40px rgba(0,255,255,.9),
      0 0 80px rgba(0,255,255,.3);
  }
}

.pmn-brand-name{
  font-size:40px;
  font-weight:800;
  color:#00f0ff;
  text-shadow:
    0 0 8px #00f0ff,
    0 0 18px #00f0ff;
  animation:textFlicker 3s infinite;
}

.pmn-brand-name em{
  color:#ff006e;
  font-style:normal;
  text-shadow:
    0 0 8px #ff006e,
    0 0 20px #ff006e;
}

@keyframes textFlicker{
  0%,18%,22%,25%,53%,57%,100%{
    opacity:1;
  }
  20%,24%,55%{
    opacity:.6;
  }
}

.pmn-tagline{
  text-align:center;
  color:#00d5ff;
  letter-spacing:4px;
  font-size:13px;
  margin-bottom:30px;
  text-shadow:0 0 10px #00f0ff;
  animation:tagGlow 2s infinite alternate;
}

@keyframes tagGlow{
  from{
    opacity:.6;
  }
  to{
    opacity:1;
  }
}

.pmn-label{
  color:#00d9ff;
  font-size:13px;
  margin-bottom:10px;
  display:block;
  letter-spacing:3px;
}

.pmn-input{
  width:100%;
  background:rgba(0,10,20,.8);
  border:1px solid rgba(0,255,255,.2);
  border-radius:12px;
  padding:16px;
  margin-bottom:22px;
  color:#b8ffff;
  font-size:15px;
  outline:none;
  transition:.3s;
  font-family:'Share Tech Mono',monospace;
  box-shadow:inset 0 0 10px rgba(0,255,255,.05);
}

.pmn-input:focus{
  border-color:#00f0ff;
  box-shadow:
    0 0 20px rgba(0,255,255,.25),
    inset 0 0 10px rgba(0,255,255,.12);
  transform:scale(1.01);
}

.pmn-input::placeholder{
  color:#3c6c7d;
}

.pmn-btn-primary{
  width:100%;
  padding:18px;
  border:none;
  border-radius:14px;
  cursor:pointer;
  color:white;
  font-size:18px;
  font-weight:700;
  letter-spacing:4px;
  position:relative;
  overflow:hidden;
  background:
    linear-gradient(
      90deg,
      #00d9ff,
      #0066ff
    );
  box-shadow:
    0 0 20px rgba(0,255,255,.4),
    0 0 50px rgba(0,255,255,.2);
  transition:.3s;
}

.pmn-btn-primary:hover{
  transform:translateY(-2px) scale(1.02);
  box-shadow:
    0 0 30px rgba(0,255,255,.7),
    0 0 70px rgba(0,255,255,.35);
}

.pmn-btn-primary::before{
  content:'';
  position:absolute;
  top:0;
  left:-120%;
  width:100%;
  height:100%;
  background:
    linear-gradient(
      90deg,
      transparent,
      rgba(255,255,255,.5),
      transparent
    );
  animation:btnSweep 2s linear infinite;
}

@keyframes btnSweep{
  to{
    left:120%;
  }
}

.pmn-divider{
  display:flex;
  align-items:center;
  gap:12px;
  margin:26px 0;
}

.pmn-divider-line{
  flex:1;
  height:1px;
  background:rgba(0,255,255,.18);
}

.pmn-divider-text{
  color:#00d5ff;
  letter-spacing:3px;
  font-size:12px;
}

.pmn-btn-google{
  width:100%;
  padding:16px;
  border-radius:12px;
  border:1px solid rgba(0,255,255,.18);
  background:rgba(0,10,20,.7);
  color:#d6f8ff;
  display:flex;
  align-items:center;
  justify-content:center;
  gap:12px;
  cursor:pointer;
  transition:.3s;
  font-size:15px;
  letter-spacing:2px;
}

.pmn-btn-google:hover{
  border-color:#00f0ff;
  box-shadow:
    0 0 20px rgba(0,255,255,.15);
  transform:translateY(-2px);
}

.pmn-footer{
  margin-top:24px;
  text-align:center;
  color:#567f91;
  letter-spacing:2px;
  font-size:13px;
}

.pmn-footer a{
  color:#00f0ff;
  text-decoration:none;
  margin-left:8px;
  text-shadow:0 0 8px #00f0ff;
  transition:.3s;
}

.pmn-footer a:hover{
  color:white;
}

.pmn-spinner{
  display:inline-block;
  width:14px;
  height:14px;
  border:2px solid rgba(255,255,255,.3);
  border-top-color:#fff;
  border-radius:50%;
  animation:spin .7s linear infinite;
  margin-right:8px;
}

@keyframes spin{
  to{
    transform:rotate(360deg);
  }
}

@media(max-width:480px){

  .pmn-card{
    margin:10px;
    padding:30px 22px;
  }

  .pmn-brand-name{
    font-size:28px;
  }

  .pmn-shield{
    width:54px;
    height:54px;
    font-size:28px;
  }

  .pmn-btn-primary{
    font-size:16px;
    letter-spacing:2px;
  }

}
`}</style>

      <div className="pmn-login-root">
        <div className="pmn-grid-bg" />
        <div className="pmn-scan-line" />

        <div className="pmn-card">
          <div className="pmn-corner pmn-corner-tl" />
          <div className="pmn-corner pmn-corner-tr" />
          <div className="pmn-corner pmn-corner-bl" />
          <div className="pmn-corner pmn-corner-br" />

          <div className="pmn-brand">
            <div className="pmn-shield">
              🛡
            </div>

            <div className="pmn-brand-name">
              PhishMe<em>Not</em> AI
            </div>
          </div>

          <div className="pmn-tagline">
            VERSION v1.5x
          </div>

          <form onSubmit={handleLogin}>
            <label className="pmn-label">
              USER_ID
            </label>

            <input
              className="pmn-input"
              type="email"
              placeholder="operator@domain.com"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
            />

            <label className="pmn-label">
              ACCESS_KEY
            </label>

            <input
              className="pmn-input"
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
            />

            <button
              className="pmn-btn-primary"
              type="submit"
              disabled={loading}
            >
              {loading && (
                <span className="pmn-spinner" />
              )}

              {loading
                ? "INITIALIZING..."
                : "START DETECTING"}
            </button>
          </form>

          <div className="pmn-divider">
            <div className="pmn-divider-line" />

            <span className="pmn-divider-text">
              OR
            </span>

            <div className="pmn-divider-line" />
          </div>

          <button
            className="pmn-btn-google"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
            >
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />

              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />

              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              />

              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>

            AUTHENTICATE WITH GOOGLE
          </button>

          <div className="pmn-footer">
            NO ACCOUNT?

            <Link to="/signup">
              SIGN UP
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;