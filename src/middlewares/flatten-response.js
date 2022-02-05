const fs = require("fs");

const normalize = (data) => {
  const isObject = (data) =>
    Object.prototype.toString.call(data) === "[object Object]";
  const isArray = (data) =>
    Object.prototype.toString.call(data) === "[object Array]";

  const flatten = (data) => {
    if (!data.attributes) return data;

    return {
      id: data.id,
      ...data.attributes,
    };
  };

  if (isArray(data)) {
    return data.map((item) => normalize(item));
  }

  if (isObject(data)) {
    if (isArray(data.data)) {
      data = [...data.data];
    } else if (isObject(data.data)) {
      data = flatten({ ...data.data });
    } else if (data.data === null) {
      data = null;
    } else {
      data = flatten(data);
    }

    for (const key in data) {
      data[key] = normalize(data[key]);
    }

    return data;
  }

  return data;
};

const fixTypeDefName = (name) => {
  name = name.replace("RelationResponseCollection", "s");
  name = name.replace("EntityResponseCollection", "s");
  name = name.replace("EntityResponse", "");
  name = name.replace("Entity", "");

  return name;
};

const fixTypeRefName = (typeDef) => {
  if (
    typeDef.name != null &&
    typeDef.name.endsWith("EntityResponseCollection")
  ) {
    typeDef.ofType = {
      kind: "NON_NULL",
      name: null,
      ofType: {
        kind: "OBJECT",
        name: typeDef.name.replace("EntityResponseCollection", ""),
        ofType: null,
      },
    };
    typeDef.kind = "LIST";
    typeDef.name = null;

    return typeDef;
  }

  if (typeDef.ofType != null) {
    typeDef.ofType = fixTypeRefName(typeDef.ofType);
  }

  if (typeDef.name != null) {
    typeDef.name = fixTypeDefName(typeDef.name);
  }

  return typeDef;
};

const fixTypeDef = (typeDef) => {
  const fixedType = {
    ...typeDef,
    name: fixTypeDefName(typeDef.name),
  };

  fixedType.fields = typeDef.fields.map((y) => ({
    ...y,
    type: {
      ...fixTypeRefName(y.type),
    },
  }));

  return fixedType;
};

const respond = async (ctx, next) => {
  await next();

  // REST API response
  if (ctx.url.startsWith("/api")) {
    console.log(
      `API request (${ctx.url}) detected, transforming response json...`
    );
    ctx.response.body = {
      data: flatten(ctx.response.body.data),
      meta: ctx.response.body.meta,
    };
    return;
  }

  // GraphQL Response for Apollo Codegen script
  if (
    ctx.url.startsWith("/graphql") &&
    ctx.request.headers.apollocodegen === "true"
  ) {
    const parsedBody = JSON.parse(ctx.response.body);
    parsedBody.data.__schema.types = parsedBody.data.__schema.types
      .filter((x) => !x.name.endsWith("Entity"))
      .filter((x) => !x.name.endsWith("EntityResponse"))
      .filter((x) => !x.name.endsWith("EntityResponseCollection"))
      .map((x) => {
        if (x.fields == null) return x;
        if (x.name == null) return x;

        if (x.name === "Query" || x.name === "Mutation") {
          return {
            ...x,
            fields: x.fields.map((y) => ({
              ...y,
              type: {
                ...fixTypeRefName(y.type),
              },
            })),
          };
        }

        return fixTypeDef(x);
      });

    // Uncomment to Debug: Dump parsedBody to a file
    // fs.writeFileSync("./schema.json", JSON.stringify(parsedBody, null, 2));

    ctx.response.body = parsedBody;
    return;
  }

  // GraphQL Response for Apollo Client
  if (
    ctx.url.startsWith("/graphql") &&
    ctx.request.headers.normalize === "true"
  ) {
    const parsedBody = JSON.parse(ctx.response.body);

    if (parsedBody.data.__schema !== undefined) {
      return;
    }

    console.log(
      `API request (${ctx.url}) detected, transforming response json...`
    );

    ctx.response.body = {
      data: normalize(parsedBody.data),
      meta: parsedBody.meta,
    };
    return;
  }
};

module.exports = () => respond;
