/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      borderWidth : { '3' : '3px' ,},
      colors: {
        'primary': '#38a169',
        'primaryDark': '#17612B',
        'primaryLight': '#16A34A',
        'primaryLighter': '#34A853',
        'primaryFaint' : '#34a85321',
        'backgroundColor': '#f5f5f5',
        'wheat' : 'wheat',
      },
      boxShadow : {
        'darker' : '4px 2px 11px 1px rgba(0, 0, 0, 0.44)',
        'dark' : '4px 0px 4px 0px rgba(0, 0, 0, 0.25)',
        'light' : '0px 0px 4px 2px rgba(0, 0, 0, 0.25)'
      },
      backgroundImage : {
        'sidebar-gradient' : 'linear-gradient(to bottom, #17612b 9%, #16a34a 33%, #34a853 95%, #34a853 100%)',
      },
      maxWidth : {
        '75' : '75%',
      },
      width : {
        '4/5' : '80%',
        '26' : '102px'
      },
      minWidth : {
        '75' : '75%',
      },
      flexGrow : {
        "1/2" : '1/2',
      }
    },
  },
  plugins: [],
}

