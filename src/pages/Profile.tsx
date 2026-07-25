import React, { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  User, Phone, MapPin, Mail, Save, Loader2, Package, ArrowRight, LogOut,
  ChevronRight, CreditCard, Heart, Star, Bell,
  FileText, ShieldCheck, Landmark, Edit, X, Power,
  Trash2, AlertTriangle
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

interface ProfileData {
  id: string;
  role: string | null;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
}
import { validateUpiFormat } from "@/lib/upi/validateFormat";

const Profile = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Tab states: 'profile' | 'addresses' | 'saved-upi' | 'saved-cards' | 'reviews' | 'notifications'
  const [activeTab, setActiveTab] = useState<string>("profile");

  const [upiId, setUpiId] = useState("");
  const [upiList, setUpiList] = useState<Array<{ id: string; name: string; verified: boolean }>>(() => {
    const saved = localStorage.getItem("saved_upis");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("saved_upis", JSON.stringify(upiList));
  }, [upiList]);
  const [isVerifyingUpi, setIsVerifyingUpi] = useState(false);

  const handleLinkVpa = async () => {
    const trimmedUpi = upiId.trim();
    if (!trimmedUpi) return;

    // Layer 1: Format + PSP handle whitelist (the same check Checkout uses)
    const local = validateUpiFormat(trimmedUpi);
    if (!local.valid) {
      toast({
        title: "Invalid UPI ID",
        description: local.reason || "Please enter a valid UPI ID.",
        variant: "destructive",
      });
      return;
    }

    // Duplicate guard
    if (upiList.some(u => u.id.toLowerCase() === trimmedUpi.toLowerCase())) {
      toast({
        title: "Already Linked",
        description: "This UPI ID is already saved.",
        variant: "destructive",
      });
      return;
    }

    setIsVerifyingUpi(true);
    try {
      // Layer 2: Real verification via the same Edge Function Checkout uses
      const { data, error } = await supabase.functions.invoke("upi-verify", {
        body: { upi: trimmedUpi },
      });

      if (error) throw new Error("Verification service unavailable.");
      if (!data?.valid) {
        toast({
          title: "Verification Failed",
          description: data?.reason || "This UPI ID could not be verified on NPCI.",
          variant: "destructive",
        });
        return;
      }

      const verifiedName = data.name || "Verified User";
      setUpiList([
        ...upiList,
        { id: trimmedUpi, name: verifiedName, verified: true },
      ]);
      setUpiId("");
      toast({
        title: "VPA Linked",
        description: `${verifiedName} • ${trimmedUpi}`,
      });
    } catch (err: any) {
      toast({
        title: "Verification Failed",
        description: err.message || "Could not verify UPI ID.",
        variant: "destructive",
      });
    } finally {
      setIsVerifyingUpi(false);
    }
  };

  const [cardNumber, setCardNumber] = useState("");
  const [cardList, setCardList] = useState<any[]>(() => {
    const saved = localStorage.getItem("saved_cards");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("saved_cards", JSON.stringify(cardList));
  }, [cardList]);
  const [isVerifyingCard, setIsVerifyingCard] = useState(false);

  const handleAddCard = () => {
    const trimmedCard = cardNumber.trim();
    if (!trimmedCard) return;

    // Validate that the card is exactly 16 digits
    const cardRegex = /^\d{16}$/;

    if (!cardRegex.test(trimmedCard)) {
      toast({
        title: "Invalid Card Number",
        description: "Please enter a valid 16-digit card number.",
        variant: "destructive"
      });
      return;
    }

    setIsVerifyingCard(true);
    setTimeout(() => {
      const last4 = trimmedCard.slice(-4);
      let cardType = "Visa";
      if (trimmedCard.startsWith("4")) {
        cardType = "Visa";
      } else if (/^[52]/.test(trimmedCard)) {
        cardType = "Mastercard";
      } else if (trimmedCard.startsWith("3")) {
        cardType = "Amex";
      } else {
        cardType = "RuPay";
      }

      setCardList([...cardList, { id: Date.now().toString(), last4, type: cardType }]);
      setCardNumber("");
      setIsVerifyingCard(false);
      toast({
        title: "Card Added",
        description: `${cardType} ending in ${last4} has been verified and added.`,
      });
    }, 1500);
  };

  const handleRemoveCard = (idToRemove: string) => {
    setCardList(cardList.filter(card => card.id !== idToRemove));
    toast({
      title: "Card Removed",
      description: "The card has been removed successfully.",
    });
  };

  const handleRemoveUpi = (idToRemove: string) => {
    setUpiList(upiList.filter(upi => upi.id !== idToRemove));
    toast({
      title: "UPI Removed",
      description: "The UPI ID has been removed successfully.",
    });
  };

  const [profile, setProfile] = useState({
    full_name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    gender: "",
  });

  // Editing input states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState<"Male" | "Female" | "">("");
  const [emailInput, setEmailInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");

  const [addressInput, setAddressInput] = useState("");
  const [cityInput, setCityInput] = useState("");
  const [stateInput, setStateInput] = useState("");
  const [pincodeInput, setPincodeInput] = useState("");

  // Edit toggles
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingMobile, setIsEditingMobile] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({ title: "Error", description: "Logout failed. Please try again.", variant: "destructive" });
      setIsLoggingOut(false);
    } else {
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      navigate("/");
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile:", error);
      } else if (data) {
        const profileData = data as any;
        const userGender = session.user.user_metadata?.gender || "";
        const loadedProfile = {
          full_name: profileData.full_name || "",
          phone: profileData.phone || "",
          email: profileData.email || session.user.email || "",
          address: profileData.address || "",
          city: profileData.city || "",
          state: profileData.state || "",
          pincode: profileData.pincode || "",
          gender: userGender,
        };
        setProfile(loadedProfile);

        // Prepopulate input states
        const nameParts = (profileData.full_name || "").trim().split(/\s+/);
        setFirstName(nameParts[0] || "");
        setLastName(nameParts.slice(1).join(" ") || "");
        setGender(userGender as "Male" | "Female" | "");
        setEmailInput(loadedProfile.email);
        setPhoneInput(loadedProfile.phone);

        setAddressInput(loadedProfile.address);
        setCityInput(loadedProfile.city);
        setStateInput(loadedProfile.state);
        setPincodeInput(loadedProfile.pincode);
      }
      setIsLoading(false);
    };

    fetchProfile();
  }, [navigate]);

  const handleSaveSection = async (section: "personal" | "email" | "mobile" | "address") => {
    setIsSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      let updatedFields: any = {};

      if (section === "personal") {
        const mergedName = `${firstName} ${lastName}`.trim();
        updatedFields.full_name = mergedName;

        // Save gender to supabase auth metadata
        const { error: authError } = await supabase.auth.updateUser({
          data: { gender }
        });
        if (authError) throw authError;

        setProfile(prev => ({ ...prev, full_name: mergedName, gender }));
        setIsEditingPersonal(false);
      } else if (section === "email") {
        updatedFields.email = emailInput;
        setProfile(prev => ({ ...prev, email: emailInput }));
        setIsEditingEmail(false);
      } else if (section === "mobile") {
        updatedFields.phone = phoneInput;
        setProfile(prev => ({ ...prev, phone: phoneInput }));
        setIsEditingMobile(false);
      } else if (section === "address") {
        updatedFields = {
          address: addressInput,
          city: cityInput,
          state: stateInput,
          pincode: pincodeInput,
        };
        setProfile(prev => ({
          ...prev,
          address: addressInput,
          city: cityInput,
          state: stateInput,
          pincode: pincodeInput
        }));
        setIsEditingAddress(false);
      }

      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: session.user?.id,
          ...updatedFields,
        });

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: `${section.charAt(0).toUpperCase() + section.slice(1)} information saved successfully!`,
      });
    } catch (err: any) {
      console.error(`Error updating ${section}:`, err);
      toast({
        title: "Update Failed",
        description: `Failed to update ${section}: ${err.message}`,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelSection = (section: "personal" | "email" | "mobile" | "address") => {
    if (section === "personal") {
      const nameParts = (profile.full_name || "").trim().split(/\s+/);
      setFirstName(nameParts[0] || "");
      setLastName(nameParts.slice(1).join(" ") || "");
      setGender(profile.gender as "Male" | "Female" | "");
      setIsEditingPersonal(false);
    } else if (section === "email") {
      setEmailInput(profile.email);
      setIsEditingEmail(false);
    } else if (section === "mobile") {
      setPhoneInput(profile.phone);
      setIsEditingMobile(false);
    } else if (section === "address") {
      setAddressInput(profile.address);
      setCityInput(profile.city);
      setStateInput(profile.state);
      setPincodeInput(profile.pincode);
      setIsEditingAddress(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 bg-background">
          <Loader2 className="w-10 h-10 text-[#855300] animate-spin" />
          <p className="font-semibold text-sm text-[var(--text-secondary)] tracking-wide">Loading secure profile...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-background text-[var(--text-primary)] min-h-screen font-sans w-full py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-6 items-start">

            {/* Sidebar Left Column */}
            <div className="w-full md:w-1/3 shrink-0 flex flex-col gap-4">

              {/* Hello Card Header */}
              <div className="bg-[var(--bg-card)] p-4 flex items-center gap-4 rounded-sm shadow-sm border border-border">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#855300] to-[#fea619] flex items-center justify-center text-[var(--text-primary)] font-bold text-lg shadow-inner">
                  {firstName ? firstName.charAt(0).toUpperCase() : <User className="w-6 h-6" />}
                </div>
                <div>
                  <span className="text-xs text-[var(--text-secondary)] block">Hello,</span>
                  <span className="text-base font-bold text-[var(--text-primary)] tracking-wide truncate max-w-[180px] block">
                    {profile.full_name || "BuildBazaarX User"}
                  </span>
                </div>
              </div>

              {/* Navigation Menu Links */}
              <div className="bg-[var(--bg-card)] rounded-sm shadow-sm border border-border overflow-hidden">

                {/* Orders Category */}
                <Link
                  to="/orders"
                  className="w-full flex items-center justify-between p-4 hover:bg-[#eceef0]/30 border-b border-border transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <Package className="w-5 h-5 text-[#855300]" />
                    <span className="font-bold text-sm tracking-wide text-[var(--text-secondary)] group-hover:text-[#855300] transition-colors">MY ORDERS</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-[#855300] group-hover:translate-x-0.5 transition-all" />
                </Link>

                {/* Account Settings Category */}
                <div className="border-b border-border">
                  <div className="flex items-center gap-4 p-4 pb-2">
                    <User className="w-5 h-5 text-[#855300]" />
                    <span className="font-bold text-xs tracking-wider text-muted-foreground uppercase">ACCOUNT SETTINGS</span>
                  </div>
                  <div className="flex flex-col">
                    <button
                      onClick={() => setActiveTab("profile")}
                      className={`text-left pl-14 py-2.5 text-sm transition-all ${activeTab === "profile"
                        ? "bg-[#fea619]/10 text-[#855300] font-bold border-r-4 border-[#855300]"
                        : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] hover:text-[#855300]"
                        }`}
                    >
                      Profile Information
                    </button>
                    <button
                      onClick={() => setActiveTab("addresses")}
                      className={`text-left pl-14 py-2.5 text-sm transition-all ${activeTab === "addresses"
                        ? "bg-[#fea619]/10 text-[#855300] font-bold border-r-4 border-[#855300]"
                        : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] hover:text-[#855300]"
                        }`}
                    >
                      Manage Addresses
                    </button>
                  </div>
                </div>

                {/* Payments Category */}
                <div className="border-b border-border">
                  <div className="flex items-center gap-4 p-4 pb-2">
                    <CreditCard className="w-5 h-5 text-[#855300]" />
                    <span className="font-bold text-xs tracking-wider text-muted-foreground uppercase">PAYMENTS</span>
                  </div>
                  <div className="flex flex-col">
                    <button
                      onClick={() => setActiveTab("saved-upi")}
                      className={`text-left pl-14 py-2.5 text-sm transition-all ${activeTab === "saved-upi"
                        ? "bg-[#fea619]/10 text-[#855300] font-bold border-r-4 border-[#855300]"
                        : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] hover:text-[#855300]"
                        }`}
                    >
                      Saved UPI
                    </button>
                    <button
                      onClick={() => setActiveTab("saved-cards")}
                      className={`text-left pl-14 py-2.5 text-sm transition-all ${activeTab === "saved-cards"
                        ? "bg-[#fea619]/10 text-[#855300] font-bold border-r-4 border-[#855300]"
                        : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] hover:text-[#855300]"
                        }`}
                    >
                      Saved Cards
                    </button>
                  </div>
                </div>

                {/* My Stuff Category */}
                <div className="border-b border-border">
                  <div className="flex items-center gap-4 p-4 pb-2">
                    <Heart className="w-5 h-5 text-[#855300]" />
                    <span className="font-bold text-xs tracking-wider text-muted-foreground uppercase">MY STUFF</span>
                  </div>
                  <div className="flex flex-col">
                    <button
                      onClick={() => setActiveTab("reviews")}
                      className={`text-left pl-14 py-2.5 text-sm transition-all ${activeTab === "reviews"
                        ? "bg-[#fea619]/10 text-[#855300] font-bold border-r-4 border-[#855300]"
                        : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] hover:text-[#855300]"
                        }`}
                    >
                      My Reviews & Ratings
                    </button>
                    <button
                      onClick={() => setActiveTab("notifications")}
                      className={`text-left pl-14 py-2.5 text-sm transition-all ${activeTab === "notifications"
                        ? "bg-[#fea619]/10 text-[#855300] font-bold border-r-4 border-[#855300]"
                        : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] hover:text-[#855300]"
                        }`}
                    >
                      All Notifications
                    </button>
                    <Link
                      to="/wishlist"
                      className="text-left pl-14 py-2.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] hover:text-[#855300] block transition-all"
                    >
                      My Wishlist
                    </Link>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  disabled={isSaving}
                  className="w-full text-left p-4 hover:bg-red-500/10 text-[var(--text-secondary)] hover:text-red-600 transition-colors flex items-center gap-4 cursor-pointer font-bold text-sm tracking-wide"
                >
                  <Power className="w-5 h-5 text-muted-foreground group-hover:text-red-500" />
                  <span>Logout</span>
                </button>
              </div>

              {/* Frequently Visited Footer Links */}
              <div className="px-4 py-2 text-xs text-[var(--text-secondary)]">
                <span className="font-semibold text-muted-foreground block mb-1">Frequently Visited:</span>
                <div className="flex gap-3">
                  <Link to="/orders" className="hover:text-[#855300] hover:underline">Track Order</Link>
                  <span>•</span>
                  <Link to="/contact" className="hover:text-[#855300] hover:underline">Help Center</Link>
                </div>
              </div>

            </div>

            {/* Main Content Area Right Column */}
            <div className="w-full md:w-2/3 bg-[var(--bg-card)] rounded-sm shadow-sm border border-border p-6 md:p-8 relative min-h-[600px] overflow-hidden">

              <AnimatePresence mode="wait">

                {/* 1. Profile Information Tab */}
                {activeTab === "profile" && (
                  <motion.div
                    key="profile"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-8 pb-12"
                  >
                    {/* Personal Info Section */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <h2 className="text-lg font-bold text-[var(--text-primary)]">Personal Information</h2>
                        <button
                          onClick={() => {
                            if (isEditingPersonal) {
                              handleCancelSection("personal");
                            } else {
                              setIsEditingPersonal(true);
                            }
                          }}
                          className="text-xs font-bold text-[#855300] hover:text-[#fea619] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          {isEditingPersonal ? (
                            <>
                              <X className="w-3.5 h-3.5" /> Cancel
                            </>
                          ) : (
                            <>
                              <Edit className="w-3.5 h-3.5" /> Edit
                            </>
                          )}
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          disabled={!isEditingPersonal}
                          placeholder="First Name"
                          className={`px-4 py-2.5 text-sm rounded-sm outline-none transition-all ${isEditingPersonal
                            ? "bg-[var(--bg-card)] border border-[#855300] focus:ring-1 focus:ring-[#855300]"
                            : "bg-[var(--bg-surface)] border border-border text-[var(--text-secondary)] cursor-not-allowed"
                            }`}
                        />
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          disabled={!isEditingPersonal}
                          placeholder="Last Name"
                          className={`px-4 py-2.5 text-sm rounded-sm outline-none transition-all ${isEditingPersonal
                            ? "bg-[var(--bg-card)] border border-[#855300] focus:ring-1 focus:ring-[#855300]"
                            : "bg-[var(--bg-surface)] border border-border text-[var(--text-secondary)] cursor-not-allowed"
                            }`}
                        />
                      </div>

                      {/* Gender Selector */}
                      <div className="space-y-2 pt-2">
                        <span className="text-xs font-bold text-[var(--text-secondary)] block">Your Gender</span>
                        <div className="flex items-center gap-6">
                          <label className={`flex items-center gap-2 text-sm select-none cursor-pointer ${!isEditingPersonal && "opacity-60 cursor-not-allowed"}`}>
                            <input
                              type="radio"
                              name="gender"
                              value="Male"
                              checked={gender === "Male"}
                              onChange={() => isEditingPersonal && setGender("Male")}
                              disabled={!isEditingPersonal}
                              className="w-4 h-4 text-[#855300] focus:ring-[#855300] border-gray-300"
                            />
                            <span>Male</span>
                          </label>
                          <label className={`flex items-center gap-2 text-sm select-none cursor-pointer ${!isEditingPersonal && "opacity-60 cursor-not-allowed"}`}>
                            <input
                              type="radio"
                              name="gender"
                              value="Female"
                              checked={gender === "Female"}
                              onChange={() => isEditingPersonal && setGender("Female")}
                              disabled={!isEditingPersonal}
                              className="w-4 h-4 text-[#855300] focus:ring-[#855300] border-gray-300"
                            />
                            <span>Female</span>
                          </label>
                        </div>
                      </div>

                      {isEditingPersonal && (
                        <div className="pt-2">
                          <Button
                            onClick={() => handleSaveSection("personal")}
                            disabled={isSaving}
                            className="bg-[var(--accent)] text-white hover:bg-[#855300] font-semibold text-xs py-2 px-6 rounded-sm shadow-sm flex items-center gap-2"
                          >
                            {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                            Save Personal Details
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Email Address Section */}
                    <div className="space-y-4 pt-4 border-t border-border">
                      <div className="flex items-center gap-4">
                        <h2 className="text-lg font-bold text-[var(--text-primary)]">Email Address</h2>
                        <button
                          onClick={() => {
                            if (isEditingEmail) {
                              handleCancelSection("email");
                            } else {
                              setIsEditingEmail(true);
                            }
                          }}
                          className="text-xs font-bold text-[#855300] hover:text-[#fea619] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          {isEditingEmail ? (
                            <>
                              <X className="w-3.5 h-3.5" /> Cancel
                            </>
                          ) : (
                            <>
                              <Edit className="w-3.5 h-3.5" /> Edit
                            </>
                          )}
                        </button>
                      </div>

                      <div className="max-w-lg">
                        <input
                          type="email"
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          disabled={!isEditingEmail}
                          placeholder="name@example.com"
                          className={`w-full px-4 py-2.5 text-sm rounded-sm outline-none transition-all ${isEditingEmail
                            ? "bg-[var(--bg-card)] border border-[#855300] focus:ring-1 focus:ring-[#855300]"
                            : "bg-[var(--bg-surface)] border border-border text-[var(--text-secondary)] cursor-not-allowed"
                            }`}
                        />
                      </div>

                      {isEditingEmail && (
                        <div className="pt-1">
                          <Button
                            onClick={() => handleSaveSection("email")}
                            disabled={isSaving}
                            className="bg-[var(--accent)] text-white hover:bg-[#855300] font-semibold text-xs py-2 px-6 rounded-sm shadow-sm flex items-center gap-2"
                          >
                            {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                            Save Email
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Mobile Number Section */}
                    <div className="space-y-4 pt-4 border-t border-border">
                      <div className="flex items-center gap-4">
                        <h2 className="text-lg font-bold text-[var(--text-primary)]">Mobile Number</h2>
                        <button
                          onClick={() => {
                            if (isEditingMobile) {
                              handleCancelSection("mobile");
                            } else {
                              setIsEditingMobile(true);
                            }
                          }}
                          className="text-xs font-bold text-[#855300] hover:text-[#fea619] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          {isEditingMobile ? (
                            <>
                              <X className="w-3.5 h-3.5" /> Cancel
                            </>
                          ) : (
                            <>
                              <Edit className="w-3.5 h-3.5" /> Edit
                            </>
                          )}
                        </button>
                      </div>

                      <div className="max-w-lg">
                        <input
                          type="tel"
                          value={phoneInput}
                          onChange={(e) => setPhoneInput(e.target.value)}
                          disabled={!isEditingMobile}
                          placeholder="+91 XXXXX XXXXX"
                          className={`w-full px-4 py-2.5 text-sm rounded-sm outline-none transition-all ${isEditingMobile
                            ? "bg-[var(--bg-card)] border border-[#855300] focus:ring-1 focus:ring-[#855300]"
                            : "bg-[var(--bg-surface)] border border-border text-[var(--text-secondary)] cursor-not-allowed"
                            }`}
                        />
                      </div>

                      {isEditingMobile && (
                        <div className="pt-1">
                          <Button
                            onClick={() => handleSaveSection("mobile")}
                            disabled={isSaving}
                            className="bg-[var(--accent)] text-white hover:bg-[#855300] font-semibold text-xs py-2 px-6 rounded-sm shadow-sm flex items-center gap-2"
                          >
                            {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                            Save Mobile Number
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* FAQ Help Accordion Section */}
                    <div className="pt-8 border-t border-border space-y-4">
                      <h3 className="text-base font-bold text-[var(--text-primary)]">FAQs</h3>
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-[var(--text-secondary)]">What happens when I update my email address (or mobile number)?</p>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            Your login email id (or mobile number) changes, likewise. You'll receive all your account related communication on your updated email address (or mobile number).
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-[var(--text-secondary)]">When will my Flipkart account be updated with the new email address (or mobile number)?</p>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            It happens as soon as you confirm the verification code sent to your email (or mobile) and save the changes.
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-[var(--text-secondary)]">What happens to my existing Flipkart account when I update my email address (or mobile number)?</p>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            Updating your email address (or mobile number) doesn't invalidate your account. Your account remains fully functional. You'll continue seeing your Order history, saved information and personal details.
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-[var(--text-secondary)]">Does my Seller account get affected when I update my email address?</p>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            Flipkart has a 'single sign-on' policy. Any changes will reflect in your Seller account also.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Account Deactivate / Delete links */}
                    <div className="pt-8 flex flex-col gap-2">
                      <button className="text-sm font-bold text-[#855300] hover:text-[#fea619] hover:underline text-left max-w-xs cursor-pointer">Deactivate Account</button>
                      <button className="text-sm font-bold text-red-600 hover:underline text-left max-w-xs cursor-pointer flex items-center gap-1">
                        <Trash2 className="w-4 h-4" /> Delete Account
                      </button>
                    </div>

                    {/* SVG Flying Paper Airplane Graphic */}
                    <div className="absolute right-6 bottom-6 w-32 h-32 opacity-10 pointer-events-none hidden md:block">
                      <svg viewBox="0 0 24 24" fill="none" className="text-[#fea619] w-full h-full" stroke="currentColor" strokeWidth="1">
                        <path d="M22 2L2 8.66l7.56 2.89L16 5l-5.55 6.44L18 19 22 2z" />
                      </svg>
                    </div>

                  </motion.div>
                )}

                {/* 2. Manage Addresses Tab */}
                {activeTab === "addresses" && (
                  <motion.div
                    key="addresses"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center justify-between border-b border-border pb-4">
                      <h2 className="text-lg font-bold text-[var(--text-primary)]">Manage Addresses</h2>
                      <button
                        onClick={() => {
                          if (isEditingAddress) {
                            handleCancelSection("address");
                          } else {
                            setIsEditingAddress(true);
                          }
                        }}
                        className="text-xs font-bold text-[#855300] hover:text-[#fea619] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        {isEditingAddress ? (
                          <>
                            <X className="w-3.5 h-3.5" /> Cancel
                          </>
                        ) : (
                          <>
                            <Edit className="w-3.5 h-3.5" /> Modify Address
                          </>
                        )}
                      </button>
                    </div>

                    <div className="space-y-4 max-w-lg">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-[var(--text-secondary)] block">Structural Address</label>
                        <textarea
                          rows={3}
                          value={addressInput}
                          onChange={(e) => setAddressInput(e.target.value)}
                          disabled={!isEditingAddress}
                          placeholder="House No, Building, Street, Area..."
                          className={`w-full px-4 py-2.5 text-sm rounded-sm outline-none transition-all min-h-[80px] resize-none ${isEditingAddress
                            ? "bg-[var(--bg-card)] border border-[#855300] focus:ring-1 focus:ring-[#855300]"
                            : "bg-[var(--bg-surface)] border border-border text-[var(--text-secondary)] cursor-not-allowed"
                            }`}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-[var(--text-secondary)] block">City</label>
                          <input
                            type="text"
                            value={cityInput}
                            onChange={(e) => setCityInput(e.target.value)}
                            disabled={!isEditingAddress}
                            placeholder="Your City"
                            className={`w-full px-4 py-2.5 text-sm rounded-sm outline-none transition-all ${isEditingAddress
                              ? "bg-[var(--bg-card)] border border-[#855300] focus:ring-1 focus:ring-[#855300]"
                              : "bg-[var(--bg-surface)] border border-border text-[var(--text-secondary)] cursor-not-allowed"
                              }`}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-[var(--text-secondary)] block">State</label>
                          <input
                            type="text"
                            value={stateInput}
                            onChange={(e) => setStateInput(e.target.value)}
                            disabled={!isEditingAddress}
                            placeholder="State"
                            className={`w-full px-4 py-2.5 text-sm rounded-sm outline-none transition-all ${isEditingAddress
                              ? "bg-[var(--bg-card)] border border-[#855300] focus:ring-1 focus:ring-[#855300]"
                              : "bg-[var(--bg-surface)] border border-border text-[var(--text-secondary)] cursor-not-allowed"
                              }`}
                          />
                        </div>
                      </div>

                      <div className="space-y-2 max-w-[200px]">
                        <label className="text-xs font-bold text-[var(--text-secondary)] block">Pincode</label>
                        <input
                          type="text"
                          maxLength={6}
                          value={pincodeInput}
                          onChange={(e) => setPincodeInput(e.target.value)}
                          disabled={!isEditingAddress}
                          placeholder="6-digit pincode"
                          className={`w-full px-4 py-2.5 text-sm rounded-sm outline-none transition-all ${isEditingAddress
                            ? "bg-[var(--bg-card)] border border-[#855300] focus:ring-1 focus:ring-[#855300]"
                            : "bg-[var(--bg-surface)] border border-border text-[var(--text-secondary)] cursor-not-allowed"
                            }`}
                        />
                      </div>

                      {isEditingAddress && (
                        <div className="pt-2">
                          <Button
                            onClick={() => handleSaveSection("address")}
                            disabled={isSaving}
                            className="bg-[var(--accent)] text-white hover:bg-[#855300] font-semibold text-xs py-2 px-6 rounded-sm shadow-sm flex items-center gap-2"
                          >
                            {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                            Update Address Registry
                          </Button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* 3. Saved UPI Tab */}
                {activeTab === "saved-upi" && (
                  <motion.div
                    key="saved-upi"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    <div className="border-b border-border pb-4">
                      <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                        <Landmark className="w-5 h-5 text-[#855300]" /> Saved UPI Accounts
                      </h2>
                    </div>

                    <div className="max-w-lg space-y-4">

                      {upiList.map((upi, idx) => (
                        <div key={idx} className="p-4 border border-border rounded-sm flex items-center justify-between hover:bg-[var(--bg-surface)]/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-yellow-50 text-[#855300] rounded-full flex items-center justify-center font-bold text-sm price-display">₹
                            </div>
                            <div>
                              <span className="text-sm font-bold text-[var(--text-primary)] block">{upi.name}</span>
                              <span className="text-xs text-[var(--text-secondary)]">{upi.id}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {upi.verified && (
                              <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 border border-green-100 rounded-sm">
                                VERIFIED
                              </span>
                            )}
                            <button
                              onClick={() => handleRemoveUpi(upi.id)}
                              className="text-xs text-red-500 font-bold hover:underline cursor-pointer"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}

                      <div className="p-6 border border-dashed border-gray-300 rounded-sm flex flex-col gap-3 items-center justify-center py-10">
                        <span className="text-sm text-[var(--text-secondary)] font-bold">Link a new UPI Virtual Address</span>
                        <div className="flex gap-3 w-full max-w-sm pt-2">
                          <input
                            type="text"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            placeholder="username@upi"
                            className="w-full px-4 py-2.5 text-sm border border-border rounded-sm outline-none focus:border-[#855300]"
                          />
                          <button
                            onClick={handleLinkVpa}
                            disabled={isVerifyingUpi}
                            className="bg-[var(--accent)] text-white hover:bg-[#855300] px-6 py-2.5 text-sm rounded-sm shrink-0 font-bold shadow-sm transition-colors flex items-center gap-2"
                          >
                            {isVerifyingUpi && <Loader2 className="w-4 h-4 animate-spin" />}
                            {isVerifyingUpi ? "Verifying..." : "Link VPA"}
                          </button>
                        </div>
                      </div>

                    </div>
                  </motion.div>
                )}

                {/* 4. Saved Cards Tab */}
                {activeTab === "saved-cards" && (
                  <motion.div
                    key="saved-cards"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    <div className="border-b border-border pb-4">
                      <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-[#855300]" /> Saved Credit & Debit Cards
                      </h2>
                    </div>

                    <div className="max-w-lg space-y-6">

                      {/* Credit Card Widgets */}
                      {cardList.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {cardList.map((card) => (
                            <div
                              key={card.id}
                              className={`p-6 text-[var(--text-primary)] rounded-md shadow-md space-y-6 relative overflow-hidden border border-slate-700/80 transition-transform hover:scale-[1.01] ${card.type === "Mastercard"
                                ? "bg-gradient-to-tr from-slate-900 via-[#2d1500] to-[#b15802]/80"
                                : card.type === "Visa"
                                  ? "bg-gradient-to-tr from-gray-900 via-[#1c1c1a] to-[#855300]/80"
                                  : card.type === "Amex"
                                    ? "bg-gradient-to-tr from-blue-950 via-slate-900 to-indigo-900"
                                    : "bg-gradient-to-tr from-emerald-950 via-stone-900 to-teal-900"
                                }`}
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <span className="text-[10px] text-gray-300 block tracking-wider font-semibold">Saved Premium Card</span>
                                  <span className="text-sm font-bold tracking-widest text-[#fea619]">{card.type.toUpperCase()} PLATINUM</span>
                                </div>
                                <Landmark className="w-7 h-7 text-slate-300 opacity-80" />
                              </div>

                              <div className="space-y-1">
                                <span className="text-[10px] text-gray-300 uppercase tracking-widest block">Card Number</span>
                                <p className="text-base tracking-widest font-mono text-gray-200">•••• •••• •••• {card.last4}</p>
                              </div>

                              <div className="flex justify-between items-end">
                                <div>
                                  <span className="text-[9px] text-gray-300 uppercase tracking-wider block">Card Holder</span>
                                  <span className="text-xs text-slate-200 tracking-wide">{profile.full_name || "Aditya Srivastava"}</span>
                                </div>
                                <button
                                  onClick={() => handleRemoveCard(card.id)}
                                  className="text-xs text-red-400 font-bold hover:text-red-300 hover:underline cursor-pointer z-10"
                                >
                                  Remove Card
                                </button>
                              </div>

                              {/* Decorative chip/reflection */}
                              <div className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-[var(--bg-card)]/5 rounded-full pointer-events-none blur-md" />
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="p-6 border border-dashed border-gray-300 rounded-sm flex flex-col gap-3 items-center justify-center py-10">
                        <span className="text-sm text-[var(--text-secondary)] font-bold">Link a new Debit / Credit Card</span>
                        <div className="flex gap-3 w-full max-w-sm pt-2">
                          <input
                            type="text"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            placeholder="Card Number (16 digits)"
                            className="w-full px-4 py-2.5 text-sm border border-border rounded-sm outline-none focus:border-[#855300]"
                            maxLength={16}
                          />
                          <button
                            onClick={handleAddCard}
                            disabled={isVerifyingCard}
                            className="bg-[var(--accent)] text-white hover:bg-[#855300] px-6 py-2.5 text-sm rounded-sm shrink-0 font-bold shadow-sm transition-colors flex items-center gap-2"
                          >
                            {isVerifyingCard && <Loader2 className="w-4 h-4 animate-spin" />}
                            {isVerifyingCard ? "Verifying..." : "Add Card"}
                          </button>
                        </div>
                      </div>

                    </div>
                  </motion.div>
                )}

                {/* 5. Reviews & Ratings Tab */}
                {activeTab === "reviews" && (
                  <motion.div
                    key="reviews"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    <div className="border-b border-border pb-4">
                      <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                        <Star className="w-5 h-5 text-[#fea619] fill-[#fea619]" /> My Reviews & Ratings
                      </h2>
                    </div>

                    <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 max-w-md mx-auto">
                      <div className="w-16 h-16 rounded-full bg-[#fea619]/10 flex items-center justify-center text-[#855300]">
                        <Star className="w-8 h-8 fill-[#fea619]/25" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-sm font-bold text-[var(--text-primary)]">No Reviews Published</h3>
                        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                          You haven't reviewed any architectural designs or raw material products yet. Rate your active purchases from the Orders catalog!
                        </p>
                      </div>
                      <Link to="/orders" className="bg-[var(--accent)] text-white hover:bg-[#855300] font-bold text-xs py-2.5 px-6 rounded-sm shadow-sm transition-colors">
                        View Active Orders
                      </Link>
                    </div>
                  </motion.div>
                )}

                {/* 6. All Notifications Tab */}
                {activeTab === "notifications" && (
                  <motion.div
                    key="notifications"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    <div className="border-b border-border pb-4 flex justify-between items-center">
                      <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                        <Bell className="w-5 h-5 text-[#855300]" /> Notifications
                      </h2>
                      <button className="text-xs text-muted-foreground hover:text-[var(--text-secondary)] font-semibold cursor-pointer">Mark all as read</button>
                    </div>

                    <div className="space-y-4 max-w-2xl">

                      {/* Notification 1 */}
                      <div className="p-4 border border-border bg-[#fea619]/5 rounded-sm flex items-start gap-4 hover:bg-[var(--bg-surface)]/50 transition-colors">
                        <Package className="w-5 h-5 text-[#855300] shrink-0 mt-0.5" />
                        <div className="space-y-1 flex-1">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-[var(--text-primary)]">Order Dispatched</span>
                            <span className="text-[10px] text-muted-foreground font-semibold">Today, 2:45 PM</span>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            Good news! Your architectural blueprint order #BBAX-99482 has been verified and dispatched to your registered address.
                          </p>
                        </div>
                      </div>

                      {/* Notification 2 */}
                      <div className="p-4 border border-border rounded-sm flex items-start gap-4 hover:bg-[var(--bg-surface)]/50 transition-colors">
                        <ShieldCheck className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                        <div className="space-y-1 flex-1">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-[var(--text-primary)]">Identity Synchronized</span>
                            <span className="text-[10px] text-muted-foreground font-semibold">Yesterday</span>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            Your core profile registration credentials have been synchronized with the Supabase distributed database ledger.
                          </p>
                        </div>
                      </div>

                    </div>
                  </motion.div>
                )}

              </AnimatePresence>

            </div>

          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
