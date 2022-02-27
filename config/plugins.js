module.exports = ({ env }) => ({
  "website-builder": {
    enabled: true,
    config: {
      url: env("WEBSITE_BUILDER_URL", ""),
      headers: {
        "Content-Type": "application/json",
        "X-GitHub-Event": "push",
        "X-Hub-Signature": env("WEBSITE_BUILDER_SIGNATURE", ""),
        "X-Hub-Signature-256": env("WEBSITE_BUILDER_SIGNATURE_256", ""),
      },
      body: {
        ref: "refs/heads/main",
      },
      trigger: {
        type: "manual",
      },
    },
  },
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
});
