import { createContext, useState, useContext } from "react";

export const LanguageContext = createContext();

const TRANSLATIONS = {
  en: {
    // Navbar
    home: "Home",
    doctors: "Doctors",
    emergency: "Emergency",
    bus: "Bus",
    ferry: "Ferry",
    events: "Events",
    blood: "Blood",
    ambulance: "Ambulance",
    // Common
    search: "Search",
    filter: "Filter",
    all: "All",
    active: "Active",
    book: "Book Now",
    call_now: "Call Now",
    // Placeholders
    search_placeholder_doctors: "Search by name, specialty or location...",
    search_placeholder_bus: "Search route name, number or stops...",
    search_placeholder_ferry: "Search ferry route or stops...",
    search_placeholder_emergency: "Search emergency services...",
    // Specialties
    all_specialties: "All Specialties",
    all_categories: "All Categories",
    // Table Headers
    name: "Name",
    specialty: "Specialty",
    location: "Location",
    experience: "Experience",
    rating: "Rating",
    actions: "Actions",
    route_no: "Route #",
    route_name: "Route Name",
    departure: "Departure",
    arrival: "Arrival",
    duration: "Duration",
    fare: "Fare",
    stops: "Stops",
    status: "Status",
    service: "Service",
    category: "Category",
    description: "Description",
    phone: "Phone",
    action: "Action",
    available_247: "Available 24/7",
    weekly_schedule: "Weekly Schedule",
    call_clinic: "Call Clinic",
    confirm: "Confirm",
    // Views
    table_view: "Table",
    card_view: "Card",
  },
  bn: {
    // Navbar
    home: "হোম",
    doctors: "ডাক্তার",
    emergency: "জরুরী",
    bus: "বাস",
    ferry: "ফেরী",
    events: "ইভেন্ট",
    blood: "রক্ত",
    ambulance: "অ্যাম্বুলেন্স",
    // Common
    search: "অনুসন্ধান",
    filter: "ফিল্টার",
    all: "সব",
    active: "সক্রিয়",
    book: "বুক করুন",
    call_now: "কল করুন",
    // Placeholders
    search_placeholder_doctors: "নাম, বিশেষজ্ঞ বা স্থান দিয়ে খুঁজুন...",
    search_placeholder_bus: "রুটের নাম বা নাম্বার দিয়ে খুঁজুন...",
    search_placeholder_ferry: "ফেরী রুট বা স্টপ দিয়ে খুঁজুন...",
    search_placeholder_emergency: "জরুরী সেবা খুঁজুন...",
    // Specialties
    all_specialties: "সব বিশেষজ্ঞ",
    all_categories: "সব ক্যাটাগরি",
    // Table Headers
    name: "নাম",
    specialty: "বিশেষজ্ঞ",
    location: "স্থান",
    experience: "অভিজ্ঞতা",
    rating: "রেটিং",
    actions: "অ্যাকশন",
    route_no: "রুট নং",
    route_name: "রুটের নাম",
    departure: "প্রস্থান",
    arrival: "পৌঁছানো",
    duration: "সময়",
    fare: "ভাড়া",
    stops: "স্টপসমূহ",
    status: "অবস্থা",
    service: "সেবা",
    category: "ক্যাটাগরি",
    description: "বিবরণ",
    phone: "ফোন",
    action: "অ্যাকশন",
    available_247: "২৪/৭ উপলব্ধ",
    weekly_schedule: "সাপ্তাহিক শিডিউল",
    call_clinic: "ক্লিনিকে কল করুন",
    confirm: "নিশ্চিত করুন",
    // Views
    table_view: "টেবিল",
    card_view: "কার্ড",
  },
};

function applyTranslation(lang) {
  const domain = window.location.hostname;
  const val = `/en/${lang}`;

  if (lang === "en") {
    // Explicitly set to English to English to force reset
    const resetVal = "/en/en";
    document.cookie = `googtrans=${resetVal}; path=/;`;
    document.cookie = `googtrans=${resetVal}; path=/; domain=${domain}`;
    document.cookie = `googtrans=${resetVal}; path=/; domain=.${domain}`;
    
    // Also try to clear any legacy cookies
    const expire = "expires=Thu, 01 Jan 1970 00:00:00 UTC";
    document.cookie = `googtrans=; path=/; ${expire}`;
    document.cookie = `googtrans=; path=/; domain=${domain}; ${expire}`;
    document.cookie = `googtrans=; path=/; domain=.${domain}; ${expire}`;
  } else {
    // Set cookies for target language
    document.cookie = `googtrans=${val}; path=/`;
    document.cookie = `googtrans=${val}; path=/; domain=${domain}`;
    document.cookie = `googtrans=${val}; path=/; domain=.${domain}`;
  }

  // Mandatory reload for Google Translate to re-read the cookies
  window.location.reload();
}

function getLangFromCookie() {
  const match = document.cookie.match(/googtrans=\/en\/([a-z]{2})/);
  return match ? match[1] : "en";
}

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const fromCookie = getLangFromCookie();
    if (fromCookie !== "en") return fromCookie;
    return localStorage.getItem("language") || "en";
  });

  const toggleLanguage = () => {
    const next = language === "en" ? "bn" : "en";
    localStorage.setItem("language", next);
    setLanguage(next); // Update state immediately for UI
    applyTranslation(next);
  }

  // t is an object-proxy to support both t("key") and t.key
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => useContext(LanguageContext);
