function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

//日期增加天数
function addDate(date, days) {

  if (days == undefined || days == '') {
    days = 0;
  }
  var mydata = date.replace(/-/g, '/');
  var date = new Date(mydata);

  console.log(date)

  date.setDate(date.getDate() + days);
  var month = date.getMonth() + 1;
  var day = date.getDate();
  var mm = "'" + month + "'";
  var dd = "'" + day + "'";

  //单位数前面加0
  if (mm.length == 3) {
    month = "0" + month;
  }
  if (dd.length == 3) {
    day = "0" + day;
  }


  var time = date.getFullYear() + "-" + month + "-" + day
  return time;
}

//比较两个日期大小
function dateTab(date1, date2) {
  return new Date(date1).getTime() > new Date(date2).getTime() ? true : false;
}

module.exports = {
  formatTime: formatTime,
  addDate: addDate,
  dateTab: dateTab
}
