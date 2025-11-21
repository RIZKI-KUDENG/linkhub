export const themes = {
  default: {
    name: "Default (Clean White)",
    bg: "bg-white",
    text: "text-slate-900",
    card: "bg-white border border-slate-200 shadow-sm",
    cardHover: "hover:shadow-md hover:border-slate-300",
    button: "bg-slate-900 text-white hover:bg-slate-800",
  },
  dark: {
    name: "Midnight Black",
    bg: "bg-slate-950",
    text: "text-slate-100",
    card: "bg-slate-900 border border-slate-800",
    cardHover: "hover:bg-slate-800 hover:border-slate-700",
    button: "bg-white text-slate-950 hover:bg-slate-200",
  },
  ocean: {
    name: "Ocean Blue",
    bg: "bg-gradient-to-b from-blue-50 to-blue-100",
    text: "text-blue-900",
    card: "bg-white/80 backdrop-blur-sm border border-blue-200",
    cardHover: "hover:bg-white hover:scale-[1.02]",
    button: "bg-blue-600 text-white hover:bg-blue-700",
  },
  sunset: {
    name: "Sunset Gradient",
    bg: "bg-gradient-to-br from-orange-100 via-red-100 to-pink-100",
    text: "text-rose-950",
    card: "bg-white/60 backdrop-blur-sm border border-rose-200 shadow-sm",
    cardHover: "hover:bg-white/80 hover:shadow-rose-200/50",
    button: "bg-gradient-to-r from-orange-500 to-pink-600 text-white hover:opacity-90",
  },
};

export type ThemeKey = keyof typeof themes;