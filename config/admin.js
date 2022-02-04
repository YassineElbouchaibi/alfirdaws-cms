module.exports = ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET', '34bf6f32f7491fc62e198d7a7d396f71'),
  },
});
