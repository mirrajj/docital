/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
  	extend: {
  		borderWidth: {
  			'3': '3px'
  		},
  		colors: {
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			primaryDark: '#17612B',
  			primaryLight: '#16A34A',
  			primaryLighter: '#34A853',
  			primaryFaint: '#34a85321',
  			backgroundColor: '#f5f5f5',
  			wheat: 'wheat',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		boxShadow: {
  			darker: '4px 2px 11px 1px rgba(0, 0, 0, 0.44)',
  			dark: '4px 0px 4px 0px rgba(0, 0, 0, 0.25)',
  			light: '0px 0px 4px 2px rgba(0, 0, 0, 0.25)'
  		},
  		backgroundImage: {
  			'sidebar-gradient': 'linear-gradient(to bottom, #17612b 9%, #16a34a 33%, #34a853 95%, #34a853 100%)'
  		},
  		maxWidth: {
  			'75': '75%'
  		},
  		width: {
  			'26': '102px',
  			'4/5': '80%'
  		},
  		minWidth: {
  			'75': '75%'
  		},
  		flexGrow: {
  			'1/2': '1/2'
  		},
  		// borderRadius: {
  		// 	lg: 'var(--radius)',
  		// 	md: 'calc(var(--radius) - 2px)',
  		// 	sm: 'calc(var(--radius) - 4px)'
  		// }
  	}
  },
  plugins: [require("tailwindcss-animate")],
}

