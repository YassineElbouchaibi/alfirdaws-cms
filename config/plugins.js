module.exports = ({ env }) => ({
  "website-builder": {
    enabled: true,
    config: {
      url: env("WEBSITE_BUILDER_URL", ""),
      headers: {
        "Content-Type": "application/json",
        "X-GitHub-Event": "push",
      },
      body: {
        ref: "refs/heads/main",
      },
      secret: {
        headerKey: "X-Hub-Signature",
        hash: "sha1",
        secretKey: env("WEBSITE_BUILDER_SECRET", ""),
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
