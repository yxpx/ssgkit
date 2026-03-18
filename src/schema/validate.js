import fs from "node:fs";
import path from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const schemaPath = path.resolve("src/schema/content-schema.json");
const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);

const validate = ajv.compile(schema);

export function validateFrontmatter(meta) {
  const valid = validate(meta);
  return {
    valid,
    errors: valid ? [] : validate.errors || []
  };
}
