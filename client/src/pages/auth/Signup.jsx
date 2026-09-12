import {
    Link,
    useLocation,
    useNavigate,
} from "react-router-dom";

import { useEffect, useState } from "react";

import {
    Eye,
    EyeOff,
    ArrowRight,
    Check,
} from "lucide-react";

import { signupUser } from "../../services/authService";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const roles = [
    {
        value: "citizen",
        label: "Citizen",
        description: "Report and track community problems.",
    },
    {
        value: "government",
        label: "Government",
        description: "Validate and manage civic problems.",
    },
    {
        value: "university",
        label: "University",
        description: "Connect projects with real problems.",
    },
    {
        value: "student",
        label: "Student",
        description: "Build solutions for real-world needs.",
    },
    {
        value: "investor",
        label: "Investor / Industry",
        description: "Support solutions with expertise or funding.",
    },
];

function Signup() {
    const navigate = useNavigate();
    const location = useLocation();
    const { setUser } = useAuth();

    /*
     * Google login sends us here with:
     *
     * state: {
     *   googleCredential,
     *   googleAuth,
     *   googleProfile
     * }
     */
    const googleState = location.state;

    const isGoogleSignup =
        googleState?.googleAuth === true;

    const googleCredential =
        googleState?.googleCredential || "";

    const googleProfile =
        googleState?.googleProfile || null;

    const [formData, setFormData] = useState({
        name: googleProfile?.name || "",
        phone: "",
        email: googleProfile?.email || "",
        role: "",
        department: "",
        organization: "",
        university: "",
        password: "",
        confirmPassword: "",
    });

    const [showPassword, setShowPassword] =
        useState(false);

    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);

    const [loading, setLoading] =
        useState(false);

    const [googleLoading, setGoogleLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    /*
     * If Google profile arrives after the page
     * has rendered, fill name and email.
     */
    useEffect(() => {
        if (!isGoogleSignup) {
            return;
        }

        if (!googleProfile) {
            return;
        }

        setFormData((prev) => ({
            ...prev,
            name: googleProfile.name || prev.name,
            email: googleProfile.email || prev.email,
        }));
    }, [
        isGoogleSignup,
        googleProfile?.name,
        googleProfile?.email,
    ]);

    /*
     * Initialize Google signup button.
     */
    useEffect(() => {
        const initializeGoogle = () => {
            if (!window.google) {
                console.error(
                    "Google Identity Services script is not loaded."
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

            const googleButton =
                document.getElementById(
                    "google-signup-button"
                );

            if (!googleButton) {
                return;
            }

            googleButton.innerHTML = "";

            window.google.accounts.id.initialize({
                client_id: clientId,
                callback: handleGoogleResponse,
            });

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

    const handleChange = (e) => {
        const {
            name,
            value,
        } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleRoleChange = (role) => {
        setFormData((previous) => ({
            ...previous,
            role,
            organization: "",
            university: "",
            department: "",
        }));

        setError("");
    };

    /*
     * Redirect after successful authentication.
     */
    const redirectUser = (user) => {
        if (!user?.role) {
            throw new Error(
                "User role not found after signup."
            );
        }

        const dashboardRoutes = {
            citizen: "/citizen/dashboard",
            government: "/government/dashboard",
            university: "/university/dashboard",
            student: "/student/dashboard",
            investor: "/investor/dashboard",
            admin: "/admin/dashboard",
        };

        const dashboard =
            dashboardRoutes[user.role];

        if (!dashboard) {
            throw new Error(
                "Invalid user role."
            );
        }

        /*
         * Update AuthContext before navigation.
         */
        setUser(user);

        navigate(dashboard, {
            replace: true,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");

        // -----------------------------
        // BASIC VALIDATION
        // -----------------------------

        if (!formData.name.trim()) {
            setError(
                "Please enter your full name."
            );
            return;
        }

        if (!formData.email.trim()) {
            setError(
                "Please enter your email address."
            );
            return;
        }

        if (!formData.role) {
            setError(
                "Please select your role."
            );
            return;
        }

        /*
         * Google users already authenticated
         * with Google, so they don't need a
         * JAN-SAMADHAN password here.
         */
        if (!isGoogleSignup) {
            if (formData.password.length < 8) {
                setError(
                    "Password must contain at least 8 characters."
                );
                return;
            }

            if (
                formData.password !==
                formData.confirmPassword
            ) {
                setError(
                    "Passwords do not match."
                );
                return;
            }
        }

        // -----------------------------
        // ROLE-SPECIFIC VALIDATION
        // -----------------------------

        if (
            formData.role === "government" &&
            !formData.organization.trim()
        ) {
            setError(
                "Please enter your government organization."
            );
            return;
        }

        if (
            formData.role === "government" &&
            !formData.department.trim()
        ) {
            setError(
                "Please enter your department."
            );
            return;
        }

        if (
            (
                formData.role === "university" ||
                formData.role === "student"
            ) &&
            !formData.university.trim()
        ) {
            setError(
                "Please enter your university or institution."
            );
            return;
        }

        if (
            (
                formData.role === "university" ||
                formData.role === "student"
            ) &&
            !formData.department.trim()
        ) {
            setError(
                "Please enter your department."
            );
            return;
        }

        if (
            formData.role === "investor" &&
            !formData.organization.trim()
        ) {
            setError(
                "Please enter your company or organization."
            );
            return;
        }

        // -----------------------------
        // SUBMIT
        // -----------------------------

        setLoading(true);

        try {
            /*
             * =========================================
             * GOOGLE SIGNUP
             * =========================================
             */

            if (isGoogleSignup) {
                if (!googleCredential) {
                    throw new Error(
                        "Google authentication information is missing. Please sign in with Google again."
                    );
                }

                const response =
                    await api.post(
                        "/auth/google",
                        {
                            credential:
                                googleCredential,

                            role:
                                formData.role,

                            phone:
                                formData.phone.trim() ||
                                null,

                            department:
                                formData.department.trim() ||
                                null,

                            organization:
                                formData.organization.trim() ||
                                null,

                            university:
                                formData.university.trim() ||
                                null,
                        }
                    );

                console.log(
                    "Google signup response:",
                    response.data
                );

                if (!response?.data?.success) {
                    throw new Error(
                        response?.data?.message ||
                        "Unable to complete Google signup."
                    );
                }

                redirectUser(
                    response.data.user
                );

                return;
            }

            /*
             * =========================================
             * NORMAL EMAIL/PASSWORD SIGNUP
             * =========================================
             */

            const response =
                await signupUser({
                    name:
                        formData.name.trim(),

                    email:
                        formData.email
                            .trim()
                            .toLowerCase(),

                    password:
                        formData.password,

                    phone:
                        formData.phone.trim() ||
                        null,

                    role:
                        formData.role,

                    department:
                        formData.department.trim() ||
                        null,

                    organizationId: null,

                    universityId: null,
                });

            console.log(
                "Signup successful:",
                response
            );

            redirectUser(
                response.user
            );

        } catch (err) {
            console.error(
                "Signup error:",
                err
            );

            const message =
                err?.response?.data?.message ||
                err?.message ||
                "Unable to create your account. Please try again.";

            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleResponse = async (response) => {
        try {
            console.log(
                "GOOGLE RESPONSE RECEIVED"
            );

            setError("");
            setGoogleLoading(true);

            if (!response?.credential) {
                throw new Error(
                    "Google authentication failed. No credential received."
                );
            }

            try {
                const apiResponse =
                    await api.post(
                        "/auth/google",
                        {
                            credential:
                                response.credential,
                        }
                    );

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

                redirectUser(
                    apiResponse.data.user
                );

            } catch (apiError) {
                const data =
                    apiError?.response?.data;

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
                            googleCredential:
                                response.credential,

                            googleAuth: true,

                            googleProfile:
                                data.googleProfile ||
                                null,
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

    return (
        <div className="min-h-screen bg-[#F7FBF8] flex">

            {/* =====================================================
                LEFT SIDE
            ===================================================== */}

            <aside className="hidden lg:flex lg:w-[38%] bg-gradient-to-br from-[#18352A] via-[#1F4335] to-[#18352A] text-white p-10 xl:p-14 flex-col justify-between relative overflow-hidden border-r border-[#DDEDE4]">
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

                            {isGoogleSignup
                                ? "Complete your profile"
                                : "Join the ecosystem"}

                        </p>

                        <h2 className="mt-4 text-4xl xl:text-5xl font-black leading-[1.15] text-white tracking-tight">

                            {isGoogleSignup
                                ? "You're almost ready."
                                : "Let's solve problems together."}

                        </h2>

                        <p className="mt-6 text-base leading-7 text-[#CFE7D8] max-w-md">

                            {isGoogleSignup
                                ? "Choose your JAN-SAMADHAN role and complete your profile to continue."
                                : "Connect with citizens, government, universities, students and industry to turn real problems into meaningful solutions."}

                        </p>

                    </div>

                    {/* BENEFITS */}

                    <div className="mt-12 space-y-4">

                        {[
                            "Report real problems in your community",
                            "Discover projects that need solutions",
                            "Collaborate with government and universities",
                            "Turn ideas into real-world impact",
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

                {/* FOOTER */}

                <div className="pt-6 border-t border-white/15 relative z-10">

                    <p className="text-xs text-[#A0D4B8]">
                        JAN-SAMADHAN • Smart India Hackathon
                    </p>

                </div>

            </aside>

            {/* =====================================================
                RIGHT SIDE
            ===================================================== */}

            <main className="flex-1 flex justify-center px-4 sm:px-6 py-6 lg:py-8 overflow-y-auto">

                <div className="w-full max-w-2xl">

                    {/* MOBILE LOGO */}

                    <div className="lg:hidden flex items-center gap-3 mb-6">

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

                    <div className="mb-5">

                        <div className="flex items-end justify-between gap-4">

                            <div>

                                <h2 className="text-3xl font-black tracking-tight text-[#18352A]">

                                    {isGoogleSignup
                                        ? "Complete your account"
                                        : "Create your account"}

                                </h2>

                                <p className="mt-2 text-sm text-[#667A70]">

                                    {isGoogleSignup
                                        ? "Your Google details are already verified. Complete the remaining information."
                                        : "Join JAN-SAMADHAN and start making an impact."}

                                </p>

                            </div>

                            <div className="hidden sm:block text-right">

                                <p className="text-xs text-[#789087]">
                                    Already registered?
                                </p>

                                <Link
                                    to="/login"
                                    className="text-sm font-bold text-[#2E7D5B] hover:underline"
                                >
                                    Sign in
                                </Link>

                            </div>

                        </div>

                    </div>

                    {/* GOOGLE ACCOUNT INFO */}

                    {isGoogleSignup && (

                        <div className="mb-4 rounded-xl border border-primary/20 bg-white p-3">

                            <div className="flex items-center gap-3">

                                {googleProfile?.picture ? (

                                    <img
                                        src={
                                            googleProfile.picture
                                        }
                                        alt=""
                                        className="w-9 h-9 rounded-full"
                                    />

                                ) : (

                                    <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-semibold">

                                        {formData.name
                                            ?.charAt(0)
                                            ?.toUpperCase() ||
                                            "G"}

                                    </div>

                                )}

                                <div>

                                    <p className="text-sm font-semibold text-text">
                                        Google account connected
                                    </p>

                                    <p className="text-xs text-text-secondary">
                                        {formData.email}
                                    </p>

                                </div>

                                <div className="ml-auto w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center">

                                    <Check size={14} />

                                </div>

                            </div>

                        </div>

                    )}

                    {/* ERROR */}

                    {error && (

                        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

                            {error}

                        </div>

                    )}

                    {/* =================================================
                        FORM
                    ================================================= */}

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-4"
                    >

                        {/* BASIC INFORMATION */}

                        <section className="rounded-2xl border border-border p-4 sm:p-5">

                            <div className="mb-4">

                                <h3 className="text-base font-semibold text-text">
                                    Basic information
                                </h3>

                                <p className="mt-1 text-xs text-text-secondary">

                                    {isGoogleSignup
                                        ? "Your name and email were provided by Google."
                                        : "Tell us a little about yourself."}

                                </p>

                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                {/* NAME */}

                                <div>

                                    <label className="block text-sm font-medium text-text mb-1.5">
                                        Full name
                                    </label>

                                    <input
                                        name="name"
                                        type="text"
                                        value={
                                            formData.name
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Your full name"
                                        required
                                        readOnly={
                                            isGoogleSignup
                                        }
                                        autoComplete="name"
                                        className={`w-full h-10 rounded-lg border border-border px-3 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 ${isGoogleSignup
                                                ? "bg-slate-50 cursor-not-allowed"
                                                : "bg-white"
                                            }`}
                                    />

                                    {isGoogleSignup && (

                                        <p className="mt-1 text-[11px] text-text-secondary">
                                            Verified through Google
                                        </p>

                                    )}

                                </div>

                                {/* PHONE */}

                                <div>

                                    <label className="block text-sm font-medium text-text mb-1.5">
                                        Phone number
                                    </label>

                                    <input
                                        name="phone"
                                        type="tel"
                                        value={
                                            formData.phone
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Your phone number"
                                        autoComplete="tel"
                                        className="w-full h-10 rounded-lg border border-border bg-white px-3 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    />

                                </div>

                                {/* EMAIL */}

                                <div className="md:col-span-2">

                                    <label className="block text-sm font-medium text-text mb-1.5">
                                        Email address
                                    </label>

                                    <input
                                        name="email"
                                        type="email"
                                        value={
                                            formData.email
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="you@example.com"
                                        required
                                        readOnly={
                                            isGoogleSignup
                                        }
                                        autoComplete="email"
                                        className={`w-full h-10 rounded-lg border border-border px-3 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 ${isGoogleSignup
                                                ? "bg-slate-50 cursor-not-allowed"
                                                : "bg-white"
                                            }`}
                                    />

                                    {isGoogleSignup && (

                                        <p className="mt-1 text-[11px] text-text-secondary">
                                            Verified through Google
                                        </p>

                                    )}

                                </div>

                            </div>

                        </section>

                        {/* =================================================
                            ROLE
                        ================================================= */}

                        <section className="rounded-2xl border border-border p-4 sm:p-5">

                            <div className="mb-3">

                                <h3 className="text-base font-semibold text-text">
                                    Choose your role
                                </h3>

                                <p className="mt-1 text-xs text-text-secondary">
                                    Your role determines what you can do on the platform.
                                </p>

                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">

                                {roles.map((role) => {

                                    const selected =
                                        formData.role ===
                                        role.value;

                                    return (

                                        <button
                                            key={
                                                role.value
                                            }
                                            type="button"
                                            onClick={() =>
                                                handleRoleChange(
                                                    role.value
                                                )
                                            }
                                            className={`relative text-left rounded-xl border p-3 transition ${selected
                                                    ? "border-primary"
                                                    : "border-border hover:border-primary"
                                                }`}
                                        >

                                            {selected && (

                                                <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center">

                                                    <Check
                                                        size={12}
                                                        strokeWidth={
                                                            3
                                                        }
                                                    />

                                                </div>

                                            )}

                                            <div
                                                className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 font-semibold text-sm ${selected
                                                        ? "bg-primary text-white"
                                                        : "border border-border text-text-secondary"
                                                    }`}
                                            >

                                                {
                                                    role.label.charAt(
                                                        0
                                                    )
                                                }

                                            </div>

                                            <p className="text-sm font-semibold text-text pr-5">
                                                {
                                                    role.label
                                                }
                                            </p>

                                            <p className="mt-1 text-xs leading-4 text-text-secondary">
                                                {
                                                    role.description
                                                }
                                            </p>

                                        </button>

                                    );
                                })}

                            </div>

                        </section>

                        {/* =================================================
                            PROFESSIONAL INFORMATION
                        ================================================= */}

                        {formData.role && (

                            <section className="rounded-2xl border border-border p-4 sm:p-5">

                                <div className="mb-4">

                                    <h3 className="text-base font-semibold text-text">

                                        {formData.role ===
                                            "citizen"
                                            ? "Almost there"
                                            : "Professional information"}

                                    </h3>

                                    <p className="mt-1 text-xs text-text-secondary">

                                        {formData.role ===
                                            "citizen"
                                            ? "Your account is ready for the next step."
                                            : "Add information related to your role."}

                                    </p>

                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                    {/* GOVERNMENT */}

                                    {formData.role ===
                                        "government" && (
                                            <>

                                                <div>

                                                    <label className="block text-sm font-medium text-text mb-1.5">
                                                        Organization
                                                    </label>

                                                    <input
                                                        name="organization"
                                                        value={
                                                            formData.organization
                                                        }
                                                        onChange={
                                                            handleChange
                                                        }
                                                        placeholder="Government organization"
                                                        className="w-full h-10 rounded-lg border border-border bg-white px-3 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                                    />

                                                </div>

                                                <div>

                                                    <label className="block text-sm font-medium text-text mb-1.5">
                                                        Department
                                                    </label>

                                                    <input
                                                        name="department"
                                                        value={
                                                            formData.department
                                                        }
                                                        onChange={
                                                            handleChange
                                                        }
                                                        placeholder="Your department"
                                                        className="w-full h-10 rounded-lg border border-border bg-white px-3 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                                    />

                                                </div>

                                            </>
                                        )}

                                    {/* UNIVERSITY */}

                                    {formData.role ===
                                        "university" && (
                                            <>

                                                <div>

                                                    <label className="block text-sm font-medium text-text mb-1.5">
                                                        University / Institution
                                                    </label>

                                                    <input
                                                        name="university"
                                                        value={
                                                            formData.university
                                                        }
                                                        onChange={
                                                            handleChange
                                                        }
                                                        placeholder="University name"
                                                        className="w-full h-10 rounded-lg border border-border bg-white px-3 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                                    />

                                                </div>

                                                <div>

                                                    <label className="block text-sm font-medium text-text mb-1.5">
                                                        Department
                                                    </label>

                                                    <input
                                                        name="department"
                                                        value={
                                                            formData.department
                                                        }
                                                        onChange={
                                                            handleChange
                                                        }
                                                        placeholder="Department"
                                                        className="w-full h-10 rounded-lg border border-border bg-white px-3 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                                    />

                                                </div>

                                            </>
                                        )}

                                    {/* STUDENT */}

                                    {formData.role ===
                                        "student" && (
                                            <>

                                                <div>

                                                    <label className="block text-sm font-medium text-text mb-1.5">
                                                        University / Institution
                                                    </label>

                                                    <input
                                                        name="university"
                                                        value={
                                                            formData.university
                                                        }
                                                        onChange={
                                                            handleChange
                                                        }
                                                        placeholder="University name"
                                                        className="w-full h-10 rounded-lg border border-border bg-white px-3 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                                    />

                                                </div>

                                                <div>

                                                    <label className="block text-sm font-medium text-text mb-1.5">
                                                        Department
                                                    </label>

                                                    <input
                                                        name="department"
                                                        value={
                                                            formData.department
                                                        }
                                                        onChange={
                                                            handleChange
                                                        }
                                                        placeholder="Department"
                                                        className="w-full h-10 rounded-lg border border-border bg-white px-3 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                                    />

                                                </div>

                                            </>
                                        )}

                                    {/* INVESTOR */}

                                    {formData.role ===
                                        "investor" && (

                                            <div className="md:col-span-2">

                                                <label className="block text-sm font-medium text-text mb-1.5">
                                                    Organization / Company
                                                </label>

                                                <input
                                                    name="organization"
                                                    value={
                                                        formData.organization
                                                    }
                                                    onChange={
                                                        handleChange
                                                    }
                                                    placeholder="Company or organization name"
                                                    className="w-full h-10 rounded-lg border border-border bg-white px-3 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                                />

                                            </div>

                                        )}

                                    {/* CITIZEN */}

                                    {formData.role ===
                                        "citizen" && (

                                            <div className="md:col-span-2">

                                                <div className="flex items-center gap-3">

                                                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">

                                                        <Check size={16} />

                                                    </div>

                                                    <p className="text-sm text-text-secondary">

                                                        You're ready to report and track community problems.

                                                    </p>

                                                </div>

                                            </div>

                                        )}

                                </div>

                            </section>

                        )}

                        {/* =================================================
                            PASSWORD
                        ================================================= */}

                        {!isGoogleSignup && (

                            <section className="rounded-2xl border border-border p-4 sm:p-5">

                                <div className="mb-4">

                                    <h3 className="text-base font-semibold text-text">
                                        Secure your account
                                    </h3>

                                    <p className="mt-1 text-xs text-text-secondary">
                                        Use at least 8 characters for your password.
                                    </p>

                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                    {/* PASSWORD */}

                                    <div>

                                        <label className="block text-sm font-medium text-text mb-1.5">
                                            Password
                                        </label>

                                        <div className="relative">

                                            <input
                                                name="password"
                                                type={
                                                    showPassword
                                                        ? "text"
                                                        : "password"
                                                }
                                                value={
                                                    formData.password
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="Create password"
                                                required
                                                autoComplete="new-password"
                                                className="w-full h-10 rounded-lg border border-border bg-white px-3 pr-10 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                            />

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowPassword(
                                                        !showPassword
                                                    )
                                                }
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-primary"
                                            >

                                                {showPassword ? (
                                                    <EyeOff size={17} />
                                                ) : (
                                                    <Eye size={17} />
                                                )}

                                            </button>

                                        </div>

                                    </div>

                                    {/* CONFIRM PASSWORD */}

                                    <div>

                                        <label className="block text-sm font-medium text-text mb-1.5">
                                            Confirm password
                                        </label>

                                        <div className="relative">

                                            <input
                                                name="confirmPassword"
                                                type={
                                                    showConfirmPassword
                                                        ? "text"
                                                        : "password"
                                                }
                                                value={
                                                    formData.confirmPassword
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="Confirm password"
                                                required
                                                autoComplete="new-password"
                                                className="w-full h-10 rounded-lg border border-border bg-white px-3 pr-10 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                            />

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowConfirmPassword(
                                                        !showConfirmPassword
                                                    )
                                                }
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-primary"
                                            >

                                                {showConfirmPassword ? (
                                                    <EyeOff size={17} />
                                                ) : (
                                                    <Eye size={17} />
                                                )}

                                            </button>

                                        </div>

                                    </div>

                                </div>

                            </section>

                        )}

                        {/* GOOGLE NOTICE */}

                        {isGoogleSignup && (

                            <div className="rounded-xl border border-border bg-slate-50 px-4 py-3">

                                <p className="text-xs text-text-secondary">

                                    🔐 Your Google account has already verified your identity. No additional password is required.

                                </p>

                            </div>

                        )}

                        {/* CREATE ACCOUNT */}

                        <div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-11 rounded-xl bg-primary text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-60"
                            >

                                {loading
                                    ? isGoogleSignup
                                        ? "Creating your account..."
                                        : "Creating account..."
                                    : isGoogleSignup
                                        ? "Complete Google signup"
                                        : "Create account"}

                                {!loading && (
                                    <ArrowRight size={18} />
                                )}

                            </button>

                        </div>

                    </form>

                    {/* =================================================
                        GOOGLE SIGNUP
                    ================================================= */}

                    {!isGoogleSignup && (

                        <div className="mt-4">

                            <div className="flex items-center gap-4 mb-4">

                                <div className="h-px bg-border flex-1" />

                                <span className="text-xs text-text-secondary">
                                    OR
                                </span>

                                <div className="h-px bg-border flex-1" />

                            </div>

                            {googleLoading && (

                                <p className="mb-3 text-center text-sm text-text-secondary">
                                    Connecting to Google...
                                </p>

                            )}

                            <div
                                id="google-signup-button"
                                className="w-full flex justify-center overflow-hidden"
                            />

                            <p className="mt-2 text-center text-xs text-text-secondary">
                                Continue securely with your Google account.
                            </p>

                        </div>

                    )}

                    {/* MOBILE LOGIN */}

                    <div className="sm:hidden mt-6 text-center text-sm text-text-secondary">

                        Already have an account?{" "}

                        <Link
                            to="/login"
                            className="font-semibold text-primary hover:underline"
                        >
                            Sign in
                        </Link>

                    </div>

                    {/* BACK HOME */}

                    <button
                        type="button"
                        onClick={() => navigate("/")}
                        className="mt-5 w-full text-center text-sm text-text-secondary hover:text-primary"
                    >
                        ← Back to home
                    </button>

                </div>

            </main>

        </div>
    );
}

export default Signup;
