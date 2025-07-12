import API from './api.js';

export const fetchQuestions = (page, sort, search) => 
  API.get(`/questions?page=${page}&sort=${sort}&search=${search}`);

export const fetchQuestion = (id) => API.get(`/questions/${id}`);

export const createQuestion = (questionData) => 
  API.post('/questions', questionData);

export const voteQuestion = (id, voteType) => 
  API.post(`/questions/${id}/vote`, { voteType });