const HolidayUtils = require('../../utils/holiday.js');

Page({
  data: {
    regions: [
      { name: '中国🇨🇳', code: 'CN' },
      { name: '美国🇺🇸', code: 'US' },
      { name: '巴西🇧🇷', code: 'BR' }
    ],
    selectedRegion: 'BR',
    weekStarts: [
      { name: '周一', value: 1 },
      { name: '周日', value: 0 }
    ],
    selectedWeekStart: 1,
    holidayInfoStr: '',
    editCountry: '中国',
    editYear: '2026',
    availableCountries: ['中国', '美国', '巴西'],
    availableYears: ['2025', '2026']
  },

  onShow() {
    const selectedRegion = wx.getStorageSync('selectedRegion') || 'BR';
    const selectedWeekStart = wx.getStorageSync('weekStart') === 0 ? 0 : 1; 
    this.setData({ selectedRegion, selectedWeekStart });
    this.refreshEditor();
  },

  selectRegion(e) {
    const code = e.currentTarget.dataset.code;
    this.setData({ selectedRegion: code });
    wx.setStorageSync('selectedRegion', code);
    wx.showToast({ title: '地区已更新', icon: 'success' });
  },

  selectWeekStart(e) {
    const val = parseInt(e.currentTarget.dataset.val, 10);
    this.setData({ selectedWeekStart: val });
    wx.setStorageSync('weekStart', val);
    wx.showToast({ title: '起始日已更新', icon: 'success' });
  },

  refreshEditor() {
    const fullInfo = HolidayUtils.getHolidayInfo();
    const country = this.data.editCountry;
    const year = this.data.editYear;
    
    // Ensure structure exists
    if (!fullInfo[country]) fullInfo[country] = {};
    if (!fullInfo[country][year]) fullInfo[country][year] = { holidays: [], extraWorkdays: [] };
    
    // Update available years list
    const years = Object.keys(fullInfo[country]).sort((a, b) => b - a);
    
    this.setData({ 
      holidayInfoStr: JSON.stringify(fullInfo[country][year], null, 2),
      availableYears: years
    });
  },

  onCountryChange(e) {
    const country = this.data.availableCountries[e.detail.value];
    this.setData({ editCountry: country }, () => {
      // Pick the latest year for this country by default
      const fullInfo = HolidayUtils.getHolidayInfo();
      const years = Object.keys(fullInfo[country] || {}).sort((a, b) => b - a);
      if (years.length > 0) {
        this.setData({ editYear: years[0] }, () => this.refreshEditor());
      } else {
        this.refreshEditor();
      }
    });
  },

  onYearChange(e) {
    const year = this.data.availableYears[e.detail.value];
    this.setData({ editYear: year }, () => this.refreshEditor());
  },

  addNewYear() {
    wx.showModal({
      title: '新增年份',
      placeholderText: '请输入年份(如2027)',
      editable: true,
      success: (res) => {
        if (res.confirm && res.content) {
          const year = res.content.trim();
          if (/^\d{4}$/.test(year)) {
            this.setData({ editYear: year }, () => this.refreshEditor());
          } else {
            wx.showToast({ title: '年份格式错误', icon: 'none' });
          }
        }
      }
    });
  },

  onHolidayInput(e) {
    this.setData({ holidayInfoStr: e.detail.value });
  },

  saveHolidayInfo() {
    try {
      const yearData = JSON.parse(this.data.holidayInfoStr);
      const fullInfo = JSON.parse(JSON.stringify(HolidayUtils.getHolidayInfo())); // Deep clone
      
      const country = this.data.editCountry;
      const year = this.data.editYear;
      
      if (!fullInfo[country]) fullInfo[country] = {};
      fullInfo[country][year] = yearData;
      
      HolidayUtils.updateHolidayInfo(fullInfo);
      wx.showToast({ title: '年份数据保存成功', icon: 'success' });
    } catch (e) {
      wx.showModal({
        title: '格式错误',
        content: 'JSON格式不正确。',
        showCancel: false
      });
    }
  },

  copyToClipboard() {
    wx.setClipboardData({
      data: this.data.holidayInfoStr,
      success: () => {
        wx.showToast({ title: '已复制到剪贴板', icon: 'success' });
      }
    });
  },

  importFromClipboard() {
    wx.getClipboardData({
      success: (res) => {
        if (res.data) {
          try {
            const parsed = JSON.parse(res.data);
            this.setData({ holidayInfoStr: JSON.stringify(parsed, null, 2) });
            wx.showToast({ title: '导入成功，请保存', icon: 'success' });
          } catch (e) {
            wx.showModal({
              title: '导入失败',
              content: '剪贴板内容不是有效的 JSON 格式。',
              showCancel: false
            });
          }
        } else {
          wx.showToast({ title: '剪贴板为空', icon: 'none' });
        }
      }
    });
  },

  resetHolidayInfo() {
    wx.showModal({
      title: '重置确认',
      content: '确定要恢复默认休假数据吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('customHolidayInfo');
          // Reload from file (the let will be reset on next restart, or we can force reload)
          wx.reLaunch({ url: '/pages/calendar/calendar' });
        }
      }
    });
  }
});
