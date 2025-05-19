import { EventEmitter } from 'fbemitter';

// Chỉ sử dụng EventEmitter để nhận thông báo từ push notification
export const NotificationEvents = new EventEmitter();

// Thêm hàm trống để tránh lỗi import
export const startNotificationMonitoring = () => {
  console.log('NotificationMonitor: Monitoring disabled');
  return () => {};
};

export const stopNotificationMonitoring = () => {
  console.log('NotificationMonitor: Nothing to stop');
}; 