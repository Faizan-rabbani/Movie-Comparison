const autocompleteConfig = {
  renderOption(movie) {
    const imgSrc = movie.Poster === "N/A" ? "" : movie.Poster;
    return `
        <img src = "${imgSrc}"/>
        ${movie.Title}
        (${movie.Year})`;
  },
  inputValue(movie) {
    return movie.Title;
  },
  async fetchData(searchTerm) {
    const response = await axios.get("https://www.omdbapi.com/", {
      params: {
        apikey: "559cecce",
        s: searchTerm,
      },
    });

    if (response.data.Error) {
      return [];
    }
    return response.data.Search;
  },
};

createAutoComplete({
  ...autocompleteConfig,
  root: document.querySelector("#left-autocomplete"),
  onSelectOption(movie) {
    document.querySelector(".tutorial").classList.add("is-hidden");
    onMovieSelect(movie, document.querySelector("#left-summary"), "left");
  },
});
createAutoComplete({
  ...autocompleteConfig,
  root: document.querySelector("#right-autocomplete"),
  onSelectOption(movie) {
    document.querySelector(".tutorial").classList.add("is-hidden");
    onMovieSelect(movie, document.querySelector("#right-summary"), "right");
  },
});

let leftMovie;
let rightMovie;

const onMovieSelect = async (movie, summaryElement, side) => {
  const response = await axios.get("https://www.omdbapi.com/", {
    params: {
      apikey: "559cecce",
      i: movie.imdbID,
    },
  });

  summaryElement.innerHTML = movieTemplate(response.data);
  if (side === "left") {
    leftMovie = response.data;
  } else {
    rightMovie = response.data;
  }
  if (leftMovie && rightMovie) {
    runComparison();
  }
};

const runComparison = () => {
  const leftSideStats = document.querySelectorAll('#left-summary .notification');
  const rightSideStats = document.querySelectorAll('#right-summary .notification');

  leftSideStats.forEach((leftStat, index) => {
    const rightStat = rightSideStats[index];

    const leftValue = parseInt(leftStat.dataset.value);
    const rightValue = parseInt(rightStat.dataset.value);

    leftStat.classList.remove('is-warning', 'is-primary');
    rightStat.classList.remove('is-warning', 'is-primary');

    if (isNaN(leftValue) || isNaN(rightValue)) {
      leftStat.classList.add('is-primary');
      rightStat.classList.add('is-primary');
    } else if (leftValue > rightValue) {
      leftStat.classList.add('is-primary');
      rightStat.classList.add('is-warning');
    } else if (rightValue > leftValue) {
      rightStat.classList.add('is-primary');
      leftStat.classList.add('is-warning');
    } else {
      leftStat.classList.add('is-primary');
      rightStat.classList.add('is-primary');
    }
  });
};


const movieTemplate = (movieDetail) => {
  const dollars = parseInt(
    movieDetail.BoxOffice.replace(/\$/g, "").replace(/,/g, "")
  );
  const metascore = parseInt(movieDetail.Metascore);
  const imdbrating = parseFloat(movieDetail.imdbRating);
  const imdbvotes = parseInt(movieDetail.imdbVotes.replace(/,/g, ""));
  const awards = movieDetail.Awards.split(' ').reduce((prev,word) => {
    const value = parseInt(word);
    if(isNaN(value)){
      return prev;
    }
    else{
      return prev + value;
    }
  },0)

  return `
    <article class = "media">
        <figure class = "media-left">
            <p class = "image">
                <img src = "${movieDetail.Poster}"/>
            </p>
        </figure>
        <div class = "media-content">
            <div class = "content">
                <h1>${movieDetail.Title}</h1>
                <h4>${movieDetail.Genre}</h4>
                <p>${movieDetail.Plot}</p>
            </div>
        </div>
    </article>
    <article data-value =${awards} class = "notification is-primary">
        <p class = "title">${movieDetail.Awards}</p>  
        <p class = "subtitle">Awards</p>
    </article>
    <article data-value =${dollars} class = "notification is-primary">
        <p class = "title">${movieDetail.BoxOffice}</p>  
        <p class = "subtitle">Box Office</p>
    </article>
    <article data-value =${metascore} class = "notification is-primary">
        <p class = "title">${movieDetail.Metascore}</p>  
        <p class = "subtitle">MetaScore</p>
    </article>
    <article  data-value =${imdbrating} class = "notification is-primary">
        <p class = "title">${movieDetail.imdbRating}</p>  
        <p class = "subtitle">IMDB Rating</p>
    </article>
    <article  data-value =${imdbvotes} class = "notification is-primary">
        <p class = "title">${movieDetail.imdbVotes}</p>  
        <p class = "subtitle">IMDB Votes</p>
    </article>`;
};
