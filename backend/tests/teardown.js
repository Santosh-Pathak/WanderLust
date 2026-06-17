export default async () => {
  const mongoose = (await import('mongoose')).default;
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.close();
  }
};
