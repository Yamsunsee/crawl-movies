import axios from "axios";
import * as fs from "fs";

const baseURL = "https://ophim1.com/danh-sach/phim-moi-cap-nhat?page=";
const pathMovie = "https://ophim1.com/phim/";

const getMovies = async (numberOfPages) => {
  const slugs = await Promise.all(Array.from({ length: numberOfPages }, (_, i) => i + 1).map(getSlugsPerPage));
  const movies = await getMoviesFromSlugs(slugs.flat());
  return movies;
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

const writeFile = (content) => {
  fs.writeFileSync("test.json", JSON.stringify(content));
  console.log("Done!");
};

(async () => {
  const movies = await getMovies(1);
  writeFile(movies);
  console.log("Done!");
})();

