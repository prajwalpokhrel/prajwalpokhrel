tailwind.config = {
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                background: "#050505",
                surface: "#111111",
                "surface-variant": "#1a1a1a",
                primary: "#ffffff",
                "on-primary": "#000000",
                "on-background": "#f5f5f5",
                "on-surface": "#e0e0e0",
                "on-surface-variant": "#888888",
                outline: "#222222",
            },
            fontFamily: {
                sans: ["Plus Jakarta Sans", "sans-serif"],
                display: ["Outfit", "sans-serif"],
                mono: ["JetBrains Mono", "monospace"],
            },
            animation: {
                marquee: 'marquee 20s linear infinite',
            },
            keyframes: {
                marquee: {
                    '0%': { transform: 'translateX(0%)' },
                    '100%': { transform: 'translateX(-50%)' },
                }
            }
        },
    },
};
