import axios from "axios";
import * as fs from "fs";

const baseURL = "https://ophim1.com/danh-sach/phim-moi-cap-nhat?page=";
const pathMovie = "https://ophim1.com/phim/";

const getMoviesPerPage = async (page) => {
  const slugs = await getSlugsPerPage(page);
  console.log("Crawling page " + page + "...");
  const movies = await getMoviesFromSlugs(slugs);
  writeFile(movies);
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
    poster_url,
    type,
    year,
    country,
    content,
    quality,
    lang,
    category,
  } = data.movie;

  const categoryNames = category.map(({ name }) => name);

  if (categoryNames.includes("Phim 18+")) return;
  return {
    id,
    name,
    origin_name,
    thumb_url,
    poster_url,
    type,
    slug,
    year,
    country: country.map(({ name }) => name),
    content: content.replace(/<\/*p>/g, ""),
    quality,
    lang,
    category: categoryNames,
  };
};

const writeFile = (content) => {
  fs.appendFileSync("movies.json", JSON.stringify(content));
};

const delay = (duration) => {
  return new Promise((resolve) => setTimeout(resolve, duration));
};

const crawl = async (numberOfPages) => {
  let index = 1;
  while (index <= numberOfPages) {
    await getMoviesPerPage(index);
    await delay(1000);
    index += 1;
  }

  console.log("Completed!");
};

crawl(100);
