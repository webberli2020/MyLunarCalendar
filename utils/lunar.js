/**
 * @file: utils/lunar.js
 */

const lunarInfo = [
  0x04bd8,0x04ae0,0x0a570,0x054d5,0x0d260,0x0d950,0x16554,0x056a0,0x09ad0,0x055d2,
  0x04ae0,0x0a5b6,0x0a4d0,0x0d250,0x1d255,0x0b540,0x0d6a0,0x0ada2,0x095b0,0x14977,
  0x04970,0x0a4b0,0x0b4b5,0x06a50,0x06d40,0x1ab54,0x02b60,0x09570,0x052f2,0x04970,
  0x06566,0x0d4a0,0x0ea50,0x06e95,0x05ad0,0x02b60,0x186e3,0x092e0,0x1c8d7,0x0c950,
  0x0d4a0,0x1d8a6,0x0b550,0x056a0,0x1a5b4,0x025d0,0x092d0,0x0d2b2,0x0a950,0x0b557,
  0x06ca0,0x0b550,0x15355,0x04da0,0x0a5b0,0x14573,0x052b0,0x0a9a8,0x0e950,0x06aa0,
  0x0aea6,0x0ab50,0x04b60,0x0aae4,0x0a570,0x05260,0x0f263,0x0d950,0x05b57,0x056a0,
  0x096d0,0x04dd5,0x04ad0,0x0a4d0,0x0d4d4,0x0d250,0x0d558,0x0b540,0x0b6a0,0x195a6,
  0x095b0,0x049b0,0x0a974,0x0a4b0,0x0b27a,0x06a50,0x06d40,0x0af46,0x0ab60,0x09570,
  0x04af5,0x04970,0x064b0,0x074a3,0x0ea50,0x06b58,0x055c0,0x0ab60,0x096d5,0x092e0,
  0x0c960,0x0d954,0x0d4a0,0x0da50,0x07552,0x056a0,0x0abb7,0x025d0,0x092d0,0x0cab5,
  0x0a950,0x0b4a0,0x0baa4,0x0ad50,0x055d9,0x04ba0,0x0a5b0,0x15176,0x052b0,0x0a930,
  0x07954,0x06aa0,0x0ad50,0x05b52,0x04b60,0x0a6e6,0x0a4e0,0x0d260,0x0ea65,0x0d530,
  0x05aa0,0x076a3,0x096d0,0x04bd7,0x04ad0,0x0a4d0,0x1d0b6,0x0d250,0x0d520,0x0dd45,
  0x0b5a0,0x056d0,0x055b2,0x049b0,0x0a577,0x0a4b0,0x0aa50,0x1b255,0x06d20,0x0ada0,
  0x14b63,0x09370,0x049f8,0x04970,0x064b0,0x168a6,0x0ea50,0x06b20,0x1a6c4,0x0aae0,
  0x092e0,0x0d2e3,0x0c960,0x0d557,0x0d4a0,0x0da50,0x05d55,0x056a0,0x0a6d0,0x055d4,
  0x052d0,0x0a9b8,0x0a950,0x0b4a0,0x0b6a6,0x0ad50,0x055a0,0x0aba4,0x0a5b0,0x052b0,
  0x0b273,0x06930,0x07337,0x06aa0,0x0ad50,0x14b55,0x04b60,0x0a570,0x054e4,0x0d160,
  0x0e968,0x0d520,0x0daa0,0x16aa6,0x056d0,0x04ae0,0x0a9d4,0x0a4d0,0x0d150,0x0f252,
  0x0d520
];

const Animals = ["鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"];
const Gan = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const Zhi = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

const lunarMonthNames = ["正", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "腊"];
const lunarDayNames = ["初一","初二","初三","初四","初五","初六","初七","初八","初九","初十","十一","十二","十三","十四","十五","十六","十七","十八","十九","二十","廿一","廿二","廿三","廿四","廿五","廿六","廿七","廿八","廿九","三十"];

class LunarEngine {
  constructor() {
    this.lunarInfo = lunarInfo;
  }

  // 1. 该年总天数
  _lYearDays(y) {
    let i, sum = 348;
    for (i = 0x8000; i > 0x8; i >>= 1) {
      sum += (this.lunarInfo[y - 1900] & i) ? 1 : 0;
    }
    return sum + this._leapDays(y);
  }

  // 2. 该年闰月天数（若无闰月返回0）
  _leapDays(y) {
    if (this._leapMonth(y)) {
      return (this.lunarInfo[y - 1900] & 0x10000) ? 30 : 29;
    }
    return 0;
  }

