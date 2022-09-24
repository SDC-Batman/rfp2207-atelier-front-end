import React, { useState, useEffect } from "react";
import Stars from '../Stars.jsx'
import { parseISO } from "date-fns";
import { FaStar, FaCheck } from 'react-icons/fa';
import axios from "axios";
// import {config} from "../../../../../env/config.js";
import styled from "styled-components";
import {
  ModalClose,
  ModalImg,
  Modal,
  ModalOverlay,
} from "../../../styleComponents.jsx";

const config = {
  baseURL: "http://54.162.76.39",
};

const ReviewCard = ({ review, helpfullClicks, setHelpfullClicks}) => {
  const [helpfullness, setHelpfullness] = useState(review.helpfulness)
  const [reportClicked, setReportClicked] = useState(false)
  const [seeMore, setSeeMore] = useState(true)
  const [modal, setModal] = useState(false)

  useEffect(() => {
    setHelpfullness(review.helpfulness)
  }, [review.helpfulness])

  const formatDate = (date) => {
    date = parseISO(date).toLocaleDateString("en-us", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    return date;
  };

  const formatBody = (body) => {
    if (seeMore === true) {
      if (body.length > 251) {
        return body.slice(0, 251) + '...'
      }
    } else return body
    return body
  }

  const images = review.photos.map((photo) => {
    return (
      <img
        src={photo.url}
        key={photo.id}
        onClick={(e) => setModal(e.target.src)}
        className="ansPhotos"
        onError={(e) => {
          e.target.src =
            "https://www.cnet.com/a/img/resize/905e1d3662ccaaf4763408156c833b91a47dfd07/2020/08/31/9562c49a-8f37-434d-8070-2751fb03d683/will-smith-fresh-prince-bel-air.jpg?auto=webp&fit=crop&height=900&width=1200";
          e.target.onError = null
      }}/>
    )
  })

  const helpful = () => {
    if (helpfullClicks[review.review_id] === undefined) {
      axios.put(`/reviews/${review.review_id}/helpful`, {}, config)
        .then(() => {
          setHelpfullness(helpfullness + 1)
          setHelpfullClicks({...helpfullClicks, [review.review_id] : true})
        })
        .catch((err) => console.log(err))
    }
  }

  const report = () => {
    if (!reportClicked) {
      axios.put(`/reviews/${review.review_id}/report`, {}, config)
      .then(() => setReportClicked(true))
      .catch((err) => console.log(err))
    }
  }

  return (
    <ReviewCardDiv>
      {modal ? (
        <ModalOverlay onClick={() => setModal(false)}>
          <Modal>
            <ModalImg src={modal} className="modalImg" />
            <ModalClose className="modalClose" onClick={() => setModal(false)}>X</ModalClose>
          </Modal>
        </ModalOverlay>
      ) : null}
      <Flex>
        <Stars rating={review.rating}/>
        <User>{review.reviewer_name}, {formatDate(review.date)}</User>
      </Flex>

      <Body>
        <Summary>{review.summary}</Summary>
      </Body>
      <Body>
        <p>{formatBody(review.body)}</p>
        {review.body.length > 251 && seeMore && <p onClick={() => setSeeMore(false)}>See More</p>}
      </Body>


      <div>{images}</div>
      {review.recommend && <p><FaCheck /> I recommend this product</p>}
      {review.response !== null &&
      <Response>
        <h4>Response:</h4>
        <p>{review.response}</p>
      </Response>}

      <p>Helpful? <span onClick={helpful} className='clickable'>Yes </span>{`(${helpfullness}) | `}<span onClick={report} className='clickable'>Report</span></p>
    </ReviewCardDiv>
  );
};

export default ReviewCard;

const ReviewCardDiv = styled.div`
border-bottom: 2px solid black;
width: 800px;
`;

const Flex = styled.div`
display: flex;
justify-content: space-between
`;

const User = styled.p`
margin-right: 10px;
`

const Body = styled.div`
max-width: 700px;
word-wrap: break-word;
`

const Summary = styled.h3`
margin: 3px 0px 8px 0px;
`

const Response = styled.div`
width: auto;
padding: 1px 10px 1px 10px;
background: #e0e0e0;
`