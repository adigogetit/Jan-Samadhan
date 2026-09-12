import { Link, useNavigate, } from "react-router-dom";
import { useEffect, useState, } from "react";
import { Eye, EyeOff, ArrowRight, Check, } from "lucide-react";
import { loginUser, } from "../../services/authService";
import api from "../../services/api";
import { useAuth, } from "../../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const dashboardRoutes = {
    citizen: "/citizen/dashboard",
    government: "/government/dashboard",
    university: "/university/dashboard",
    student: "/student/dashboard",
    investor: "/investor/dashboard",
    admin: "/admin/dashboard",
  };

  const redirectUser = (user) => {
    if (!user?.role) {
      throw new Error("User role not found.");
    }

    const dashboard = dashboardRoutes[user.role];

    if (!dashboard) {
      throw new Error("Invalid user role.");
    }

    setUser(user);

    console.log("USER ROLE:", user.role);
    console.log("REDIRECTING TO:", dashboard);

    navigate(dashboard, {
      replace: true,
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("LOGIN BUTTON CLICKED");

    setError("");

    if (!formData.email || !formData.password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      console.log("SENDING LOGIN REQUEST");

      const response = await loginUser({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      console.log("LOGIN RESPONSE:", response);

      if (!response?.success) {
        throw new Error(
          response?.message ||
          "Login failed. Please try again."
        );
      }

      redirectUser(response.user);
    } catch (err) {
      console.error("Login error:", err);

      const message =
        err.response?.data?.message ||
        err.message ||
        "Unable to sign in. Please check your credentials.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  /*
   * GOOGLE LOGIN
   *
   * Google Identity Services calls this function
   * after the user successfully authenticates with Google.
   */
  const handleGoogleResponse = async (response) => {
    try {
      console.log("GOOGLE RESPONSE RECEIVED");

      setError("");
      setGoogleLoading(true);

      if (!response?.credential) {
        throw new Error(
          "Google authentication failed. No credential received."
        );
      }

      try {
        const apiResponse = await api.post("/auth/google", {
          credential: response.credential,
        });

        console.log(
          "GOOGLE BACKEND RESPONSE:",
          apiResponse.data
        );

        if (!apiResponse?.data?.success) {
          throw new Error(
            apiResponse?.data?.message ||
            "Google login failed."
          );
        }

        redirectUser(apiResponse.data.user);

      } catch (apiError) {
        const data = apiError?.response?.data;

        console.log(
          "GOOGLE AUTH ERROR:",
          data
        );

        /*
         * New Google user:
         * Backend verified Google successfully,
         * but the user hasn't selected a
         * JAN-SAMADHAN role yet.
         */
        if (data?.requiresRole) {
          navigate("/signup", {
            replace: true,
            state: {
              googleCredential: response.credential,
              googleAuth: true,
              googleProfile: data.googleProfile || null,
            },
          });

          return;
        }

        throw apiError;
      }

    } catch (err) {
      console.error(
        "Google login error:",
        err
      );

      const message =
        err.response?.data?.message ||
        err.message ||
        "Google login failed. Please try again.";

      setError(message);

    } finally {
      setGoogleLoading(false);
    }
  };

  /*
   * Initialize Google Identity Services
   */
  useEffect(() => {
    const initializeGoogle = () => {
      if (!window.google) {
        console.error(
          "Google Identity Services script not loaded."
        );

        return;
      }

      const clientId =
        import.meta.env.VITE_GOOGLE_CLIENT_ID;

      if (!clientId) {
        console.error(
          "VITE_GOOGLE_CLIENT_ID is missing."
        );

        return;
      }

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleResponse,
      });

      /*
       * We intentionally use Google's popup flow.
       *
       * The actual Google button will be rendered
       * inside the div with id="google-button".
       */
      const googleButton =
        document.getElementById(
          "google-button"
        );

      if (!googleButton) {
        return;
      }

      googleButton.innerHTML = "";

      window.google.accounts.id.renderButton(
        googleButton,
        {
          theme: "outline",
          size: "large",
          width: 360,
          text: "continue_with",
          shape: "rectangular",
        }
      );
    };

    /*
     * Google script is loaded asynchronously.
     * Give it a moment if it isn't available yet.
     */
    if (window.google) {
      initializeGoogle();
      return;
    }

    const timer = setInterval(() => {
      if (window.google) {
        clearInterval(timer);
        initializeGoogle();
      }
    }, 100);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#F7FBF8] flex">

      {/* ================= LEFT SIDE ================= */}

      <aside className="hidden lg:flex lg:w-[40%] bg-gradient-to-br from-[#18352A] via-[#1F4335] to-[#18352A] text-white p-10 xl:p-14 flex-col justify-between relative overflow-hidden border-r border-[#DDEDE4]">
        {/* Decorative ambient elements */}
        <div className="absolute right-[-70px] top-[-90px] h-72 w-72 rounded-full bg-[#2E7D5B]/20 blur-2xl pointer-events-none" />
        <div className="absolute bottom-[-80px] left-[-60px] h-64 w-64 rounded-full bg-[#2E7D5B]/15 blur-2xl pointer-events-none" />

        <div className="relative z-10">

          {/* LOGO */}

          <div className="flex items-center gap-3">

            <div className="w-11 h-11 rounded-2xl bg-[#EAF7F0] text-[#2E7D5B] flex items-center justify-center font-black text-xl shadow-sm">
              J
            </div>

            <div>

              <h1 className="font-black text-xl tracking-tight text-white">
                JAN-SAMADHAN
              </h1>

              <p className="text-xs font-semibold text-[#CFE7D8]">
                Smart Civic Innovation Platform
              </p>

            </div>

          </div>

          {/* HERO */}

          <div className="mt-20">

            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#A0D4B8]">
              Welcome back
            </p>

            <h2 className="mt-4 text-4xl xl:text-5xl font-black leading-[1.15] text-white tracking-tight">
              Turn public problems into civic solutions.
            </h2>

            <p className="mt-6 text-base leading-7 text-[#CFE7D8] max-w-md">
              Connecting citizens, government authorities,
              universities, student innovators, and industry partners
              to create transparent, measurable impact.
            </p>

          </div>

          {/* BENEFITS */}

          <div className="mt-12 space-y-4">

            {[
              "AI-driven classification and deterministic priority",
              "Direct university research and student innovation matching",
              "End-to-end transparent civic tracking and SLA directives",
              "Multi-stakeholder collaboration from report to resolution",
            ].map((item) => (

              <div
                key={item}
                className="flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 p-3"
              >

                <div className="w-6 h-6 rounded-full bg-[#EAF7F0] text-[#2E7D5B] flex items-center justify-center shrink-0">

                  <Check
                    size={13}
                    strokeWidth={3}
                  />

                </div>

                <span className="text-xs font-medium text-white/90">
                  {item}
                </span>

              </div>

            ))}

          </div>

        </div>

        <div className="pt-6 border-t border-white/15 relative z-10">

          <p className="text-xs text-[#A0D4B8]">
            JAN-SAMADHAN • Smart India Hackathon
          </p>

        </div>

      </aside>

      {/* ================= RIGHT SIDE ================= */}

      <main className="flex-1 flex items-center justify-center px-5 sm:px-8 py-10">

        <div className="w-full max-w-md">

          {/* MOBILE LOGO */}

          <div className="lg:hidden flex items-center gap-3 mb-8">

            <div className="w-10 h-10 rounded-xl bg-[#EAF7F0] text-[#2E7D5B] flex items-center justify-center font-black text-lg shadow-sm">
              J
            </div>

            <div>

              <h1 className="font-extrabold text-lg text-[#18352A]">
                JAN-SAMADHAN
              </h1>

              <p className="text-xs text-[#789087]">
                Smart Civic Innovation Platform
              </p>

            </div>

          </div>

          {/* HEADER */}

          <div className="flex items-end justify-between gap-4 mb-7">

            <div>

              <h2 className="text-3xl font-black tracking-tight text-[#18352A]">
                Welcome back
              </h2>

              <p className="mt-2 text-sm text-[#667A70]">
                Sign in to continue to JAN-SAMADHAN.
              </p>

            </div>

            <div className="hidden sm:block text-right">

              <p className="text-xs text-[#789087]">
                New here?
              </p>

              <Link
                to="/signup"
                className="text-sm font-bold text-[#2E7D5B] hover:underline"
              >
                Create account
              </Link>

            </div>

          </div>

          {/* ERROR */}

          {error && (

            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>

          )}

          {/* LOGIN CARD */}

          <div className="rounded-[26px] border border-[#DDEDE4] bg-white p-6 sm:p-8 shadow-[0_8px_30px_rgba(24,53,42,0.045)]">

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* EMAIL */}

              <div>

                <label
                  htmlFor="email"
                  className="block text-xs font-bold uppercase tracking-[0.1em] text-[#526A5E] mb-2"
                >
                  Email address
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  className="w-full h-12 rounded-xl border border-[#D7E8DE] bg-white px-4 text-sm text-[#18352A] outline-none placeholder:text-[#A0B0A8] focus:border-[#2E7D5B] focus:ring-4 focus:ring-[#EAF7F0] transition"
                />

              </div>

              {/* PASSWORD */}

              <div>

                <div className="flex items-center justify-between mb-2">

                  <label
                    htmlFor="password"
                    className="text-xs font-bold uppercase tracking-[0.1em] text-[#526A5E]"
                  >
                    Password
                  </label>

                  <button
                    type="button"
                    onClick={() =>
                      alert(
                        "Password reset flow will be added next."
                      )
                    }
                    className="text-xs font-bold text-[#2E7D5B] hover:underline"
                  >
                    Forgot password?
                  </button>

                </div>

                <div className="relative">

                  <input
                    id="password"
                    name="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                    className="w-full h-12 rounded-xl border border-[#D7E8DE] bg-white px-4 pr-11 text-sm text-[#18352A] outline-none placeholder:text-[#A0B0A8] focus:border-[#2E7D5B] focus:ring-4 focus:ring-[#EAF7F0] transition"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#789087] hover:text-[#2E7D5B] transition"
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >

                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}

                  </button>

                </div>

              </div>

              {/* REMEMBER */}

              <label className="flex items-center gap-2 cursor-pointer">

                <input
                  type="checkbox"
                  className="w-4 h-4 accent-[#2E7D5B]"
                />

                <span className="text-xs font-medium text-[#667A70]">
                  Remember me
                </span>

              </label>

              {/* SUBMIT */}

              <button
                type="submit"
                disabled={
                  loading ||
                  googleLoading
                }
                className="w-full h-12 rounded-xl bg-[#2E7D5B] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(46,125,91,0.18)] hover:bg-[#246748] transition disabled:cursor-not-allowed disabled:opacity-60"
              >

                {loading
                  ? "Signing in..."
                  : "Sign in"}

                {!loading && (
                  <ArrowRight size={18} />
                )}

              </button>

            </form>

            {/* DIVIDER */}

            <div className="flex items-center gap-4 my-6">

              <div className="h-px bg-[#DDEDE4] flex-1" />

              <span className="text-xs font-bold uppercase tracking-wider text-[#A0B0A8]">
                OR
              </span>

              <div className="h-px bg-[#DDEDE4] flex-1" />

            </div>

            {/* GOOGLE */}

            <div className="w-full">

              {googleLoading && (

                <div className="mb-3 text-center text-sm text-[#667A70]">
                  Signing in with Google...
                </div>

              )}

              <div
                id="google-button"
                className="w-full flex justify-center overflow-hidden"
              />

            </div>

            <p className="mt-3 text-center text-xs text-[#789087]">
              New Google users will complete their
              profile after authentication.
            </p>

          </div>

          {/* MOBILE SIGNUP */}

          <div className="sm:hidden mt-7 text-center text-sm text-[#667A70]">

            Don't have an account?{" "}

            <Link
              to="/signup"
              className="font-bold text-[#2E7D5B] hover:underline"
            >
              Create account
            </Link>

          </div>

          {/* BACK */}

          <button
            type="button"
            onClick={() => navigate("/")}
            className="mt-6 w-full text-center text-sm font-bold text-[#5D7469] hover:text-[#2E7D5B] transition"
          >
            ← Back to home
          </button>

        </div>

      </main>

    </div>
  );
}

export default Login;