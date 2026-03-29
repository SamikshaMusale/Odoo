import api from './api';

export const expenseService = {
  createExpense: async (expenseData) => {
    // expenseData: { amount, currency, category, description, receiptUrl, date }
    const response = await api.post('/expenses', expenseData);
    return response.data;
  },

  getMyExpenses: async () => {
    const response = await api.get('/expenses/my');
    return response.data;
  },

  getTeamExpenses: async () => {
    const response = await api.get('/expenses/team');
    return response.data;
  },

  getExpenseById: async (id) => {
    const response = await api.get(`/expenses/${id}`);
    return response.data;
  }
};
