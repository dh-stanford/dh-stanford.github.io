const CleanCSS = require("clean-css");
const { DateTime } = require("luxon");

const { renderMarkdown, extractExcerpt } = require("./lib/utils");

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("post-images");
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("projects/images");
  eleventyConfig.addPassthroughCopy({
    "node_modules/lunr/lunr.min.js": "assets/js/lunr.min.js",
  });

  eleventyConfig.addCollection("pages", (collectionApi) => {
    return collectionApi
      .getFilteredByGlob("./src/*.md")
      .sort(
        (a, b) => new Date(b.data.submitted_at) - new Date(a.data.submitted_at),
      );
  });

  eleventyConfig.addFilter(
    "cssmin",
    (code) => new CleanCSS({}).minify(code).styles,
  );

  eleventyConfig.addFilter("formatDate", (dateObj) => {
    // 11ty and the YAML parser default to converting dates to UTC (or
    //  assuming UTC if the TZ isn't specified) which affects all input dates.
    // However, all output dates are assumed to be in the local timezone...
    // (There is some hand-waving about it here:
    //  https://www.11ty.dev/docs/dates/#dates-off-by-one-day)
    return DateTime.fromJSDate(dateObj, { zone: "UTC" }).toLocaleString(
      DateTime.DATE_FULL,
    );
  });

  eleventyConfig.addShortcode("excerpt", (article) => extractExcerpt(article));

  eleventyConfig.addFilter("markdown", renderMarkdown);
  eleventyConfig.addPairedShortcode("markdown", renderMarkdown);

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    markdownTemplateEngine: "njk",
  };
};
