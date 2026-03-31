/**
 * @file: utils/holiday.js
 */

const CN_HOLIDAY_HASH = {
  "2026": {
    "0101": { n: "元旦", s: 1 }, "0102": { s: 1 }, "0103": { s: 1 },
    "0215": { s: 2 }, 
    "0216": { n: "除夕", s: 1 }, "0217": { n: "春节", s: 1 }, 
    "0218": { s: 1 }, "0219": { s: 1 }, "0220": { s: 1 }, "0221": { s: 1 }, "0222": { s: 1 },
    "0228": { s: 2 }, 
    "0404": { n: "清明", s: 1 }, "0405": { s: 1 }, "0406": { s: 1 },
    "0501": { n: "劳动节", s: 1 }, "0502": { s: 1 }, "0503": { s: 1 }, "0504": { s: 1 }, "0505": { s: 1 },
    "0426": { s: 2 }, "0509": { s: 2 } 
  }
};

class HolidayEngine {
  constructor() {
    this.easterCache = {}; 
  }

  _getMMDD(month, day) {
    return month.toString().padStart(2, '0') + day.toString().padStart(2, '0');
  }

  _getNthDay(year, month, dayOfWeek, n) {
    const firstDay = new Date(year, month - 1, 1);
    let diff = dayOfWeek - firstDay.getDay();
    if (diff < 0) diff += 7;
    return 1 + diff + (n - 1) * 7;
  }

  _getLastDay(year, month, dayOfWeek) {
    const lastDay = new Date(year, month, 0); 
    let diff = lastDay.getDay() - dayOfWeek;
    if (diff < 0) diff += 7;
    return lastDay.getDate() - diff;
  }

  _getEaster(year) {
    if (this.easterCache[year]) return this.easterCache[year];
    
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4), e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4), k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    
    const easterDate = new Date(year, month - 1, day);
    this.easterCache[year] = easterDate;
    return easterDate;
  }

  _addDays(date, days) {
    const res = new Date(date);
    res.setDate(res.getDate() + days);
    return res;
  }

  getHolidays(year, month, day) {
    const mmdd = this._getMMDD(month, day);
    let result = {
      cnHoliday: '', cnStatus: '', 
      usHoliday: '', brHoliday: ''
    };

    const cnYearData = CN_HOLIDAY_HASH[year];
    if (cnYearData && cnYearData[mmdd]) {
      const target = cnYearData[mmdd];
      if (target.n) result.cnHoliday = target.n;
      result.cnStatus = target.s === 1 ? 'rest' : 'work';
    }

    const usMap = { "0101": "元旦(US)", "0619": "六月节", "0704": "独立日", "1111": "退伍军人节", "1225": "圣诞节" };
    if (usMap[mmdd]) result.usHoliday = usMap[mmdd];
    else {
      if (month === 1 && day === this._getNthDay(year, 1, 1, 3)) result.usHoliday = "马丁路德金日";
      else if (month === 2 && day === this._getNthDay(year, 2, 1, 3)) result.usHoliday = "总统日";
      else if (month === 5 && day === this._getLastDay(year, 5, 1)) result.usHoliday = "阵亡将士纪念日";
      else if (month === 9 && day === this._getNthDay(year, 9, 1, 1)) result.usHoliday = "劳工节";
      else if (month === 10 && day === this._getNthDay(year, 10, 1, 2)) result.usHoliday = "哥伦布日";
      else if (month === 11 && day === this._getNthDay(year, 11, 4, 4)) result.usHoliday = "感恩节"; 
    }

    const brFixedMap = { "0101": "Confraternização", "0421": "Tiradentes", "0501": "Trabalhador", "0907": "Independência", "1012": "Nossa Senhora", "1102": "Finados", "1115": "Proclamação", "1225": "Natal" };
    if (brFixedMap[mmdd]) result.brHoliday = brFixedMap[mmdd];
    else {
      const easter = this._getEaster(year);
      const carnivalDate = this._addDays(easter, -47); 
      const goodFriday = this._addDays(easter, -2);    
      const corpusChristi = this._addDays(easter, 60); 

      if (month === carnivalDate.getMonth() + 1 && day === carnivalDate.getDate()) result.brHoliday = "Carnaval";
      else if (month === goodFriday.getMonth() + 1 && day === goodFriday.getDate()) result.brHoliday = "Sexta-feira";
      else if (month === corpusChristi.getMonth() + 1 && day === corpusChristi.getDate()) result.brHoliday = "Corpus";
    }

    return result;
  }
}

module.exports = new HolidayEngine();
