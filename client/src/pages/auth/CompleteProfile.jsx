import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  BriefcaseBusiness,
  CheckCircle2,
  GraduationCap,
  Landmark,
  MapPin,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";

const roles = [
  {
    id: "citizen",
    label: "Citizen",
    description: "Report and track community problems",
    icon: UserRound,
  },
  {
    id: "government",
    label: "Government",
    description: "Validate and manage public problems",
    icon: Landmark,
  },
  {
    id: "university",
    label: "University",
    description: "Connect problems with academic projects",
    icon: GraduationCap,
  },
  {
    id: "student",
    label: "Student",
    description: "Work on real-world problem statements",
    icon: GraduationCap,
  },
  {
    id: "investor",
    label: "Investor / Industry",
    description: "Support promising solutions",
    icon: BriefcaseBusiness,
  },
];

const districts = [
  "Bokaro",
  "Chatra",
  "Deoghar",
  "Dhanbad",
  "Dumka",
  "East Singhbhum",
  "Garhwa",
  "Giridih",
  "Godda",
  "Gumla",
  "Hazaribagh",
  "Jamtara",
  "Khunti",
  "Koderma",
  "Latehar",
  "Lohardaga",
  "Pakur",
  "Palamu",
  "Ramgarh",
  "Ranchi",
  "Sahibganj",
  "Seraikela-Kharsawan",
  "Simdega",
  "West Singhbhum",
];

