const fetch = require('node-fetch');
const fs = require('fs');

/**
 *
 * This script will create the autogenerated MDX files for each component.
 *
 * Creates files for:
 * - Properties
 * - Events
 * - Methods
 * - CSS Shadow Parts
 * - Custom Properties
 * - Slots
 *
 * The auto-generated directory & files should be gitignored, since they are created from the published core.json
 * and should never be edited manually.
 */

(async function () {
  const response = require('./data/translated-api.json');
  const { components } = response;

  const names = components.map((component) => component.tag.slice(4));
  // matches all relative markdown links to a component, e.g. (../button)
  COMPONENT_LINK_REGEXP = new RegExp(`\\(../(${names.join('|')})/?(#[^)]+)?\\)`, 'g');

  components.forEach((comp) => {
    const compTag = comp.tag.slice(4);
    writeAutoGeneratedPage(compTag, 'props', renderProperties(comp));
    writeAutoGeneratedPage(compTag, 'events', renderEvents(comp));
    writeAutoGeneratedPage(compTag, 'methods', renderMethods(comp));
    writeAutoGeneratedPage(compTag, 'parts', renderParts(comp));
    writeAutoGeneratedPage(compTag, 'custom-props', renderCustomProps(comp));
    writeAutoGeneratedPage(compTag, 'slots', renderSlots(comp));
  });
})();

function writeAutoGeneratedPage(componentTag, fileName, data) {
  const dir = `./static/auto-generated/${componentTag}`;
  const path = `${dir}/${fileName}.md`;
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path, data);
}

/**
 * Formats line breaks in a multiline string to be displayed in a table.
 * @param {*} str The string to format
 * @returns The formatted string
 */
function formatMultiline(str) {
  return str.split('\n\n').join('<br /><br />').split('\n').join(' ');
}

function renderProperties({ props: properties }) {
  if (properties.length === 0) {
    return '';
  }

  // NOTE: replaces | with U+FF5C since MDX renders \| in tables incorrectly
  return `
## Properties

${properties
  .map(
    (prop) => `
### ${prop.name}

| | |
| --- | --- |
| **Description** | ${formatMultiline(prop.docs)} |
| **Attribute** | \`${prop.attr}\` |
| **Type** | \`${prop.type.replace(/\|/g, '\uff5c')}\` |
| **Default** | \`${prop.default}\` |

`
  )
  .join('\n')}
`;
}

function renderEvents({ events }) {
  if (events.length === 0) {
    return '';
  }

  return `
## Events

| Name | Description |
| --- | --- |
${events.map((event) => `| \`${event.event}\` | ${formatMultiline(event.docs)} |`).join('\n')}

`;
}

function renderMethods({ methods }) {
  if (methods.length === 0) {
    return '';
  }

  // NOTE: replaces | with U+FF5C since MDX renders \| in tables incorrectly
  return `
## Methods

${methods
  .map(
    (method) => `
### ${method.name}

| | |
| --- | --- |
| **Description** | ${formatMultiline(method.docs)} |
| **Signature** | \`${method.signature.replace(/\|/g, '\uff5c')}\` |
`
  )
  .join('\n')}

`;
}

function renderParts({ tag, parts }) {
  if (parts.length === 0) {
    return '';
  }

  return `
## CSS Shadow Parts

| Name | Description |
| --- | --- |
${parts.map((prop) => `| \`${prop.name}\` | ${formatMultiline(prop.docs)} |`).join('\n')}

`;
}

function renderCustomProps({ styles: customProps }) {
  if (customProps.length === 0) {
    return '';
  }

  return `
## CSS Custom Properties

| Name | Description |
| --- | --- |
${customProps.map((prop) => `| \`${prop.name}\` | ${formatMultiline(prop.docs)} |`).join('\n')}

`;
}

function renderSlots({ slots }) {
  if (slots.length === 0) {
    return '';
  }

  return `
## Slots

| Name | Description |
| --- | --- |
${slots.map((slot) => `| \`${slot.name}\` | ${formatMultiline(slot.docs)} |`).join('\n')}

`;
}
