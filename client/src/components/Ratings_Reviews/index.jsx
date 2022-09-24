import React, { useState, useEffect, useContext } from "react";
import Ratings from "./Ratings/RatingsOverview.jsx";
import ReviewList from "./Reviews/ReviewList.jsx";
// import { config } from "../../../../env/config.js";
import axios from "axios";
import RatingsOverview from "./Ratings/RatingsOverview.jsx";
import styled from "styled-components";
import { ClickTracker } from "../App.jsx";

const config = {
  baseURL: "http://54.162.76.39",
};

const Ratings_Reviews = (props) => {
  const clickTracker = useContext(ClickTracker);
  const [reviews, setReviews] = useState([]);
  const [meta, setMeta] = useState({});

  const [filter, setFilter] = useState("relavant");
  const [starFilter, setStarFilter] = useState({
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
  });

  const [starCount, setStarCount] = useState({
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    total: 0,
  });
  const [overallRating, setOverallRating] = useState(0);
  const [recommend, setReccomend] = useState(0);

  const resetStars = () => {
    setStarFilter({
      1: false,
      2: false,
      3: false,
      4: false,
      5: false,
    });
  };

  const toggleStar = (value) => {
    setStarFilter({ ...starFilter, [value]: !starFilter[value] });
  };

  const filterReviews = (reviews) => {
    let starArray = [];
    let starSort = false;
    for (var key in starFilter) {
      if (starFilter[key] === true) {
        starArray.push(Number(key));
        starSort = true;
      }
    }

    if (starSort === true) {
      var newData = reviews.filter((review) => {
        return starArray.includes(review.rating);
      });
      setReviews(newData);
    } else {
      setReviews(reviews);
    }
  };

  const getReviewData = () => {
    axios
      .get(
        `/reviews?product_id=${props.id}&count=${100}&sort=${filter}`,
        config
      )
      .then((response) => filterReviews(response.data.results))
      .catch((err) => console.log(err));
  };

  const getRecc = (recc) => {
    const yes = Number(recc.true) || 0;
    const no = Number(recc.false) || 0;
    setReccomend(Math.round((yes / (yes + no)) * 100));
  };

  const countStars = (ratings) => {
    let total = ["1", "2", "3", "4", "5"].reduce((stars, num) => {
      if (ratings[num]) {
        stars += Number(ratings[num]);
      }
      return stars;
    }, 0);

    let overall =
      ["1", "2", "3", "4", "5"].reduce((stars, num) => {
        if (ratings[num]) {
          stars += Number(ratings[num]) * Number(num);
        }
        return stars;
      }, 0) / total;

    setStarCount({
      ...starCount,
      1: Number(ratings["1"]) || 0,
      2: Number(ratings["2"]) || 0,
      3: Number(ratings["3"]) || 0,
      4: Number(ratings["4"]) || 0,
      5: Number(ratings["5"]) || 0,
      total: total,
    });
    setOverallRating(Math.round(overall * 10) / 10);
  };

  const getMetaData = () => {
    axios
      .get(`/reviews/meta?product_id=${props.id}`, config)
      .then((response) => {
        setMeta(response.data);
        getRecc(response.data.recommended);
        countStars(response.data.ratings);
      })
      .catch((err) => console.log(err));
  };

  const postData = (data) => {
    axios.post("/reviews", data, config).then(() => {
      getReviewData();
    });
  };

  useEffect(() => {
    getReviewData();
    getMetaData();
  }, [props.id, filter, starFilter]);

  return (
    <div id="Ratings_Reviews" onClick={(e) => clickTracker(e, "R&R")}>
      <h1>Ratings & Reviews</h1>
      <Container>
        <RatingsOverview
          stars={starCount}
          average={overallRating}
          recc={recommend}
          meta={meta.characteristics}
          starFilter={starFilter}
          toggleStar={toggleStar}
          reset={resetStars}
        />
        <ReviewList
          reviews={reviews}
          meta={meta.characteristics}
          sort={setFilter}
          post={postData}
          id={props.id}
        />
      </Container>
    </div>
  );
};

export default Ratings_Reviews;

const Container = styled.div`
display: flex;
width: 800px;
@media (max-width: 768px) {
  flex-direction: column;
}
`;
