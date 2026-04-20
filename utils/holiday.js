/**
 * @file: utils/holiday.js
 */
const LunarUtils = require('./lunar.js');

let HolidayInfo = {
  "巴西": {
    "2025": { holidays: ['01-01', '01-28', '01-29', '01-30', '01-31', '04-04', '05-01', '05-02', '05-30', '09-30', '10-01', '10-02', '10-03'], extraWorkdays: [] },
    "2026": { holidays: ['01-01', '02-16', '02-17', '02-18', '02-19', '04-06', '05-01', '05-04', '06-19', '09-25', '10-01', '10-02', '10-05'], extraWorkdays: [] }
  },
  "中国": {
    "2025": { holidays: ['01-01', '01-28', '01-29', '01-30', '01-31', '02-03', '02-04', '04-04', '05-01', '05-02', '05-05', '06-02', '09-30', '10-01', '10-02', '10-03', '10-06', '10-07', '10-08'], extraWorkdays: ['01-26', '02-08', '04-27', '09-28', '10-11'] },
    "2026": { holidays: ['01-01', '01-02', '02-16', '02-17', '02-18', '02-19', '02-20', '02-23', '04-06', '05-01', '05-04', '05-05', '06-19', '09-25', '10-01', '10-02', '10-05', '10-06', '10-07'], extraWorkdays: ['01-04', '02-14', '02-28', '05-09', '09-20', '10-10'] }
  },
  "美国": {
    "2025": { holidays: [], extraWorkdays: [] },
    "2026": { holidays: ['01-01', '02-16', '02-17', '02-18', '04-06', '05-01', '06-19', '10-01', '10-02', '10-05', '11-26', '11-27', '12-25'], extraWorkdays: [] }
  }
};

// Sync with Storage if available
function syncWithStorage() {
  const stored = wx.getStorageSync('customHolidayInfo');
  if (stored) {
    try {
      HolidayInfo = typeof stored === 'string' ? JSON.parse(stored) : stored;
    } catch (e) {
      console.error('Failed to parse holiday info from storage', e);
    }
  }
}
syncWithStorage();

const CN_FIXED = {
  "01-01": "元旦",
  "03-08": "妇女节",
  "05-01": "劳动节",
  "1919-05-04": "青年节",
  "06-01": "儿童节",
  "1921-07-01": "建党节",
  "1927-08-01": "建军节",
  "1945-09-03": "抗日战争胜利日",
  "09-10": "教师节",
  "09-30": "烈士纪念日",
  "1949-10-01": "国庆节",
  "12-13": "国家公祭日",
  "1893-12-26": "毛泽东诞辰"
};

const CN_FIXED2 = {
  "1-1": "春节/鸡日(这一天不能杀鸡，也不能打骂孩子，以求吉利。古人会在门上贴鸡画，用其象征吉祥和驱邪。)",
  "1-2": "犬日(祭祀狗神，感谢狗的看家护院之恩。)",
  "1-3": "猪日(传说中这是女娲造猪的日子。)",
  "1-4": "羊日/接神日(传说女娲造羊的日子。)",
  "1-5": "牛日/破五",
  "1-6": "马日",
  "1-7": "人日",
  "1-8": "谷日",
  "1-9": "天日",
  "1-10": "地日",
  "1-15": "元宵节(又名上元节——天官赐福。)",
  "1973-1-16": "LWB农历🎂",
  "2-2": "龙抬头",
  "3-3": "上巳节(农历三月初三，是中国古人的情人节和春游日。)",
  "5-5": "端午节",
  "1973-5-8": "ZXJ农历🎂",
  "7-7": "七夕节",
  "7-15": "中元节(又名鬼节——地官赦罪。)",
  "8-15": "中秋节",
  "2001-8-18": "QQ农历🎂",
  "9-9": "重阳节",
  "1945-09-24": "WJY农历🎂",
  "2020-09-29": "LK农历忌日🕯",
  "10-1": "寒衣节",
  "10-15": "下元节(又名水官节——水官解厄。)",
  "12-8": "腊八节",
  "1946-12-14": "YXR农历🎂",
  "12-23": "北方小年",
  "12-24": "南方小年"
};

