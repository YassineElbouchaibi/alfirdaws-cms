module.exports = {
  graphql: {
    config: {
      endpoint: "/graphql",
      shadowCRUD: true,
      playgroundAlways: false,
      depthLimit: 14,
      amountLimit: 100,
      apolloServer: {
        tracing: true,
      },
    },
  },
};
