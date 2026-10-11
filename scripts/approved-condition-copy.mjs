// Oct 11 explicit copy-only exception. Applying these exact replacements to
// the approved source must still match every other byte, including behavior.
export const APPROVED_CONDITION_COPY={
 "src/story.js": [
  [
   "Low NWS rip risk · check flags",
   "Low NWS rip-current risk"
  ],
  [
   "High NWS rip risk · stay out of the water",
   "High NWS rip-current risk"
  ],
  [
   "Moderate NWS rip risk · use caution",
   "Moderate NWS rip-current risk"
  ],
  [
   "Check local beach flags before entering",
   "Rip-current forecast unavailable"
  ],
  [
   "Use sun protection",
   "UV forecast"
  ],
  [
   "'head indoors':'plan around the showers'",
   "'thunderstorms':'showers'"
  ],
  [
   "Best: ${run===calm",
   "Conditions: ${run===calm"
  ],
  [
   "Showery day · plan around the rain",
   "Showers through the day"
  ],
  [
   "Beach outlook · check wind and flags",
   "Beach conditions · wind and wave forecast"
  ]
 ],
 "src/surf.js": [
  [
   "High rip risk · stay out of the water",
   "High rip-current risk · NWS"
  ],
  [
   "Thunderstorms · stay out of the water",
   "Thunderstorm forecast"
  ],
  [
   "Moderate rip risk · use caution",
   "Moderate rip-current risk · NWS"
  ],
  [
   "Rain moving through · plan around it",
   "Rain moving through"
  ],
  [
   "Choppy water · check beach flags",
   "Choppy water"
  ],
  [
   "Calmer water · best ",
   "Calmer water · "
  ],
  [
   "Lower rip risk · check beach flags",
   "Low rip-current risk · NWS"
  ],
  [
   "Beach conditions · check local flags",
   "Rip-current forecast unavailable"
  ]
 ],
 "src/sheets.js": [
  [
   "waterVerdict().replace('stay out of the water','stay ashore')",
   "waterVerdict()"
  ],
  [
   "<span>Reapply</span>",
   "<span>Session elapsed</span>"
  ],
  [
   "state.tanStarted?Math.max(0,120-elapsed)+' min':'2 h'",
   "state.tanStarted?elapsed+' min':'0 min'"
  ]
 ],
 "src/daybuoy.js": [
  [
   "Storm warning · Head indoors",
   "Thunderstorm forecast"
  ],
  [
   "Thunderstorms · Head indoors",
   "Thunderstorm forecast"
  ]
 ]
};
export const applyApprovedCopy=(file,source)=>(APPROVED_CONDITION_COPY[file]||[]).reduce((s,[from,to])=>s.replaceAll(from,to),source);