  // 3. 该年闰哪个月（无返回0）
  _leapMonth(y) {
    return this.lunarInfo[y - 1900] & 0xf;
  }

  // 4. 该年第m个月的天数
  _monthDays(y, m) {
    return (this.lunarInfo[y - 1900] & (0x10000 >> m)) ? 30 : 29;
  }

  // 5. 换算日柱干支
  _getDayGanZhi(y, m, d) {
    const baseDate = Date.UTC(1900, 0, 31);
    const targetDate = Date.UTC(y, m - 1, d);
    const offset = Math.round((targetDate - baseDate) / 86400000);
    const gzD = (offset % 60 + 60) % 60 + 40; // 1900-01-31 is 甲辰 (40)
    return Gan[gzD % 10] + Zhi[gzD % 12];
  }

  // 6. 换算月柱干支（通过节气）
  _getMonthGanZhi(y, m, d) {
    const m0 = m - 1;
    const t1d = this._getTerm(y, m0 * 2);
    let mGZIdx = (y - 1900) * 12 + m0 + 12;
    if (d >= t1d) mGZIdx++;
    return Gan[mGZIdx % 10] + Zhi[mGZIdx % 12];
  }

  // 获取节气日期 (1900-2100)
  _getTerm(y, n) {
    const sTermInfo = [0,21208,42467,63836,85337,107014,128867,150921,173149,195551,218072,240693,263343,285989,308563,331033,353350,375494,397447,419210,440795,462224,483532,504758];
    return new Date((31556925974.7 * (y - 1900) + sTermInfo[n] * 60000) + Date.UTC(1900, 0, 6, 2, 5)).getUTCDate();
  }

  getLunar(y, m, d) {
    const objDate = new Date(y, m - 1, d);
    let i, leap = 0, temp = 0;
    
    // 1900年1月31日是农历起点
    const baseDate = Date.UTC(1900, 0, 31);
    const targetDate = Date.UTC(objDate.getFullYear(), objDate.getMonth(), objDate.getDate());
    let offset = Math.floor((targetDate - baseDate) / 86400000);

    // 拦截 1901 年以前或超出范围的日期
    if (offset < 0 || objDate.getFullYear() < 1901) {
      return null;
    }

    // 逐年扣减
    for (i = 1900; i < 2100 && offset > 0; i++) {
        temp = this._lYearDays(i);
        offset -= temp;
    }

    if (offset < 0) {
        offset += temp;
        i--;
    }

    const iYear = i;
    leap = this._leapMonth(i); // 判定该年闰哪个月
    let isLeap = false;

    // 逐月扣减
    for (i = 1; i < 13 && offset > 0; i++) {
        // 判定闰月
        if (leap > 0 && i == (leap + 1) && isLeap == false) {
            --i;
            isLeap = true;
            temp = this._leapDays(iYear);
        } else {
            temp = this._monthDays(iYear, i);
        }

        // 解除闰月状态
        if (isLeap == true && i == (leap + 1)) isLeap = false;

        offset -= temp;
    }

    // 边界处理：正好在闰月当天的情况
    if (offset == 0 && leap > 0 && i == leap + 1) {
        if (isLeap) {
            isLeap = false;
        } else {
            isLeap = true;
            --i;
        }
    }

    if (offset < 0) {
        offset += temp;
        --i;
    }

    const iMonth = i;
    const iDay = offset + 1;

    // 岁次 (年干支) - 以1900年为子鼠参考点，或者更直观从年偏移计算
    // 1900庚子年对应：庚是第7个(索引6)，子是第1个(索引0)
    const gzYear = Gan[(iYear - 1900 + 36) % 10] + Zhi[(iYear - 1900 + 0) % 12];
    const animal = Animals[(iYear - 1900 + 0) % 12];
    const monthGanZhi = this._getMonthGanZhi(y, m, d);
    const dayGanZhi = this._getDayGanZhi(y, m, d);

    return {
      lYear: iYear, 
      lMonth: iMonth, 
      lDay: iDay, 
      isLeap: isLeap,
      lunarMonthStr: (isLeap ? "闰" : "") + lunarMonthNames[iMonth - 1] + "月",
      lunarDayStr: lunarDayNames[iDay - 1],
      gzYear: gzYear,
      gzMonth: monthGanZhi,
      gzDay: dayGanZhi,
      animal: animal
    };
  }
}

module.exports = new LunarEngine();
