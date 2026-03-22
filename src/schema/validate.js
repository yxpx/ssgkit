import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import schema from "./content-schema.js";

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
