import axios from "axios";
import * as fs from "fs";

const baseURL = "https://ophim1.com/danh-sach/phim-moi-cap-nhat?page=";
const pathMovie = "https://ophim1.com/phim/";

const pages = (from, to) =>
  Array.from({ length: to - from + 1 }, (_, i) => i + from);

const getMoviesPerPage = async (page) => {
  const slugs = await getSlugsPerPage(page);
  const movies = await getMoviesFromSlugs(slugs);
  writeFile(page, movies);
  console.log("Done page " + page);
};

const getSlugsPerPage = async (number) => {
  const { data } = await axios.get(baseURL + number);
  return data.items.map(({ slug }) => slug);
};

const getMoviesFromSlugs = (slugs) => {
  return Promise.all(slugs.map(fetchMovie));
};

const fetchMovie = async (slug) => {
  const { data } = await axios.get(pathMovie + slug);
  const {
    _id: id,
    name,
    origin_name,
    thumb_url,
    type,
    year,
    country,
    content,
    quality,
    lang,
    category,
    time,
  } = data.movie;

  return {
    id,
    name,
    origin_name,
    thumb_url,
    type,
    slug,
    year,
    country: country.map(({ name }) => name),
    content: content.replace(/<\/*p>/g, ""),
    quality,
    lang,
    category: category.map(({ name }) => name),
    time,
    // episodes: data.episodes[0].server_data.map(({ filename, link_embed }) => ({ name: filename, url: link_embed })),
  };
};

const writeFile = (name, content) => {
  fs.appendFileSync("movies.json", JSON.stringify(content));
};

(async () => {
  await Promise.all(pages(91, 100).map(getMoviesPerPage));
  console.log("Completed!");
})();
