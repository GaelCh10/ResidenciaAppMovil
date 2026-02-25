/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}",
            "./presentation/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {

      colors: {
        primary: '#367FDE',
        blueone: '#0b1973',
        // DEFINIMOS UN COLOR Y SUS INSTENSIDADES  
        secondary:{
          DEFAULT: '#fa6e06',
          100:'#E6EDF7',
          200: '#F1F7FF',
        } 
      },

      fontFamily:{
        'work-black':['TitilliumWeb-Black','Titillium-Web'],
        'work-light':['TitilliumWeb-Light','Titillium-Web'],
        'work-regular':['TitilliumWeb-Regular','Titillium-Web'],
        'lsm-regular':['LsmVulpy-Regular','LsmVulpy'],
      }
    },
  },
  plugins: [],
}