function CompleteProfile() {
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState("citizen");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    district: "",
    organization: "",
    department: "",
    university: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    setLoading(true);

    const profile = {
      ...formData,
      role: selectedRole,
      authProvider: "google",
    };

    console.log("Complete Google profile:", profile);

    /*
      Later this will call:

      POST /api/auth/google/complete-profile

      Backend will:
      1. Verify Google identity
      2. Save phone
      3. Save district
      4. Save role
      5. Save organization/university/department
      6. Create JAN-SAMADHAN account
      7. Issue JWT cookie
    */

    setTimeout(() => {
      setLoading(false);

      // Temporary navigation.
      // Later this will be the user's actual role dashboard.
      navigate("/citizen/dashboard");
    }, 800);
  };

  return (
    <div className="min-h-screen bg-background flex">

      {/* =====================================================
          LEFT PANEL
      ====================================================== */}

      <div className="hidden lg:flex lg:w-[38%] bg-primary text-white p-12 flex-col justify-between">

        <div>

          {/* Logo */}
          <div className="flex items-center gap-3">

            <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center">
              <ShieldCheck
                size={25}
                className="text-primary"
              />
            </div>

            <div>
              <h1 className="text-2xl font-bold">
                JAN-SAMADHAN
              </h1>

              <p className="text-xs text-slate-400">
                Smart Problem → Project → Impact
              </p>
            </div>

          </div>

          {/* Message */}
          <div className="mt-20">

            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
              <CheckCircle2 size={30} />
            </div>

            <h2 className="text-4xl font-bold leading-tight mt-7">
              Almost there.
              <br />
              Complete your profile.
            </h2>

            <p className="text-slate-400 mt-6 max-w-md leading-7">
              Google has verified your identity. We just need a few
              JAN-SAMADHAN-specific details before creating your account.
            </p>

          </div>

        </div>

        <div className="text-sm text-slate-500">
          © 2026 JAN-SAMADHAN
        </div>

      </div>

      {/* =====================================================
          PROFILE FORM
      ====================================================== */}

      <div className="flex-1 flex items-center justify-center px-5 py-10 sm:px-8">

        <div className="w-full max-w-3xl">

          {/* Mobile logo */}
          <div className="lg:hidden mb-8">

            <div className="flex items-center gap-3">

              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <ShieldCheck
                  className="text-white"
                  size={22}
                />
              </div>

              <div>
                <h1 className="text-xl font-bold">
                  JAN-SAMADHAN
                </h1>

                <p className="text-xs text-text-secondary">
                  Complete your profile
                </p>
              </div>

            </div>

          </div>

          {/* Heading */}
          <div className="mb-8">

            <p className="text-sm font-semibold text-secondary uppercase tracking-wider">
              Google account verified
            </p>

            <h2 className="text-3xl font-bold mt-2">
              Complete your profile
            </h2>

            <p className="text-text-secondary mt-2">
              These details help JAN-SAMADHAN connect you with the
              right problems, projects and opportunities.
            </p>

          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-7"
          >

            {/* =================================================
                BASIC INFORMATION
            ================================================== */}

            <div className="bg-white border border-border-light rounded-2xl p-6">

              <h3 className="font-semibold text-lg">
                Basic information
              </h3>

              <div className="grid sm:grid-cols-2 gap-5 mt-5">

                {/* Name */}
                <div>

                  <label className="block text-sm font-medium mb-2">
                    Full name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your full name"
                    required
                    className="w-full rounded-xl border border-border bg-white px-4 py-3 outline-none focus:border-secondary focus:ring-2 focus:ring-secondary-light"
                  />

                </div>

                {/* Email */}
                <div>

                  <label className="block text-sm font-medium mb-2">
                    Google email
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    required
                    className="w-full rounded-xl border border-border bg-white px-4 py-3 outline-none focus:border-secondary focus:ring-2 focus:ring-secondary-light"
                  />

                  <p className="text-xs text-text-muted mt-2">
                    Verified through Google.
                  </p>

                </div>

                {/* Phone */}
                <div>

                  <label className="block text-sm font-medium mb-2">
                    Phone number
                  </label>

                  <div className="relative">

                    <Phone
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
                    />

                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter phone number"
                      required
                      className="w-full rounded-xl border border-border bg-white pl-11 pr-4 py-3 outline-none focus:border-secondary focus:ring-2 focus:ring-secondary-light"
                    />

                  </div>

                </div>

                {/* District */}
                <div>

                  <label className="block text-sm font-medium mb-2">
                    District
                  </label>

                  <div className="relative">

                    <MapPin
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
                    />

                    <select
                      name="district"
                      value={formData.district}
                      onChange={handleChange}
                      required
                      className="w-full appearance-none rounded-xl border border-border bg-white pl-11 pr-4 py-3 outline-none focus:border-secondary focus:ring-2 focus:ring-secondary-light"
                    >
                      <option value="">
                        Select district
                      </option>

                      {districts.map((district) => (
                        <option
                          key={district}
                          value={district}
                        >
                          {district}
                        </option>
                      ))}

                    </select>

                  </div>

                </div>

              </div>

              {/* State */}
              <div className="mt-5">

                <label className="block text-sm font-medium mb-2">
                  State
                </label>

                <input
                  type="text"
                  value="Jharkhand"
                  disabled
                  className="w-full rounded-xl border border-border bg-surface-muted px-4 py-3 text-text-secondary"
                />

              </div>

            </div>

            {/* =================================================
                ROLE
            ================================================== */}

            <div className="bg-white border border-border-light rounded-2xl p-6">

              <h3 className="font-semibold text-lg">
                Your role
              </h3>

              <p className="text-sm text-text-secondary mt-1">
                Select how you will participate in JAN-SAMADHAN.
              </p>

              <div className="grid sm:grid-cols-2 gap-3 mt-5">

                {roles.map((role) => {

                  const Icon = role.icon;
                  const selected = selectedRole === role.id;

                  return (
                    <button
                      type="button"
                      key={role.id}
                      onClick={() => setSelectedRole(role.id)}
                      className={`text-left p-4 rounded-xl border-2 transition ${
                        selected
                          ? "border-primary bg-primary-light"
                          : "border-border-light hover:border-border"
                      }`}
                    >

                      <div className="flex items-start gap-3">

                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            selected
                              ? "bg-primary text-white"
                              : "bg-surface-muted text-text-secondary"
                          }`}
                        >
                          <Icon size={20} />
                        </div>

                        <div>

                          <p className="font-semibold">
                            {role.label}
                          </p>

                          <p className="text-xs text-text-secondary mt-1">
                            {role.description}
                          </p>

                        </div>

                      </div>

                    </button>
                  );
                })}

              </div>

            </div>

            {/* =================================================
                ORGANIZATION INFORMATION
            ================================================== */}

            {(selectedRole === "government" ||
              selectedRole === "university" ||
              selectedRole === "student" ||
              selectedRole === "investor") && (

              <div className="bg-white border border-border-light rounded-2xl p-6">

                <h3 className="font-semibold text-lg">
                  Professional information
                </h3>

                <div className="grid sm:grid-cols-2 gap-5 mt-5">

                  {/* Organization */}
                  <div>

                    <label className="block text-sm font-medium mb-2">
                      {selectedRole === "university" ||
                      selectedRole === "student"
                        ? "University"
                        : selectedRole === "government"
                        ? "Government organization"
                        : "Organization / company"}
                    </label>

                    <input
                      type="text"
                      name={
                        selectedRole === "university" ||
                        selectedRole === "student"
                          ? "university"
                          : "organization"
                      }
                      value={
                        selectedRole === "university" ||
                        selectedRole === "student"
                          ? formData.university
                          : formData.organization
                      }
                      onChange={handleChange}
                      placeholder="Enter organization"
                      required
                      className="w-full rounded-xl border border-border bg-white px-4 py-3 outline-none focus:border-secondary focus:ring-2 focus:ring-secondary-light"
                    />

                  </div>

                  {/* Department */}
                  {(selectedRole === "government" ||
                    selectedRole === "university" ||
                    selectedRole === "student") && (

                    <div>

                      <label className="block text-sm font-medium mb-2">
                        Department
                      </label>

                      <input
                        type="text"
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        placeholder="Enter department"
                        required
                        className="w-full rounded-xl border border-border bg-white px-4 py-3 outline-none focus:border-secondary focus:ring-2 focus:ring-secondary-light"
                      />

                    </div>

                  )}

                </div>

              </div>
            )}

            {/* =================================================
                SUBMIT
            ================================================== */}

            <div className="flex flex-col sm:flex-row gap-3">

              <Link
                to="/login"
                className="flex-1 rounded-xl border border-border bg-white py-3.5 font-semibold text-center hover:bg-surface-muted transition"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-xl bg-primary text-white py-3.5 font-semibold hover:bg-primary-hover transition disabled:opacity-60"
              >
                {loading
                  ? "Creating profile..."
                  : "Complete profile"}
              </button>

            </div>

          </form>

        </div>

      </div>

    </div>
  );
}

export default CompleteProfile;