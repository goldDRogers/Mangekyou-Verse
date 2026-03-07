const slugify = (text) => text.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

module.exports = { slugify, sleep };
