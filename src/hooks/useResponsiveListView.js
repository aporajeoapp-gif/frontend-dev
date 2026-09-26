import { useEffect, useState } from "react";

export default function useResponsiveListView(breakpoint = 768) {
  const getInitialView = () => {
    if (typeof window === "undefined") return "table";
    return window.innerWidth < breakpoint ? "card" : "table";
  };

  const [view, setView] = useState(getInitialView);

  useEffect(() => {
    const updateView = () => {
      setView(window.innerWidth < breakpoint ? "card" : "table");
    };

    updateView();
    window.addEventListener("resize", updateView);
    return () => window.removeEventListener("resize", updateView);
  }, [breakpoint]);

  return [view, setView];
}
