const LunarEngine = require('./utils/lunar.js');
let baseDate = Date.UTC(1900, 0, 31);
let objDate = Date.UTC(2001, 9, 4); // Oct is 9
let offset = Math.floor((objDate - baseDate) / 86400000);
console.log('Offset:', offset);

let daysOfYear = 0, iYear = 1900;
let tempOffset = offset;
for (iYear = 1900; iYear < 2100 && tempOffset > 0; iYear++) {
    daysOfYear = LunarEngine._lYearDays(iYear);
    tempOffset -= daysOfYear;
}
if (tempOffset < 0) {
    tempOffset += daysOfYear;
    iYear--;
}
console.log('Target Year:', iYear, 'Remaining Offset:', tempOffset);

let isLeap = false;
let leapMonth = LunarEngine._leapMonth(iYear);
let temp = 0;
let iMonth = 1;

for (iMonth = 1; iMonth < 13 && tempOffset > 0; iMonth++) {
    if (leapMonth > 0 && iMonth == (leapMonth + 1) && !isLeap) {
        --iMonth;
        isLeap = true;
        temp = LunarEngine._leapDays(iYear);
    } else {
        temp = LunarEngine._monthDays(iYear, iMonth);
    }

    if (isLeap && iMonth == (leapMonth + 1)) isLeap = false;
    tempOffset -= temp;
}

if (tempOffset == 0 && leapMonth > 0 && iMonth == leapMonth + 1) {
    if (isLeap) isLeap = false;
    else { isLeap = true; --iMonth; }
}
if (tempOffset < 0) {
    tempOffset += temp;
    --iMonth;
}
console.log('Target Month:', iMonth, 'IsLeap:', isLeap, 'Day:', tempOffset + 1);
