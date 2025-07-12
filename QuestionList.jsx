import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchQuestions } from '../../services/questions';
import VoteButtons from './VoteButtons';

const QuestionList = () => {
  const [questions, setQuestions] = useState([]);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('-createdAt');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const loadQuestions = async () => {
      const { data } = await fetchQuestions(page, sort, search);
      setQuestions(data.questions);
    };
    loadQuestions();
  }, [page, sort, search]);

  return (
    <div>
      <div>
        <input
          type="text"
          placeholder="Search questions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="-createdAt">Newest</option>
          <option value="createdAt">Oldest</option>
          <option value="-votes">Most Votes</option>
        </select>
      </div>
      
      {questions.map((question) => (
        <div key={question._id}>
          <Link to={`/questions/${question._id}`}>
            <h3>{question.title}</h3>
          </Link>
          <p>{question.body.substring(0, 100)}...</p>
          <div>
            <VoteButtons 
              votes={question.votes} 
              onVote={(voteType) => handleVote(question._id, voteType)}
            />
            <span>{question.answers.length} answers</span>
          </div>
          <div>
            {question.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default QuestionList;