import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { config } from "../../../../env/config.js";
import QuestionForm from "./QuestionForm.jsx";
import Question from "./Question.jsx";
import SearchQandA from "./SearchQandA.jsx";
import questList from "./qAndA.js";
import { Button } from "../../styleComponents.jsx";
import { ClickTracker } from "../App.jsx";

const QuestionList = ({ product }) => {
  // variables
  const { id } = product;

  // context
  const clickTracker = useContext(ClickTracker);

  // state
  const [qList, setQList] = useState([]);
  const [filtList, setFiltList] = useState([]);
  const [showQForm, setShowQForm] = useState(false);

  // on load
  useEffect(() => {
    axios
      .get(`/qa/questions?product_id=${id}&count=100`, config)
      .then((response) => {
        response.data.results.sort(
          (a, b) => b.question_helpfulness - a.question_helpfulness
        );
        // tracker
        response.data.results.forEach((q) => {
          let exists = questList.find(
            (quest) => quest.question_id === q.question_id
          );
          if (!exists) {
            q.prodID = id;
            q.helpf_click = false;
            for (const id in q.answers) {
              q.answers[id].helpf_click = false;
              q.answers[id].reported = false;
            }
            questList.push(q);
          }
        });
        setQList(response.data.results.slice(0, 2));
        setFiltList(response.data.results.slice(0, 2));
      })
      .catch((err) => console.log(err));
  }, [product]);

  // methods
  let list = questList.filter((q) => q.prodID === id);
  list.sort((a, b) => b.question_helpfulness - a.question_helpfulness);

  const search = (event) => {
    let query = event.target.value;
    if (query.length > 2) {
      let filtQ = list.filter((ques) => {
        let ans = ques.answers;
        for (let id in ans) {
          if (ans[id].body.toLowerCase().includes(query.toLowerCase()))
            return true;
        }
        return ques.question_body.toLowerCase().includes(query.toLowerCase());
      });
      filtQ.sort((a, b) => b.question_helpfulness - a.question_helpfulness);
      setFiltList(filtQ);
    } else {
      setFiltList(qList);
    }
  };

  const expandQs = (event) => {
    // let last = filtList.length;
    // setQList(list.slice(0, last + 2));
    // setFiltList(list.slice(0, last + 2));
    setQList(list);
    setFiltList(list);
    window.location.href = "#QA";
    history.pushState({}, "", window.location.origin);
  };

  return (
    <div onClick={(e) => clickTracker(e, "Q&A")}>
      <h3 id="QA">{"QUESTIONS & ANSWERS"}</h3>
      <SearchQandA search={search} />
      <div className="qList">
        {filtList.map((question) => (
          <Question
            question={question}
            product={product}
            key={question.question_id}
          />
        ))}
      </div>
      <div>
        {filtList.length < list.length ? (
          <Button onClick={expandQs}>MORE ANSWERED QUESTIONS</Button>
        ) : null}
        <Button
          style={{ marginLeft: "25px" }}
          onClick={() => setShowQForm(!showQForm)}
        >
          ADD A QUESTION +
        </Button>
      </div>
      {showQForm ? (
        <QuestionForm product={product} setShowQForm={setShowQForm} />
      ) : null}
    </div>
  );
};

export default QuestionList;
