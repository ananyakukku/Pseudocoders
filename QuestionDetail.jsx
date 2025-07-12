import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchQuestion, voteQuestion } from '../../services/questions';
import AnswerList from '../Answers/AnswerList';

const QuestionDetail = () => {
  const { id } = useParams();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadQuestion = async () => {
      const { data } = await fetchQuestion(id);
      setQuestion(data);
      setLoading(false);
    };
    loadQuestion();
  }, [id]);

  const handleVote = async (voteType) => {
    try {
      const { data } = await voteQuestion(id, voteType);
      setQuestion(data);
    } catch (error) {
      console.error('Voting failed:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>{question.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: question.body }} />
      
      <div>
        <VoteButtons 
          votes={question.votes} 
          onVote={handleVote}
        />
        <span>Asked by {question.author.username}</span>
      </div>
      
      <h2>{question.answers.length} Answers</h2>
      <AnswerList answers={question.answers} questionId={id} />
    </div>
  );
};

export default QuestionDetail;