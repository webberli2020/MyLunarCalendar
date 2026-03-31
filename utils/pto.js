/**
 * @file: utils/pto.js
 */
const HolidayUtils = require('./holiday.js');

class PTOEngine {
  calculatePTO(startDateStr, endDateStr, region = 'CN') {
    const startObj = new Date(startDateStr);
    const endObj = new Date(endDateStr);
    
    if (startObj > endObj) {
      return { error: '开始日期不能晚于结束日期', ptoDays: 0, details: [] };
    }

    let currentDate = new Date(startObj);
    let ptoDays = 0;   
    let totalDays = 0; 
    let details = [];  

    while (currentDate <= endObj) {
      totalDays++;
      const y = currentDate.getFullYear();
      const m = currentDate.getMonth() + 1;
      const d = currentDate.getDate();
      const dayOfWeek = currentDate.getDay(); 
      const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);

      const meta = HolidayUtils.getHolidays(y, m, d);
      let isWorkingDay = false;
      let reason = '';

      if (region === 'CN') {
        if (isWeekend) {
          if (meta.cnStatus === 'work') {
            isWorkingDay = true;
            reason = '周末补班（需扣配额）';
          } else {
            reason = '常规周末（无休配额扣除）';
          }
        } else {
          if (meta.cnStatus === 'rest') {
            reason = `法定假日豁免(${meta.cnHoliday})`;
          } else {
            isWorkingDay = true;
            reason = '工作日（正常扣减）';
          }
        }
      } else if (region === 'US') {
        if (isWeekend) {
           reason = '周末休息';
        } else if (meta.usHoliday) {
           reason = `联邦假日豁免(${meta.usHoliday})`;
        } else {
           isWorkingDay = true;
           reason = '工作日判定';
        }
      } else if (region === 'BR') {
        if (isWeekend) {
           reason = '周末休息';
        } else if (meta.brHoliday) {
           reason = `法定假日豁免(${meta.brHoliday})`;
        } else {
           isWorkingDay = true;
           reason = '工作日判定';
        }
      }

      if (isWorkingDay) ptoDays++;

      const dateStr = `${y}-${m.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
      details.push({ date: dateStr, isWorkingDay, reason });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return { ptoDays, totalDays, details };
  }
}

module.exports = new PTOEngine();
