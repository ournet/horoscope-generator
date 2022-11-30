export default {
  info(...meta: any[]) {
    console.log(...meta);
  },
  warn(...meta: any[]) {
    console.warn(...meta);
  },
  error(...meta: any[]) {
    console.error(...meta);
  }
};