const US_FIXED = {
  "01-01": "新年(New Year's Day)",
  "02-14": "情人节(Valentine's Day)",
  "04-01": "愚人节(April Fools' Day)",
  "06-19": "六月节(Juneteenth)",
  "1776-07-04": "独立日(Independence Day)",
  "10-31": "万圣节(Halloween)",
  "11-11": "退伍军人节(Veterans Day)",
  "12-24": "平安夜(Christmas Eve)",
  "12-25": "圣诞节(Christmas Day)",
  "03-31": "查韦斯日(Cesar Chavez Day)",
  "04-24": "种族灭绝纪念(Genocide Remembrance Day)",
  "1850-09-09": "加州入美纪念日(Admission Day)"
};

const BR_FIXED = {
  "01-01": "元旦(Confraternização Universal)",
  "03-08": "国际妇女节(Dia Internacional da Mulher)",
  "04-21": "拔牙者纪念日(Tiradentes)",
  "05-01": "劳动节(Dia do Trabalho)",
  "1822-09-07": "独立日(Independência do Brasil)",
  "10-12": "阿帕雷西达圣母日(Nossa Senhora Aparecida)",
  "10-31": "萨西节(Dia do Saci)",
  "11-02": "万灵节(Dia de Finados)",
  "1889-11-15": "共和国宣言日(Proclamação da República)",
  "12-25": "圣诞节(Natal)"
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

  // Find the N-th 'Geng' day starting from a given date
  _getGengDayAfter(date, n) {
    const baseDate = Date.UTC(1900, 0, 31); // 甲辰日 (40)
    let current = new Date(date);
    let count = 0;
    while (count < n) {
      const offset = Math.round((Date.UTC(current.getFullYear(), current.getMonth(), current.getDate()) - baseDate) / 86400000);
      const gzD = (offset % 60 + 60) % 60 + 40;
      if (gzD % 10 === 6) { // 'Geng' is index 6 (甲乙丙丁戊己庚...)
        count++;
        if (count === n) return current;
      }
      current.setDate(current.getDate() + 1);
    }
    return current;
  }

  _isSameDay(d1, d2) {
    return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
  }

  // parses date keys flexibly and calculates target validation and age
  _matchFixed(db, targetYear, targetMonth, targetDay) {
    let results = [];
    for (let key in db) {
      let y = null, m = null, d = null;
      let parts = key.split('-');

      if (parts.length === 3) {
        y = parseInt(parts[0], 10);
        m = parseInt(parts[1], 10);
        d = parseInt(parts[2], 10);
      } else if (parts.length === 2) {
        m = parseInt(parts[0], 10);
        d = parseInt(parts[1], 10);
      } else {
        // Fallback for YYYYMMDD or MMDD formats without dashes
        let clean = key.replace(/[^0-9]/g, '');
        if (clean.length === 8) {
          y = parseInt(clean.substring(0, 4), 10);
          m = parseInt(clean.substring(4, 6), 10);
          d = parseInt(clean.substring(6, 8), 10);
        } else if (clean.length === 4) {
          m = parseInt(clean.substring(0, 2), 10);
          d = parseInt(clean.substring(2, 4), 10);
        }
      }

      if (m === targetMonth && d === targetDay) {
        let isValid = true;
        let age = null;
        if (y !== null && targetYear >= y) {
          age = targetYear - y;
        } else if (y !== null && targetYear < y) {
          isValid = false; 
        }
        
        if (isValid) {
          results.push({ name: db[key], age: age });
        }
      }
    }
    return results;
  }

  _formatNames(matches) {
    if (!matches || matches.length === 0) return { short: '', full: '' };

    let shortNames = [];
    let fullNames = [];

    matches.forEach(item => {
      let rawName = item.name;
      let ageMatch = item.age;
      
      let shortName = rawName;
      let extra = "";
      
      // Parse parentheses if any
      let parenMatch = rawName.match(/^(.*?)\((.*)\)$/);
      if (parenMatch) {
        shortName = parenMatch[1];
        extra = parenMatch[2];
      }

      let fullName = shortName;
      let hasAgeObj = (ageMatch !== null && ageMatch > 0);
      
      if (hasAgeObj) {
        fullName += `(${ageMatch}周年)`;
      }

      if (extra) {
        if (hasAgeObj) fullName += `(${extra})`;
        else fullName += `(${extra})`;
      }

      shortNames.push(shortName);
      fullNames.push(fullName);
    });

    return { short: shortNames.join('/'), full: fullNames.join(' / ') };
  }

  getHolidays(year, month, day) {
    const mm_dd = month.toString().padStart(2, '0') + '-' + day.toString().padStart(2, '0');
    let result = {
      cnHoliday: '', cnHolidayFull: '', cnStatus: '', 
      usHoliday: '', usHolidayFull: '', usStatus: '',
      brHoliday: '', brHolidayFull: '', brStatus: ''
    };

    // 1. Determine Status from HolidayInfo
    const regions = { "中国": "cn", "美国": "us", "巴西": "br" };
    for (let regionName in regions) {
      let rKey = regions[regionName];
      let info = HolidayInfo[regionName] && HolidayInfo[regionName][year];
      if (info) {
        if (info.holidays.includes(mm_dd)) result[rKey + 'Status'] = 'rest';
        else if (info.extraWorkdays.includes(mm_dd)) result[rKey + 'Status'] = 'work';
      }
    }

    // Overwrite/Append CN fixes with CN_FIXED (flexible date handling)
    let cnMatch = this._matchFixed(CN_FIXED, year, month, day);
    if (cnMatch.length > 0) {
      let f = this._formatNames(cnMatch);
      result.cnHoliday = (result.cnHoliday && result.cnHoliday !== f.short) ? `${result.cnHoliday}/${f.short}` : f.short; 
      result.cnHolidayFull = (result.cnHolidayFull && !f.full.includes(result.cnHolidayFull)) ? `${result.cnHolidayFull} / ${f.full}` : f.full;
    }

    // Chinese Lunar fixed from CN_FIXED2
    const lunar = LunarUtils.getLunar(year, month, day);
    if (lunar) {
      let lMatch = this._matchFixed(CN_FIXED2, lunar.lYear, lunar.lMonth, lunar.lDay);
      if (lMatch.length > 0) {
        let f = this._formatNames(lMatch);
        result.cnHoliday = (result.cnHoliday && result.cnHoliday !== f.short) ? `${result.cnHoliday}/${f.short}` : f.short;
        result.cnHolidayFull = (result.cnHolidayFull && !f.full.includes(result.cnHolidayFull)) ? `${result.cnHolidayFull} / ${f.full}` : f.full;
      }
    }

    // 2. US fixed
    let usMatch = this._matchFixed(US_FIXED, year, month, day);
    let usF = this._formatNames(usMatch);
    result.usHoliday = usF.short;
    result.usHolidayFull = usF.full;
    
    // US Variable
    if (!result.usHoliday) {
      if (month === 1 && day === this._getNthDay(year, 1, 1, 3)) { result.usHoliday = "马丁路德金日"; result.usHolidayFull = "马丁路德金日(Martin Luther King Jr. Day)"; }
      else if (month === 2 && day === this._getNthDay(year, 2, 1, 3)) { result.usHoliday = "总统日"; result.usHolidayFull = "总统日(Presidents' Day)"; }
      else if (month === 5 && day === this._getLastDay(year, 5, 1)) { result.usHoliday = "阵亡将士纪念日"; result.usHolidayFull = "阵亡将士纪念日(Memorial Day)"; }
      else if (month === 9 && day === this._getNthDay(year, 9, 1, 1)) { result.usHoliday = "劳工节"; result.usHolidayFull = "劳工节(Labor Day)"; }
      else if (month === 10 && day === this._getNthDay(year, 10, 1, 2)) { result.usHoliday = "哥伦布日"; result.usHolidayFull = "哥伦布日(Columbus Day)"; }
      else if (month === 11 && day === this._getNthDay(year, 11, 4, 4)) { result.usHoliday = "感恩节"; result.usHolidayFull = "感恩节(Thanksgiving Day)"; }
    }

    // 3. BR fixed
    let brMatch = this._matchFixed(BR_FIXED, year, month, day);
    let brF = this._formatNames(brMatch);
    result.brHoliday = brF.short;
    result.brHolidayFull = brF.full;

    // --- Dynamic Chinese Special Days (Sanfu, Sanjiu) ---
    const curDate = new Date(year, month - 1, day);
    
    // Sanfu
    const summerSolstice = new Date(year, 5, LunarUtils._getTerm(year, 11)); // Summer Solstice
    const autumnBegins = new Date(year, 7, LunarUtils._getTerm(year, 14)); // Autumn Begins
    const touFu = this._getGengDayAfter(summerSolstice, 3);
    const zhongFu = this._getGengDayAfter(summerSolstice, 4);
    const moFu = this._getGengDayAfter(autumnBegins, 1);

    if (this._isSameDay(curDate, touFu)) { result.cnHoliday += (result.cnHoliday?'/':'') + "初伏"; result.cnHolidayFull += (result.cnHolidayFull?' / ':'') + "初伏(三伏天开始)"; }
    else if (this._isSameDay(curDate, zhongFu)) { result.cnHoliday += (result.cnHoliday?'/':'') + "中伏"; result.cnHolidayFull += (result.cnHolidayFull?' / ':'') + "中伏"; }
    else if (this._isSameDay(curDate, moFu)) { result.cnHoliday += (result.cnHoliday?'/':'') + "末伏"; result.cnHolidayFull += (result.cnHolidayFull?' / ':'') + "末伏(三伏天结束)"; }

    // Sanjiu (Counting from Winter Solstice)
    const lastWinterSolstice = new Date(year - 1, 11, LunarUtils._getTerm(year - 1, 23));
    const currentWinterSolstice = new Date(year, 11, LunarUtils._getTerm(year, 23));
    const winterBase = (month === 12 && day >= currentWinterSolstice.getDate()) ? currentWinterSolstice : lastWinterSolstice;
    const diffDays = Math.floor((curDate - winterBase) / 86400000);
    if (diffDays >= 0 && diffDays < 81) {
      const nineIdx = Math.floor(diffDays / 9) + 1;
      const dayInNine = (diffDays % 9) + 1;
      const nineNames = ["一九", "二九", "三九", "四九", "五九", "六九", "七九", "八九", "九九"];
      if (dayInNine === 1) {
        result.cnHoliday += (result.cnHoliday?'/':'') + nineNames[nineIdx-1];
        result.cnHolidayFull += (result.cnHolidayFull?' / ':'') + nineNames[nineIdx-1];
      }
    }

    // --- Expanded Variable Holidays ---
    const thanksgivingDay = this._getNthDay(year, 11, 4, 4);

    // US Variable
    if (!result.usHoliday) {
      const easter = this._getEaster(year);
      const motherDay = this._getNthDay(year, 5, 0, 2);
      const fatherDay = this._getNthDay(year, 6, 0, 3);
      const laborDay = this._getNthDay(year, 9, 1, 1);
      const indigenousDay = this._getNthDay(year, 10, 1, 2);
      const nativeAmericanDay = this._getLastDay(year, 9, 5); // Last Friday of Sept

      if (this._isSameDay(curDate, easter)) { 
        result.usHoliday = "复活节"; 
        result.usHolidayFull = "复活节(Easter,耶稣复活的日子；春分之后第一次满月后的第一个星期日)"; 
      }
      else if (month === 1 && day === this._getNthDay(year, 1, 1, 3)) { 
        result.usHoliday = "马丁·路德·金纪念日"; 
        result.usHolidayFull = "马丁·路德·金纪念日(MLK Jr. Day,纪念为黑人争取平等权利、以非暴力手段推动民权进步的领袖——马丁·路德·金牧师)"; 
      }
      else if (month === 2 && day === this._getNthDay(year, 2, 1, 3)) { 
        result.usHoliday = "总统日"; 
        result.usHolidayFull = "总统日(Presidents' Day,也称华盛顿诞辰纪念日,纪念美国第一任总统乔治·华盛顿)"; 
      }
      else if (month === 5 && day === this._getLastDay(year, 5, 1)) { 
        result.usHoliday = "阵亡将士纪念日"; 
        result.usHolidayFull = "阵亡将士纪念日(Memorial Day,悼念在服役期间为国家捐躯的美国男女官兵。)"; 
      }
      else if (month === 5 && day === motherDay) { 
        result.usHoliday = "母亲节"; 
        result.usHolidayFull = "母亲节(Mother's Day)"; 
      }
      else if (month === 6 && day === fatherDay) { 
        result.usHoliday = "父亲节"; 
        result.usHolidayFull = "父亲节(Father's Day)"; 
      }
      else if (month === 9 && day === laborDay) { 
        result.usHoliday = "劳工节"; 
        result.usHolidayFull = "劳工节(Labor Day,向所有为社会和国家做出贡献的劳动者表达敬意和感谢)"; 
      }
      else if (month === 10 && day === indigenousDay) { 
        result.usHoliday = "原住民日"; 
        result.usHolidayFull = "原住民日(Indigenous Peoples' Day,之前称哥伦布日Columbus Day。现为纪念和致敬美国原住民的历史、文化与贡献的节日)"; 
      }
      else if (month === 9 && day === nativeAmericanDay) {
        result.usHoliday = "美国原住民节";
        result.usHolidayFull = "美国原住民节(Native American Day,加州节日，旨在替代“哥伦布日”，纪念在欧洲殖民者到来前就生活在美洲的全体原住民)";
      }
      else if (month === 11 && day === thanksgivingDay) { 
        result.usHoliday = "感恩节"; 
        result.usHolidayFull = "感恩节(Thanksgiving Day,感恩节的由来始于1621年清教徒和原住民共享的一顿秋收大餐)"; 
      }
      else {
        // Black Friday and Cyber Monday
        const bfDate = new Date(year, 10, thanksgivingDay + 1);
        const cmDate = new Date(year, 10, thanksgivingDay + 4);
        if (this._isSameDay(curDate, bfDate)) { 
          result.usHoliday = "黑色星期五"; 
          result.usHolidayFull = "黑色星期五(Black Friday,全年购物季正式开始的一天，以大幅折扣和海量抢购闻名。)"; 
        }
        else if (this._isSameDay(curDate, cmDate)) { 
          result.usHoliday = "网络星期一"; 
          result.usHolidayFull = "网络星期一(Cyber Monday,黑五后的第一个星期一，主打线上商品折扣。)"; 
        }
      }
    }

    // BR Variable
    if (!result.brHoliday) {
      const easter = this._getEaster(year);
      
      const carnivalSat = this._addDays(easter, -50);
      const carnivalTue = this._addDays(easter, -47);
      const ashWednesday = this._addDays(easter, -46);
      const palmSunday = this._addDays(easter, -7);
      const maundyThursday = this._addDays(easter, -3);
      const goodFriday = this._addDays(easter, -2);
      const holySaturday = this._addDays(easter, -1);
      const corpusChristi = this._addDays(easter, 60); 

      if (this._isSameDay(curDate, carnivalSat)) { result.brHoliday = "嘉年华开始"; result.brHolidayFull = "狂欢节开始(Carnival Saturday，狂欢节的庆祝从今天开始；复活节前50天。)"; }
      else if (this._isSameDay(curDate, carnivalTue)) { result.brHoliday = "嘉年华"; result.brHolidayFull = "狂欢节(Carnaval，也称狂欢节周二，实际上也是狂欢节最后一天。)"; }
      else if (this._isSameDay(curDate, ashWednesday)) { result.brHoliday = "圣灰星期三"; result.brHolidayFull = "圣灰星期三(Quarta-Feira de Cinzas，基督教大斋期四旬期的起始日。)"; }
      else if (this._isSameDay(curDate, palmSunday)) { result.brHoliday = "棕树主日"; result.brHolidayFull = "棕树主日(Palm Sunday,复活节前的一个星期日，标志着圣周的开始。)"; }
      else if (this._isSameDay(curDate, maundyThursday)) { result.brHoliday = "濯足节"; result.brHolidayFull = "濯足节/圣周四(Maundy Thursday,最后的晚餐的日子。)"; }
      else if (this._isSameDay(curDate, goodFriday)) { result.brHoliday = "耶稣受难日"; result.brHolidayFull = "耶稣受难日/圣周五(Sexta-feira Santa / Paixão de Cristo，记念耶稣之死。)"; }
      else if (this._isSameDay(curDate, holySaturday)) { result.brHoliday = "圣周六"; result.brHolidayFull = "圣周六(Holy Saturday，纪念耶稣埋葬的日子)"; }
      else if (this._isSameDay(curDate, easter)) { result.brHoliday = "复活节"; result.brHolidayFull = "复活节(Páscoa，基督教纪念耶稣基督复活的节日,象征重生与希望)"; }
      else if (this._isSameDay(curDate, corpusChristi)) { result.brHoliday = "基督圣体节"; result.brHolidayFull = "基督圣体节(Corpus Christi,庆祝和纪念圣体圣事。)"; }
      else if (month === 5 && day === this._getNthDay(year, 5, 0, 2)) { result.brHoliday = "母亲节"; result.brHolidayFull = "母亲节(Dia das Mães)"; }
      else if (month === 11 && day === thanksgivingDay) { 
        result.brHoliday = "感恩节"; 
        result.brHolidayFull = "感恩节(Dia de Ação de Graças,受美国感恩节文化影响于1949年设立,侧重宗教仪式和家庭团聚)"; 
      }
    }
    return result;
  }

  getHolidayInfo() {
    return HolidayInfo;
  }

  updateHolidayInfo(newInfo) {
    if (!newInfo) return;
    HolidayInfo = newInfo;
    wx.setStorageSync('customHolidayInfo', newInfo);
  }
}

module.exports = new HolidayEngine();
