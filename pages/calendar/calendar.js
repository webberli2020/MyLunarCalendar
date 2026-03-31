const HolidayUtils = require('../../utils/holiday.js');
const LunarUtils = require('../../utils/lunar.js');

const YEARS_START = 1890;
const YEARS_END = 2100;
const initYears = [];
for (let i = YEARS_START; i <= YEARS_END; i++) initYears.push(i);

const initMonths = [];
for (let i = 1; i <= 12; i++) initMonths.push(i);

Page({
  data: {
    weekDays: ['日', '一', '二', '三', '四', '五', '六'],
    currentYear: 2026,
    currentMonth: 1,
    selectedDate: '',
    selectedDetail: null,
    
    swiperData: [], 
    swiperCurrent: 1, 

    _currentYear: 0,
    _currentMonth: 0,

    years: initYears,
    months: initMonths,
    showPicker: false,       
    pickerValue: [0, 0],     
    tempPickerValue: [0, 0],  

    showPTO: false,
    ptoRegion: 'CN',
    ptoStart: '2026-02-15',
    ptoEnd: '2026-02-22',
    ptoResult: null
  },

  onLoad() {
    this.initCalendar(new Date('2026-01-01')); 
  },

  initCalendar(dateObj) {
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth() + 1;
    
    const yIndex = year - YEARS_START;
    const mIndex = month - 1;

    this.setData({
      _currentYear: year,
      _currentMonth: month,
      currentYear: year,
      currentMonth: month,
      selectedDate: this.formatDate(dateObj),
      pickerValue: [yIndex, mIndex],
      tempPickerValue: [yIndex, mIndex]
    });
    
    this.refreshSwiperData(year, month);
    this.updateDetailCard(year, month, dateObj.getDate());
  },

  formatDate(dateObj) {
    const y = dateObj.getFullYear();
    const m = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const d = dateObj.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${d}`;
  },

  getAdjustedMonth(year, month, offset) {
    let d = new Date(year, month - 1 + offset, 1);
    return {
      year: d.getFullYear(),
      month: d.getMonth() + 1
    };
  },

  generateMonthData(year, month) {
    let days = [];
    const firstDay = new Date(year, month - 1, 1).getDay();
    const daysInMonth = new Date(year, month, 0).getDate();
    const daysInPrevMonth = new Date(year, month - 1, 0).getDate();
    const todayStr = this.formatDate(new Date());

    for (let i = firstDay - 1; i >= 0; i--) {
      days.push(this.createDayNode(year, month - 1, daysInPrevMonth - i, 'prev', todayStr));
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(this.createDayNode(year, month, i, 'current', todayStr));
    }

    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push(this.createDayNode(year, month + 1, i, 'next', todayStr));
    }

    return { id: `${year}-${month}`, year, month, days };
  },

  createDayNode(y, m, d, type, todayStr) {
    if (m === 0) { y -= 1; m = 12; }
    if (m === 13) { y += 1; m = 1; }
    
    const dateStr = `${y}-${m.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
    const dateObj = new Date(y, m - 1, d);
    const dayOfWeek = dateObj.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    const holidayMeta = HolidayUtils.getHolidays(y, m, d);
    const lunarMeta = LunarUtils.getLunar(y, m, d);

    let uiLunar = lunarMeta.lunarDayStr;
    if (uiLunar === '初一') {
      uiLunar = lunarMeta.lunarMonthStr;
    }

    let holiday = holidayMeta.cnHoliday || holidayMeta.usHoliday || holidayMeta.brHoliday || '';

    return {
      date: dateStr, day: d, type: type,
      isWeekend, isToday: dateStr === todayStr,
      lunar: uiLunar, holiday: holiday, workStatus: holidayMeta.cnStatus
    };
  },

  refreshSwiperData(year, month) {
    const prev = this.getAdjustedMonth(year, month, -1);
    const next = this.getAdjustedMonth(year, month, 1);
    
    const swiperData = [
      this.generateMonthData(prev.year, prev.month),
      this.generateMonthData(year, month),
      this.generateMonthData(next.year, next.month)
    ];

    this.setData({ swiperData, swiperCurrent: 1 });
  },

  handleSwiperChange(e) {
    if(e.detail.source !== 'touch') return;
    
    const current = e.detail.current;
    let { _currentYear, _currentMonth } = this.data;

    let diff = 0;
    if (current === 2) diff = 1;       
    else if (current === 0) diff = -1; 

    if (diff === 0) return;

    const newTarget = this.getAdjustedMonth(_currentYear, _currentMonth, diff);
    
    const yIndex = newTarget.year - YEARS_START;
    const mIndex = newTarget.month - 1;

    this.setData({
      _currentYear: newTarget.year,
      _currentMonth: newTarget.month,
      currentYear: newTarget.year,
      currentMonth: newTarget.month,
      pickerValue: [yIndex, mIndex],
      tempPickerValue: [yIndex, mIndex]
    });

    setTimeout(() => {
      this.refreshSwiperData(newTarget.year, newTarget.month);
    }, 280); 
  },

  updateDetailCard(y, m, d) {
    const detailHoliday = HolidayUtils.getHolidays(y, m, d);
    const detailLunar = LunarUtils.getLunar(y, m, d);

    this.setData({ 
      selectedDetail: {
        holiday: detailHoliday,
        lunar: detailLunar
      }
    });
  },

  onTapDay(e) {
    const dateStr = e.currentTarget.dataset.date;
    const [y, m, d] = dateStr.split('-').map(str => parseInt(str, 10));
    this.setData({ selectedDate: dateStr });
    this.updateDetailCard(y, m, d);
  },

  backToToday() {
    this.initCalendar(new Date());
  },

  showDatePicker() {
    const yIndex = this.data.currentYear - YEARS_START;
    const mIndex = this.data.currentMonth - 1;
    this.setData({ 
      showPicker: true,
      pickerValue: [yIndex, mIndex],
      tempPickerValue: [yIndex, mIndex]
    });
  },

  hideAllPopups() {
    this.setData({ showPicker: false, showPTO: false });
  },

  onPickerChange(e) {
    this.setData({ tempPickerValue: e.detail.value });
  },

  confirmDate() {
    const temp = this.data.tempPickerValue;
    const targetYear = this.data.years[temp[0]];
    const targetMonth = this.data.months[temp[1]];
    
    const newDateStr = `${targetYear}-${targetMonth.toString().padStart(2, '0')}-01`;

    this.setData({
      showPicker: false,
      _currentYear: targetYear,
      _currentMonth: targetMonth,
      currentYear: targetYear,
      currentMonth: targetMonth,
      selectedDate: newDateStr,
      pickerValue: temp 
    });

    this.refreshSwiperData(targetYear, targetMonth);
    this.updateDetailCard(targetYear, targetMonth, 1);
  },

  openPTO() {
    this.setData({ 
      showPTO: true,
      ptoStart: this.data.selectedDate,
      ptoEnd: this.data.selectedDate,
      ptoResult: null 
    });
  },

  changeRegion(e) {
    this.setData({ 
      ptoRegion: e.currentTarget.dataset.region,
      ptoResult: null
    });
  },

  onPTOStartChange(e) { this.setData({ ptoStart: e.detail.value, ptoResult: null }); },
  onPTOEndChange(e) { this.setData({ ptoEnd: e.detail.value, ptoResult: null }); },

  triggerCalcPTO() {
    const { ptoStart, ptoEnd, ptoRegion } = this.data;
    
    const PTOUtils = require('../../utils/pto.js'); 
    const result = PTOUtils.calculatePTO(ptoStart, ptoEnd, ptoRegion);
    
    if (result.error) {
      wx.showToast({ title: result.error, icon: 'error', duration: 2000 });
      return;
    }
    
    this.setData({ ptoResult: result });
  }
});
