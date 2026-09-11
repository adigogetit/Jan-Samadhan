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
    <div className="min-h-screen bg-white flex">

      {/* ================= LEFT SIDE ================= */}

      <aside className="hidden lg:flex lg:w-[38%] bg-primary text-white p-10 xl:p-14 flex-col justify-between">

        <div>

          {/* LOGO */}

          <div className="flex items-center gap-3">

            <div className="w-11 h-11 rounded-xl bg-white text-primary flex items-center justify-center font-bold">
              JS
            </div>

            <div>

              <h1 className="font-bold text-xl tracking-tight">
                JAN-SAMADHAN
              </h1>

              <p className="text-xs text-white/75">
                Smart Civic Innovation Platform
              </p>

            </div>

          </div>

          {/* HERO */}

          <div className="mt-24">

            <p className="text-sm font-semibold uppercase tracking-widest text-white/70">
              Welcome back
            </p>

            <h2 className="mt-4 text-4xl xl:text-5xl font-bold leading-[1.1]">
              Turn problems into solutions.
            </h2>

            <p className="mt-6 text-base xl:text-lg leading-7 text-white/85 max-w-md">
              Continue connecting citizens, government,
              universities, students and industry to create
              meaningful solutions for Jharkhand.
            </p>

          </div>

          {/* BENEFITS */}

          <div className="mt-12 space-y-5">

            {[
              "Track problems and their progress",
              "Collaborate with the right people",
              "Discover projects and opportunities",
              "Create measurable social impact",
            ].map((item) => (

              <div
                key={item}
                className="flex items-center gap-3"
              >

                <div className="w-6 h-6 rounded-full bg-white text-primary flex items-center justify-center shrink-0">

                  <Check
                    size={14}
                    strokeWidth={3}
                  />

                </div>

                <span className="text-sm text-white/90">
                  {item}
                </span>

              </div>

            ))}

          </div>

        </div>

        <div className="pt-6 border-t border-white/20">

          <p className="text-xs text-white/65">
            JAN-SAMADHAN • Smart India Hackathon
          </p>

        </div>

      </aside>

      {/* ================= RIGHT SIDE ================= */}

      <main className="flex-1 flex items-center justify-center px-5 sm:px-8 py-10">

        <div className="w-full max-w-md">

          {/* MOBILE LOGO */}

          <div className="lg:hidden flex items-center gap-3 mb-10">

            <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold">
              JS
            </div>

            <div>

              <h1 className="font-bold text-lg text-primary">
                JAN-SAMADHAN
              </h1>

              <p className="text-xs text-text-secondary">
                Smart Civic Innovation Platform
              </p>

            </div>

          </div>

          {/* HEADER */}

          <div className="flex items-end justify-between gap-4 mb-7">

            <div>

              <h2 className="text-3xl font-bold text-text">
                Welcome back
              </h2>

              <p className="mt-2 text-sm text-text-secondary">
                Sign in to continue to JAN-SAMADHAN.
              </p>

            </div>

            <div className="hidden sm:block text-right">

              <p className="text-xs text-text-secondary">
                New here?
              </p>

              <Link
                to="/signup"
                className="text-sm font-semibold text-primary hover:underline"
              >
                Create account
              </Link>

            </div>

          </div>

          {/* ERROR */}

          {error && (

            <div className="mb-5 rounded-lg border border-red-200 bg-white px-4 py-3 text-sm text-red-600">
              {error}
            </div>

          )}

          {/* LOGIN CARD */}

          <div className="rounded-2xl border border-border p-5 sm:p-6">

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* EMAIL */}

              <div>

                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-text mb-2"
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
                  className="w-full h-11 rounded-lg border border-border bg-white px-3.5 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />

              </div>

              {/* PASSWORD */}

              <div>

                <div className="flex items-center justify-between mb-2">

                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-text"
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
                    className="text-xs font-medium text-primary hover:underline"
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
                    className="w-full h-11 rounded-lg border border-border bg-white px-3.5 pr-11 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-primary"
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
                  className="w-4 h-4 accent-primary"
                />

                <span className="text-xs text-text-secondary">
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
                className="w-full h-12 rounded-xl bg-primary text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-60"
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

              <div className="h-px bg-border flex-1" />

              <span className="text-xs text-text-secondary">
                OR
              </span>

              <div className="h-px bg-border flex-1" />

            </div>

            {/* GOOGLE */}

            <div className="w-full">

              {googleLoading && (

                <div className="mb-3 text-center text-sm text-text-secondary">
                  Signing in with Google...
                </div>

              )}

              <div
                id="google-button"
                className="w-full flex justify-center overflow-hidden"
              />

            </div>

            <p className="mt-3 text-center text-xs text-text-secondary">
              New Google users will complete their
              profile after authentication.
            </p>

          </div>

          {/* MOBILE SIGNUP */}

          <div className="sm:hidden mt-7 text-center text-sm text-text-secondary">

            Don't have an account?{" "}

            <Link
              to="/signup"
              className="font-semibold text-primary hover:underline"
            >
              Create account
            </Link>

          </div>

          {/* BACK */}

          <button
            type="button"
            onClick={() => navigate("/")}
            className="mt-6 w-full text-center text-sm text-text-secondary hover:text-primary"
          >
            ← Back to home
          </button>

        </div>

      </main>

    </div>
  );
}

export default Login;